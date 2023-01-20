import { PrismaClient } from "@prisma/client";
import { parseArtist } from "../../../utils/db/parsers";
import { middleware } from "../../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    const { artistId } = req.query;

    if (
        !/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(
            artistId
        )
    ) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `artistId` parameter. Expected a UUID.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    const artist = await prisma.artists.findUnique({
        where: {
            id: artistId,
        },
    });

    if (!artist) {
        res.status(404).json({
            code: 404,
            message: "Could not find artist with ID: " + artistId,
            success: false,
        });
    }

    res.status(200).json({
        data: await parseArtist(artist, prisma),
        success: true,
    });

    prisma.$disconnect();
}
