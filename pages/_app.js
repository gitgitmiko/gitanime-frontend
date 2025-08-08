import '../styles/globals.css'
import Layout from '../components/Layout'
import { ConfigProvider } from '../contexts/ConfigContext'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  return (
    <ConfigProvider>
      <Head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="GitAnime - Platform streaming anime terbaik dengan koleksi terlengkap dan update terbaru" />
        <meta name="keywords" content="anime, streaming, japan, cartoon, manga" />
        <meta name="author" content="GitAnime" />
        <title>GitAnime - Platform Streaming Anime Terbaik</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ConfigProvider>
  )
}

export default MyApp
