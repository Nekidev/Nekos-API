require('dotenv').config()

const { PrismaClient } = require('@prisma/client');
const probe = require('probe-image-size');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_ANON_SUPABASE_KEY);

const prisma = new PrismaClient();

async function main() {
    const images = await prisma.images.findMany();

    const objects = await prisma.objects.findMany({
        where: {
            NOT: {
                id: {
                    in: images.map((img) => img.file)
                }
            }
        }
    });

    await prisma.images.createMany({
        data: objects.map((obj) => {
            return {
                file: obj.id,
                categories: [],
                characters: [],
                nsfw: null
            }
        })
    });

    console.log(`Added ${objects.length} images`);
}

main();