import { middleware } from "../../utils/api";
import { Prisma, PrismaClient } from "@prisma/client";
import { parseArtists } from "../../utils/db/parsers";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    const { limit = "10", offset = "0", search = "" } = req.query;

    if (
        !/^[0-9]+$/.test(limit) ||
        parseInt(limit) < 1 ||
        parseInt(limit) > 50
    ) {
        res.status(400).json({
            code: 400,
            message:
                "Invalid value for `limit` parameter. Expected a number between 1 and 25.",
            success: false,
        });
        return;
    } else if (!/^[0-9]+$/.test(offset) || parseInt(offset) < 0) {
        res.status(400).json({
            code: 400,
            message:
                "Invalid value for `offset` parameter. Expected a number greater than 0.",
            success: false,
        });
        return;
    } else if (search.length > 20) {
        req.status(400).json({
            code: 400,
            message: "The `search` parameter can be up to 20 characters long.",
            success: false,
        });
        return;
    }

    const prisma = new PrismaClient();

    const [artists, artistsCount] = await prisma.$transaction([
        prisma.$queryRaw`SELECT * FROM "Artists" ${
            search.length > 0
                ? Prisma.sql`WHERE LOWER(name) SIMILAR TO LOWER(${search})`
                : Prisma.empty
        } LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
        prisma.artists.count(),
    ]);

    const artists_json = parseArtists(artists);

    prisma.$disconnect();

    res.status(200).json({
        data: artists_json,
        meta: {
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: artists_json.length,
                total: artistsCount
            }
        },
        success: true,
    });
}
