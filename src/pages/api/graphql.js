import { createYoga, createSchema } from "graphql-yoga";
import typeDefs from "../../utils/api/graphql/definitions";
import resolvers from "../../utils/api/graphql/resolvers";

const schema = createSchema({
    typeDefs,
    resolvers,
});

const defaultQuery = `
# Welcome to Nekos API GraphQL API!
#
# You can use this editor to test your queries,
# read the documentation and save code snippets.
#
# Here is an example:

query {
  getRandomImages(limit: 5) {
    id
    url
  }
}
`

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
    graphiql: {
        defaultQuery,
    },
});
