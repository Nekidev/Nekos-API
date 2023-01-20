import { PrismaClient } from "@prisma/client";
import { parseCharacter } from '../../utils/db/parsers';
import { middleware } from "../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    var { limit = "10", offset = "0", search = "" } = req.query;

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
            message: "Invalid value for `offset` parameter. Expected a number greater than 0.",
            success: false
        })
        return;
    } else if (search.length > 20) {
        req.status(400).json({
            code: 400,
            message: "The `search` parameter can be up to 20 characters long.",
            success: false
        })
        return;
    }

    const prisma = new PrismaClient();

    const characters = await prisma.characters.findMany({
        where: search.length > 0 ? {
            name: {
                search: search.split(" ").filter(v, i => v !== "").join(" <-> ")
            },
            description: {
                search: search.split(" ").filter(v, i => v !== "").join(" <-> ")
            }
        } : undefined,
        take: parseInt(limit),
        skip: parseInt(offset)
    })

    let data = []

    for (const row of characters) {
        data.push(await parseCharacter(row))
    }

    res.status(200).json({
        data,
        success: true,
    });

    prisma.$disconnect();
}
