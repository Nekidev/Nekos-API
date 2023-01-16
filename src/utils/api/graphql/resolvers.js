import getRandomImages from "./resolvers/getRandomImages";
import getImage from "./resolvers/getImage";

export default {
    Query: {
        getRandomImages: getRandomImages,
        getImage: getImage,
    },
};
