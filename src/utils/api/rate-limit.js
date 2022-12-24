import redis from './redis';
import requestIp from "request-ip";
import NextCors from "nextjs-cors";

export default async function checkRateLimit(req, res) {
    const ip = requestIp.getClientIp(req);
    const key = `ratelimit:${ip}`;
    const limit = 1;
    const ttl = 1;
    const timeout_limit = 10;
    const timeout_key = `${key}-timeout`

    const current = (await redis.get(key)) || 0;
    const timeout = (await redis.get(timeout_key)) || 0;

    await redis.set(key, current + 1, {
        ex: ttl,
        nx: true,
    });

    await NextCors(req, res, {
        // Options
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        origin: "*",
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    res.setHeader("X-RateLimit-Limit", ttl)
    res.setHeader("X-RateLimit-Remaining", 0)

    if (timeout >= timeout_limit) {
        res.setHeader("Retry-After", await redis.ttl(timeout_key));
        res.setHeader("X-RateLimit-Reset", await redis.ttl(timeout_key))
        res.status(429).json({
            code: 429,
            message:
                "You have exceeded the rate limit too many times. Retry in an hour.",
            success: false,
        });
        await redis.set(timeout_key, timeout + 1, {
            ex: 3600,
            nx: true
        })
        return false;
    } else if (current >= limit) {
        res.setHeader("Retry-After", ttl);
        res.setHeader("X-RateLimit-Reset", ttl)
        res.status(429).json({
            code: 429,
            message:
                "You have exceeded the rate limit. Please try again later.",
            success: false,
        });
        await redis.set(key, current + 1, {
            ex: ttl
        })
        return false;
    }

    return true;
}
