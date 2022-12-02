// next.config.js
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
  // optional: add `unstable_staticImage: true` to enable Nextra's auto image import
});
module.exports = withNextra({
  // images: {
  //   loader: 'akamai',
  //   path: '/',
  // },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    localeDetection: false,
  }
});
