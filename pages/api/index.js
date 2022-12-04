export default function handler(req, res) {
    res.status(200).json({ 
        endpoints: [
            '/image',
        ],
        version: 'v1.0',
    })
}