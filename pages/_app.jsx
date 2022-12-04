import 'nextra-theme-docs/style.css'
import '../styles/nprogress.css'
import '../styles/globals.css'

import Router from "next/router";
import NProgress from "nprogress"

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

NProgress.configure({ showSpinner: false });

export default function NekosAPI({ Component, pageProps }) {
    return <Component {...pageProps} />
}