import Head from "next/head";

import Layout from "../components/common/Layout";

import "../styles/globals.css";
import "normalize.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Lakshya Kumar</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}

export default MyApp;
