import checkRateLimit from "../../utils/api/rate-limit";

export default async function handler(req, res) {
    if (!(await checkRateLimit(req, res))) {
        // Rate limit exceeded
        return;
    }

    res.status(200).json({ 
        data: [
            '/stats',
            '/image',
            '/image/:id',
            '/image/random',
            '/character/:id',
            '/category',
            '/category/:id',
            '/artist',
            '/artist/:id',
            '/artist/:id/images',
        ],
        meta: {
            version: 'v1.0',
        },
        success: true
    })
}