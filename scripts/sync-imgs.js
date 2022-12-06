require('dotenv').config()

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const main = async () => {
    const allFiles = await prisma.objects.findMany();

    for (const file of allFiles) {
        try {
            await prisma.images.create({
                data: {
                    file: file.id,
                    nsfw: false,
                    categories: ['catgirl']
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