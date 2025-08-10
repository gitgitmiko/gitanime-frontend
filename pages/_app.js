import '../styles/globals.css'
import Layout from '../components/Layout'
import { ConfigProvider } from '../contexts/ConfigContext'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import NavigationLoading from '../components/NavigationLoading'

function MyApp({ Component, pageProps }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Memuat halaman...')
  const router = useRouter()

  useEffect(() => {
    const handleStart = (url) => {
      // Tampilkan loading untuk navigasi ke episode page
      if (url.includes('/episode/')) {
        setIsLoading(true)
        setLoadingMessage('Memuat episode...')
      } else if (url !== router.asPath) {
        // Tampilkan loading untuk navigasi ke halaman lain
        setIsLoading(true)
        setLoadingMessage('Memuat halaman...')
      }
    }

    const handleComplete = () => {
      // Delay sedikit untuk memastikan loading terlihat
      setTimeout(() => {
        setIsLoading(false)
      }, 300)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

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
        <meta httpEquiv="Content-Language" content="id-ID" />
        {/* Google Search Console verification (URL-prefix property) */}
        <meta name="google-site-verification" content="E9Fe_DOI__0wd8ydQGbeaHwf1PWss_bTf1wm3NX4PdY" />
        {/* Bing Webmaster verification */}
        <meta name="msvalidate.01" content="1C92DE6A32E765D5B1CC05AA92F23A9D" />
        {/* Twitter default */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GitAnime - Platform Streaming Anime Terbaik" />
        <meta name="twitter:description" content="Streaming anime terbaru dengan kualitas terbaik di GitAnime." />
        <meta name="twitter:image" content="/favicon.svg" />
        <title>GitAnime - Platform Streaming Anime Terbaik</title>
      </Head>
      
      {/* Global Loading Overlay */}
      {isLoading && (
        <NavigationLoading message={loadingMessage} />
      )}
      
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ConfigProvider>
  )
}

export default MyApp
