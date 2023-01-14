import checkRateLimit from "../../utils/api/rate-limit";

export default async function handler(req, res) {
    if (!(await checkRateLimit(req, res))) {
        // Rate limit exceeded
        return;
    }

    res.status(200).json({ 
        endpoints: [
            '/stats',
            '/image',
            '/image/:id',
            '/image/random',
            '/character/:id',
            '/category',
            '/category/:id',
            '/artist/:id',
            '/artist/:id/images',
        ],
        version: 'v1.0',
    })
}