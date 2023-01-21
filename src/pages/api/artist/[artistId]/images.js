import { PrismaClient } from "@prisma/client";
import { getManyImagesJson } from "../../../../utils/db";
import { middleware } from "../../../../utils/api";
import { checkExpiryPermissions } from "../../../../utils/api/authorization";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    const { artistId, limit = "10", offset = "0", expiry = "3600" } = req.query;

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
        return;
    } else if (!checkExpiryPermissions(res, expiry, scopes)) {
        // The function already sent a response.
        return;
    } else if (
        !/^[0-9]+$/gi.test(limit) ||
        parseInt(limit) < 1 ||
        parseInt(limit) > 25
    ) {
        res.status(400).json({
            code: 400,
            message:
                "Invalid value for `limit` parameter. Expected a number between 1 and 25.",
            success: false,
        });
        return;
    } else if (!/^[0-9]+$/gi.test(offset)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `offset` parameter. Expected a number.",
            success: false,
        });
        return;
    }

    const prisma = new PrismaClient();

    const images = await prisma.images.findMany({
        where: {
            artist: artistId,
        },
        take: parseInt(limit),
        skip: parseInt(offset),
    });

    if (!images || images.length === 0) {
        res.status(404).json({
            code: 404,
            message: "Could not find artist with ID: " + artistId,
            success: false,
        });
        prisma.$disconnect();
        return
    }

    res.status(200).json({
        data: await getManyImagesJson(images, prisma, {
            expiry: parseInt(expiry)
        }),
        success: true,
    });

    prisma.$disconnect();
}
