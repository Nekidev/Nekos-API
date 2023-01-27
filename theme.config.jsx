import { useRouter } from "next/router"
import { useConfig } from "nextra-theme-docs"

import Link from "next/link"

export default {
    logo: () => {
        const { asPath } = useRouter()
        return (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
                <img src="/logo/black.png" alt="Logo" width={32} height={32} />
                <span>Nekos API {asPath.startsWith('/docs') && "Documentation"}</span>
            </div>
        )
    },
    project: {
        link: 'https://github.com/Nekidev/Nekos-API',
    },
    docsRepositoryBase: "https://github.com/Nekidev/Nekos-API",
    useNextSeoProps() {
        const { route } = useRouter()
        if (route !== '/') {
            return {
                titleTemplate: '%s – Nekos API'
            }
        } else {
            return {
                titleTemplate: 'Nekos API'
            }
        }
    },
    head: () => {
        const { asPath } = useRouter()
        const { frontMatter } = useConfig()
        return <>
            <meta property="og:url" content={`https://nekosapi.com${asPath}`} />
            <meta property="og:title" content={frontMatter.title || 'Nekos API Documentation'} />
            <meta property="og:description" content={frontMatter.description || 'The open-source free public anime images Restful/GraphQL API.'} />
            <meta name="description" content={frontMatter.description || 'The open-source free public anime images Restful/GraphQL API.'} />
        </>
    },
    primaryHue: {
        light: 350,
        dark: 340,
    },
    chat: {
        "link": "https://discord.gg/b9Fv3kEfXc"
    },
    banner: {
        "key": "v2-in-development",
        "text": (
            <Link href="https://patreon.com/nekidev" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: ".5rem" }}>
                <span className="font-mono">v2.0.0-alpha</span> is currently being developed. You can check the progress in the GitHub repository.
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ height: "1rem", width: "1rem" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </Link>
        )
    },
    footer: {
        "text": (
            <span>
                MIT {new Date().getFullYear()} © <a href="https://nekidev.com" target="_blank">Nekidev</a>. Made with ❤ from Argentina.
            </span>
        )
    },
    sidebar: {
        defaultMenuCollapseLevel: 0,
        toggleButton: true,
    },
    defaultShowCopyCode: true,
}
