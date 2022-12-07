require('dotenv').config()

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const main = async () => {
    const allImages = await prisma.images.findMany();

    const imageIds = [];

    for (const image of allImages) {
        imageIds.push(image.id);
    }

    const allFiles = await prisma.objects.findMany({
        where: {
            NOT: {
                id : {
                    in: imageIds
                }
            }
        }
    });

    for (const file of allFiles) {
        try {
            await prisma.images.create({
                data: {
                    file: file.id,
                    nsfw: false,
                    categories: ['d2ee80f1-f023-4a53-8fed-933eafc6be20']
                }
            })
            console.log("IMG - " + file.id + " - CREATED");
        }
        catch (e) {
            console.log("IMG - " + file.id + " - EXISTENT");
        }
    }
}

main()