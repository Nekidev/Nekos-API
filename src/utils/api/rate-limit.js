import redis from './redis';
import requestIp from "request-ip";
import NextCors from "nextjs-cors";

export default async function checkRateLimit(req, res) {
    const ip = requestIp.getClientIp(req);
    const key = `ratelimit:${ip}`;
    const limit = 1;
    const ttl = 1;

    const current = (await redis.get(key)) || 0;

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

    if (current >= limit) {
        res.setHeader("Retry-After", ttl);
        res.status(429).json({
            code: 429,
            message:
                "You have exceeded the rate limit. Please try again later.",
            success: false,
        });
        return false;
    }

    return true;
}
