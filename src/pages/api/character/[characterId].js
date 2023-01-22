import { PrismaClient } from "@prisma/client";
import { parseCharacter } from "../../../utils/db/parsers";
import { middleware } from "../../../utils/api";

export default async function handler(req, res) {
    const scopes = await middleware(req, res);

    if (scopes === false) {
        // A response has been sent by the middleware.
        return;
    }

    const { characterId } = req.query;

    if (
        !/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(
            characterId
        )
    ) {
        res.status(400).json({
            code: 400,
            message:
                "Invalid value for `characterId` parameter. Expected a UUID.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    const [character, imagesCount] = await prisma.$transaction([
        prisma.characters.findUnique({
            where: {
                id: characterId,
            },
        }),
        prisma.images.count({
            where: {
                characters: {
                    hasSome: [characterId],
                },
            },
        }),
    ]);

    if (!character) {
        res.status(404).json({
            code: 404,
            message: "Could not find character with ID: " + characterId,
            success: false,
        });
        prisma.$disconnect();
        return;
    }

    res.status(200).json({
        data: parseCharacter(character, imagesCount),
        success: true,
    });
}
