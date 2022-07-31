import Head from "next/head";

import Layout from "../components/common/Layout";

import "../styles/globals.css";
import "../styles/resume.css";
import "normalize.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Lakshya Kumar | Web Developer &amp; UX Enthusiast</title>
        <meta charset="UTF-8" />
        <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,300i,400,400i,600,600i,700,700i"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Catamaran:200,300,400,500,600,700"
          rel="stylesheet"
        />
      </Head>
      {/* <Layout> */}
      <Component {...pageProps} />
      {/* </Layout> */}
    </>
  );
}

export default MyApp;
