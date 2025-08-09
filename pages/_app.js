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
        <meta name="description" content="GitAnime - Platform streaming anime terbaik dengan koleksi terlengkap dan update terbaru." />
        <meta name="keywords" content="anime, streaming anime, nonton anime, subtitle indonesia, samehadaku" />
        <meta name="author" content="GitAnime" />
        {/* Open Graph default */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GitAnime" />
        <meta property="og:title" content="GitAnime - Platform Streaming Anime Terbaik" />
        <meta property="og:description" content="Streaming anime terbaru dengan kualitas terbaik di GitAnime." />
        <meta property="og:image" content="/favicon.svg" />
        {/* Twitter default */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GitAnime - Platform Streaming Anime Terbaik" />
        <meta name="twitter:description" content="Streaming anime terbaru dengan kualitas terbaik di GitAnime." />
        <meta name="twitter:image" content="/favicon.svg" />
        <title>GitAnime - Platform Streaming Anime Terbaik</title>
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ConfigProvider>
  )
}

export default MyApp
