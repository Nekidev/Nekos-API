import { PrismaClient } from "@prisma/client";
import { getManyImagesJson } from "../../../../utils/db";

export default async function handler(req, res) {
    const { artistId, limit = "1", offset = "0" } = req.query;

    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(artistId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `artistId` parameter. Expected a UUID.",
            success: false,
        });
    } else if (!/^[0-9]+$/gi.test(limit) || parseInt(limit) < 1 || parseInt(limit) > 25) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `limit` parameter. Expected a number between 1 and 25.",
            success: false,
        });
    } else if (!/^[0-9]+$/gi.test(offset)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `offset` parameter. Expected a number.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    res.status(200).json({ 
        'data': await getManyImagesJson(images, prisma),
        'success': true
    });

    prisma.$disconnect();
} 