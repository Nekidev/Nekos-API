import { PrismaClient } from "@prisma/client";
import { parseSets } from "../../utils/db/parsers";
import { middleware } from "../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    var { limit = "10", offset = "0" } = req.query;

    if (
        !/^[0-9]+$/.test(limit) ||
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
    } else if (!/^[0-9]+$/.test(offset) || parseInt(offset) < 0) {
        res.status(400).json({
            code: 400,
            message:
                "Invalid value for `offset` parameter. Expected a number greater than 0.",
            success: false,
        });
        return;
    }

    const prisma = new PrismaClient();

    const sets = await prisma.sets.findMany({
        take: parseInt(limit),
        skip: parseInt(offset)
    })

    res.status(200).json({
        data: await parseSets(sets),
        success: true,
    });

    prisma.$disconnect();
}
