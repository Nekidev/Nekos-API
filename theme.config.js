import Image from "next/image"

export default {
    projectLink: 'https://github.com/Nekidev/nekos-api', // GitHub link in the navbar
    docsRepositoryBase: 'https://github.com/Nekidev/nekos-api-docs', // base URL for the docs repository
    titleSuffix: ' – Nekos API',
    nextLinks: true,
    prevLinks: true,
    search: true,
    customSearch: null, // customizable, you can use algolia for example
    darkMode: true,
    footer: true,
    footerText: `MIT ${new Date().getFullYear()} © Rafael Bradley.`,
    footerEditLink: `Edit this page on GitHub`,
    logo: (
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
        <Image src="/logo/black.png" alt="Nekos API" width={40} height={40} />
        <span>Open-source free public catgirl images API.</span>
      </div>
    ),
    head: (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Nekos API: Open-source free public catgirl images API." />
        <meta name="og:title" content="Nekos API" />
      </>
    ),
  }