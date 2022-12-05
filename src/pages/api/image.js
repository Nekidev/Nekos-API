import { PrismaClient } from "@prisma/client";

function isNumeric(str) {
    if (typeof str != "string") return false;
    return (
        !isNaN(str) &&
        !isNaN(parseInt(str))
    );
}

export default async function handler(req, res) {
    const { count = "1", categories = "" } = req.query;

    if (!(/^[0-9]+$/).test(count)) {
        res.status(400).json({
            error: "Invalid count",
        });
        return;
    }

    // const prisma = new PrismaClient();
    // const images = await prisma.$queryRaw`SELECT * FROM "Images" WHERE categories @> ('{}') ORDER BY RANDOM() LIMIT ${count}`;

    res.status(200).json({
        images: [
            {
                id: "xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                url: "https://discordapp.com/assets/xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.png",
                dimens: {
                    width: 1024,
                    height: 1024,
                },
                artist: {
                    name: "xxxxxxx",
                    url: "https://example.com/xxxxxxx",
                },
                source: {
                    name: "xxxxxxx",
                    url: "https://example.com/xxxxxxx",
                },
                nsfw: false,
                categories: ["xxxxxxx", "xxxxxxx"],
                createdAt: "2021-01-01T00:00:00.000Z",
            },
        ],
    });

    prisma.$disconnect();
}
