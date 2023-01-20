import { PrismaClient } from "@prisma/client";
import { parseSet } from "../../../utils/db/parsers";
import { middleware } from "../../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    const { setId } = req.query;

    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(setId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `setId` parameter. Expected a UUID.",
            success: false,
        });
        return;
    }

    const prisma = new PrismaClient();

    const set = await prisma.sets.findUnique({
        where: {
            id: setId
        }
    });

    if (!set) {
        res.status(404).json({
            code: 404,
            message: 'Could not find set with ID: ' + setId,
            success: false
        })
        prisma.$disconnect();
        return
    }

    res.status(200).json({
        'data': await parseSet(set),
        'success': true
    });

    prisma.$disconnect();
}