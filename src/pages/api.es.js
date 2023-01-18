import checkRateLimit from "../utils/api/rate-limit";

export default async function handler(req, res) {
    if (!(await checkRateLimit(req, res))) {
        // Rate limit exceeded
        return;
    }

    res.status(400).json({ 
        code:400,
        message: "API endpoints do not support localization",
        success: true
    })
}