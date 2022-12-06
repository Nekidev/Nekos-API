import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
    const { artistId } = req.query;

    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(artistId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `artistId` parameter. Expected a UUID.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    const artist = await prisma.artists.findUnique({
        where: {
            id: artistId
        }
    });

    const imagesCount = await prisma.images.count({
        where: {
            artist: artistId
        }
    });

    res.status(200).json({ 
        'data': {
            'id': artist.id,
            'name': artist.name,
            'url': artist.url,
            'images': imagesCount,
            'createdAt': artist.created_at,
        },
        'success': true
    });

    prisma.$disconnect();
}