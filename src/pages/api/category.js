import { Prisma, PrismaClient } from "@prisma/client";
import { parseCategory } from "../../utils/db/parsers";
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
            message:
                "Invalid value for `offset` parameter. Expected a number greater than 0.",
            success: false,
        });
        return;
    } else if (search.length > 50) {
        req.status(400).json({
            code: 400,
            message: "The `search` parameter can be up to 50 characters long.",
            success: false,
        });
        return;
    }

    const prisma = new PrismaClient();

    const [categories, categoriesCount] = await prisma.$transaction([
        prisma.$queryRaw`SELECT * FROM "Categories" ${
            search.length > 0
                ? Prisma.sql`WHERE LOWER(name) SIMILAR TO LOWER(${search}) OR LOWER(description) SIMILAR TO LOWER(${search})`
                : Prisma.empty
        } LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`,
        prisma.categories.count(),
    ]);

    let data = [];

    for (const row of categories) {
        data.push(parseCategory(row));
    }

    res.status(200).json({
        data,
        meta: {
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: data.length,
                total: categoriesCount,
            }
        },
        success: true,
    });

    prisma.$disconnect();
}
