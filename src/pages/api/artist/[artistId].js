import { PrismaClient } from '@prisma/client';
import { parseArtist } from '../../../utils/db/parsers';

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

    res.status(200).json(await parseArtist(artist, prisma));

    prisma.$disconnect();
}