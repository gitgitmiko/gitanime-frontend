import '../styles/globals.css'
import Layout from '../components/Layout'
import { ConfigProvider } from '../contexts/ConfigContext'

function MyApp({ Component, pageProps }) {
  return (
    <ConfigProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ConfigProvider>
  )
}

export default MyApp
