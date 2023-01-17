import * as React from "react";
import Link from "next/link";
import GraphiQL from "graphiql";
import { useExplorerPlugin } from '@graphiql/plugin-explorer';
import { useExporterPlugin } from '@graphiql/plugin-code-exporter';

import styles from "./index.module.css";
import "graphiql/graphiql.css";
import '@graphiql/plugin-explorer/dist/style.css';
import '@graphiql/plugin-code-exporter/dist/style.css';

const defaultQuery = `# Welcome to Nekos API GraphQL API!
#
# You can use this editor to test your queries,
# read the documentation and save code snippets.
#
# Here is an example:

query ExampleQuery($limit: Int!) {
  images: getRandomImages(limit: $limit) {
    id
    url
  }
}

# To run this example either:
# - Ctrl/Cmd + Enter
# - Click on the pink run button`;

const removeQueryName = query =>
    query.replace(
        /^[^{(]+([{(])/,
        (_match, openingCurlyBracketsOrParenthesis) =>
            `query ${openingCurlyBracketsOrParenthesis}`,
    );

const getQuery = (arg, spaceCount) => {
    const { operationDataList } = arg;
    const { query } = operationDataList[0];
    const anonymousQuery = removeQueryName(query);
    return (
        ` `.repeat(spaceCount) +
        anonymousQuery.replace(/\n/g, `\n` + ` `.repeat(spaceCount))
    );
};

const exampleSnippetOne = {
    name: `Example One`,
    language: `JavaScript`,
    codeMirrorMode: `jsx`,
    options: [],
    generate: arg => `export const query = graphql\`
${getQuery(arg, 2)}
\`
`,
};

const exampleSnippetTwo = {
    name: `Example Two`,
    language: `JavaScript`,
    codeMirrorMode: `jsx`,
    options: [],
    generate: arg => `import { graphql } from 'graphql'

export const query = graphql\`
${getQuery(arg, 2)}
\`
`,
};

const snippets = [exampleSnippetOne, exampleSnippetTwo];

export default function IDE({ }) {
    const [query, setQuery] = React.useState(defaultQuery);
    const explorerPlugin = useExplorerPlugin({
        query,
        onEdit: setQuery,
    });
    const exporterPlugin = useExporterPlugin({
        query,
        snippets,
        codeMirrorTheme: 'graphiql',
    });
    return (
        <div style={{
            height: "100vh"
        }}>
            <GraphiQL
                fetcher={async (graphQLParams) => {
                    const data = await fetch("/api/graphql", {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(graphQLParams),
                        credentials: "same-origin",
                    });
                    return data.json().catch(() => data.text());
                }}
                defaultQuery={defaultQuery}
                variables={`{\n  "limit": 5\n}`}
                query={query}
                onEditQuery={setQuery}
                plugins={[explorerPlugin, exporterPlugin]}
            >
                <GraphiQL.Logo>
                    <Link href="/" className="hover:opacity-90 flex flex-row items-center gap-2 text-sm">
                        <img src="/logo/black.png" className="h-6 w-6" />
                        <span className={styles.logo}>Nekos API</span>
                    </Link>
                </GraphiQL.Logo>
            </GraphiQL>
        </div>
    )
}