import { middleware } from "../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
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