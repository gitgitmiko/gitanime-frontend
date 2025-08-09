const BASE_URL = 'https://gitanime-web.vercel.app';

export async function getServerSideProps({ res }) {
  const urls = [
    { loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${BASE_URL}/anime`, changefreq: 'daily', priority: '0.9' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((u) => {
      return `\n  <url>\n    <loc>${u.loc}</loc>` +
        (u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : '') +
        (u.priority ? `\n    <priority>${u.priority}</priority>` : '') +
        `\n  </url>`;
    }).join('') +
    `\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SiteMapCore() { return null; }


