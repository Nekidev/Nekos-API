export default function handler(req, res) {
    res.status(200).json({ 
        image: {
            'id': 'xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            'url': 'https://discordapp.com/assets/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.png',
            'dimens': {
                'width': 1024,
                'height': 1024,
            },
            'artist': {
                'name': 'xxxxxxx',
                'url': 'https://example.com/xxxxxxx'
            },
            'source': {
                'name': 'xxxxxxx',
                'url': 'https://example.com/xxxxxxx'
            },
            'nsfw': false,
            'categories': [
                'xxxxxxx',
                'xxxxxxx',
            ],
            'createdAt': '2021-01-01T00:00:00.000Z',
        }
    })
}