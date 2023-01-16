import { createYoga, createSchema } from "graphql-yoga";
import typeDefs from "../../utils/api/graphql/definitions";
import resolvers from "../../utils/api/graphql/resolvers";
import checkRateLimit from "../../utils/api/rate-limit";

const schema = createSchema({
    typeDefs,
    resolvers,
});

export const config = {
    api: {
        // Disable body parsing (required for file uploads)
        bodyParser: false,
    },
};

export default createYoga({
    schema,
    // Needed to be defined explicitly because our endpoint lives at a different path other than `/graphql`
    graphqlEndpoint: "/api/graphql",
    graphiql: false,
    context: async ({ req }) => {
        return {
            ratelimit: await checkRateLimit(req, null, { ttl: 2 }),
        };
    },
});
