import "../styles/globals.css";
import Layout from "../components/common/layout";
import "normalize.css";

function MyApp({ Component, pageProps }) {
    return (
        <Layout>
            <TopProgressBar />
            <Component {...pageProps} />
        </Layout>
    );
}

export default MyApp;
