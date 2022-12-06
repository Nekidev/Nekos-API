import supabase from "../../utils/supabase/client";

import probe from "probe-image-size";

export async function getImageJson(image, prismaClient) {
    // Get the file object from the database
    var file = await prismaClient.objects.findUnique({
        where: {
            id: image.file,
        },
    });

    // Get the signed URL for the file
    const { data, error } = await supabase.storage
        .from("nekos-api")
        .createSignedUrl(file.name, 60 * 60);

    // The artist is null if the image is not associated with an artist
    var artist = null;

    if (image.artist) {
        // The artist is not null so it is retreived from the database
        let artistData = await prismaClient.artists.findUnique({
            where: {
                id: image.artist,
            },
        });

        // Set the `artist` var to the artist data (this will be returned in the response)
        artist = {
            id: artistData.id,
            name: artistData.name,
            url: artistData.url,
        };
    }

    // Get the categories for the image
    var categoriesData = await prismaClient.categories.findMany({
        where: {
            id: {
                in: image.categories,
            },
        },
    });

    var categories = [];

    for (const category of categoriesData) {
        // Add the category to the array that will be returned.
        categories.push({
            id: category.id,
            name: category.name,
            description: category.description,
            nsfw: category.nsfw,
            createdAt: category.created_at,
        });
    }

    if (image.height in [0, null] || image.width in [0, null]) {
        // If the image height or width is 0 or null, then the image dimensions need to be updated
        const { height, width } = await probe(data.signedUrl);

        image.height = height;
        image.width = width;

        // Not awaited because it is not necessary to wait for it to finish
        prismaClient.images
            .update({
                where: {
                    id: image.id,
                },
                data: {
                    height: height,
                    width: width,
                },
            })
            .then(() => {
                // Do nothing after the image dimensions are updated
            });
    }

    return {
        id: image.id,
        url: data.signedUrl,
        artist: artist,
        source: {
            name: image.source_name,
            url: image.source_url,
        },
        nsfw: image.nsfw,
        categories: categories,
        createdAt: image.created_at,
        meta: {
            eTag: file.metadata.eTag,
            size: file.metadata.size,
            mimetype: file.metadata.mimetype,
            dimens: {
                height: image.height,
                width: image.width,
            },
        },
    };
}

export async function getManyImagesJson(images, prismaClient) {
    var result = [];

    // Array with all the file ids so we can get the signed urls in a single call.
    var fileIds = [];

    images.map((item) => {
        fileIds.push(item.file);
    });

    // Get the files from the database
    var files = await prismaClient.objects.findMany({
        where: {
            id: {
                in: fileIds,
            },
        },
    });

    // Two different variables are used to store the file names and ids because the 
    // order of the files returned by the database is not guaranteed to be the same as 
    // the order of the file ids in the `fileIds` array.
    var fileNames = [];
    var filesById = {};

    files.map((file) => {
        fileNames.push(file.name);
        filesById[file.id] = file;
    });

    // Get the signed urls for the files
    const { data, error } = await supabase.storage
        .from("nekos-api")
        .createSignedUrls(fileNames, 60 * 60);
    
    if (error) {
        throw error;
    }

    // Create a map of the signed urls so they can be accessed by the file name
    var signedUrls = {};

    data.map((file) => {
        let row = files.find((row) => {
            return row.name = file.path;
        })
        signedUrls[row.name] = file.signedUrl;
    });

    // Array with all the artist ids so we can get the artists in a single call.
    var artistIds = [];

    images.map((image) => {
        // Add all artist ids to the array. Avoid duplicates to reduce the expensiveness of the db query.
        if (artistIds.indexOf(image.artist) == -1 && image.artist != null) {
            artistIds.push(image.artist);
        }
    });

    // Get all the artists
    var artists = await prismaClient.artists.findMany({
        where: {
            id: {
                in: artistIds,
            },
        },
    });

    // Create a map of the artists so they can be accessed by the artist id
    var artistMap = {};

    artists.map((artist) => {
        artistMap[artist.id] = artist;
    });

    // Get all the categories
    var categoryIds = [];

    images.map((image) => {
        image.categories.map((categoryId) => {
            // Add all category ids to the array. Avoid duplicates to reduce the expensiveness of the db query.
            if (categoryIds.indexOf(categoryId) == -1) {
                categoryIds.push(categoryId);
            }
        });
    })

    // Get all the categories
    var categories = await prismaClient.categories.findMany({
        where: {
            id: {
                in: categoryIds,
            },
        },
    });

    // Create a map of the categories so they can be accessed by the category id
    var categoryMap = {};

    categories.map((category) => {
        categoryMap[category.id] = category;
    });

    // Add the images to the result array
    for (var image of images) {
        // Create an array with the categories for the image
        var imageCategories = [];

        image.categories.map((categoryId) => {
            // Get the category from the map
            let category = categoryMap[categoryId];

            // Add the category to the array that will be returned.
            imageCategories.push({
                id: category.id,
                name: category.name,
                description: category.description,
                nsfw: category.nsfw,
                createdAt: category.created_at,
            });
        });

        // Create the artist var. This will be overriden if the image has an artist.
        let artist = null;

        if (image.artist) {
            artist = {
                id: artistMap[image.artist].id,
                name: artistMap[image.artist].name,
                url: artistMap[image.artist].url,
            };
        }

        // Get the file from the map
        const file = filesById[image.file];

        if (image.height in [0, null, undefined] || image.width in [0, null, undefined]) {
            // If the image dimensions are not set, get them from the image file.
            const { height, width } = await probe(signedUrls[file.name]);
    
            image.height = height;
            image.width = width;
    
            // Not awaited because it is not necessary to wait for it to finish
            prismaClient.images
                .update({
                    where: {
                        id: image.id,
                    },
                    data: {
                        height: height,
                        width: width,
                    },
                })
                .then(() => {
                    // Do nothing after they are updated. This will run in background.
                });
        }

        // Add the image to the result array
        result.push({
            id: image.id,
            url: signedUrls[file.name],
            artist: artist,
            source: {
                name: image.source_name,
                url: image.source_url,
            },
            nsfw: image.nsfw,
            categories: imageCategories,
            createdAt: image.created_at,
            meta: {
                eTag: file.metadata.eTag,
                size: file.metadata.size,
                mimetype: file.metadata.mimetype,
                dimens: {
                    height: image.height,
                    width: image.width,
                },
            }
        });
    }

    return result;
}
