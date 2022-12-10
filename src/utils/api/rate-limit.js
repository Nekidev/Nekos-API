import { Redis } from '@upstash/redis'
import requestIp from 'request-ip'

const client = new Redis({
    url: process.env.UPSTASH_URL,
    token: process.env.UPSTASH_TOKEN,
});

export default async function checkRateLimit(req, res) {
    const ip = requestIp.getClientIp(req);
    const key = `ratelimit:${ip}`;
    const limit = 1;
    const ttl = 1;

    const current = await client.get(key) || 0;

    await client.set(
        key,
        current + 1,
        {
            ex: ttl,
            nx: true,
        }
    )

    if (current >= limit) {
        res.setHeader("Retry-After", ttl);
        res.status(429).json({
            code: 429,
            message: "You have exceeded the rate limit. Please try again later.",
            success: false,
        });
        return false;
    }

    return true;
}