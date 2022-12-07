import { PrismaClient } from '@prisma/client'
import { parseCharacter } from '../../../utils/db/parsers';

export default async function handler(req, res) {
    const { characterId } = req.query;

    if (!/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(characterId)) {
        res.status(400).json({
            code: 400,
            message: "Invalid value for `characterId` parameter. Expected a UUID.",
            success: false,
        });
    }

    const prisma = new PrismaClient();

    const character = await prisma.character.findUnique({
        where: {
            id: parseInt(characterId),
        }
    });

    if (!character) {
        res.status(404).json({
            code: 404,
            message: "Character not found.",
            success: false,
        });
    }

    res.status(200).json({
        data: parseCharacter(character, prisma),
        success: true,
    });
}