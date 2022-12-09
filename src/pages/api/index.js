export default function handler(req, res) {
    res.status(200).json({ 
        endpoints: [
            '/image',
            '/image/:id',
            '/character/:id',
            '/category/:id',
            '/artist/:id',
            '/artist/:id/images',
        ],
        version: 'v1.0',
    })
}