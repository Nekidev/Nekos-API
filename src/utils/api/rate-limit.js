import redis from './redis';
import requestIp from "request-ip";
import NextCors from "nextjs-cors";

export default async function checkRateLimit(req, res) {
    const ip = requestIp.getClientIp(req); // The client's IP
    const key = `ratelimit:${ip}`;         // Key to store the current amount of requests of an IP during `ttl` seconds in redis
    const limit = 1;                       // Amount of requests before being blocked for `ttl` seconds
    const ttl = 1;                         // Time in seconds to block an IP after being rate limited
    const timeout_limit = 10;              // Amount of times an IP can be rate limited before being blocked for `timeout_ttl` seconds
    const timeout_ttl = 3600;              // Time in seconds to block an IP after being rate limited `timeout_limit` times
    const timeout_key = `${key}-timeout`   // Key to store the amount of times an IP was rate limited in `timeout_ttl` seconds

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
        // The IP has made more than `timeout_limit` requests in less than `timeout_ttl` seconds
        res.setHeader("Retry-After", await redis.ttl(timeout_key));
        res.setHeader("X-RateLimit-Reset", await redis.ttl(timeout_key))
        res.status(429).json({
            code: 429,
            message:
                "You have exceeded the rate limit too many times. Please try again later.",
            success: false,
        });
        await redis.set(timeout_key, timeout + 1, {
            ex: timeout_ttl,
            nx: true
        })
        return false;
    } else if (current >= limit) {
        // The IP has made more requests than `limit` in less than `ttl` seconds
        res.setHeader("Retry-After", ttl);
        res.setHeader("X-RateLimit-Reset", ttl)
        res.status(429).json({
            code: 429,
            message:
                "You have exceeded the rate limit. Please try again later.",
            success: false,
        });
        await redis.set(timeout_key, timeout + 1, {
            ex: ttl,
            nx: true
        })
        return false;
    }

    return true;
}
