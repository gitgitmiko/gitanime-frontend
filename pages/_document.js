import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_BACKEND_URL || 'https://gitanime-backend.onrender.com'} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_BACKEND_URL || 'https://gitanime-backend.onrender.com'} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}


