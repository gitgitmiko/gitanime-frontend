import { axiosGet } from '../utils/api';

const BASE_URL = 'https://gitanime-web.vercel.app';

export async function getServerSideProps({ res }) {
  let animePages = 1;
  let episodePages = 1;
  try {
    const a = await axiosGet('/api/anime-list', { params: { page: 1, limit: 50 } });
    animePages = Math.max(1, a.data?.data?.pagination?.totalPages || 1);
  } catch (_) {}
  try {
    const e = await axiosGet('/api/latest-episodes', { params: { page: 1, limit: 50 } });
    episodePages = Math.max(1, e.data?.data?.pagination?.totalPages || 1);
  } catch (_) {}

  const parts = [];
  parts.push(`${BASE_URL}/sitemap-core.xml`);
  for (let i = 1; i <= animePages; i++) parts.push(`${BASE_URL}/sitemap-anime-${i}.xml`);
  for (let i = 1; i <= episodePages; i++) parts.push(`${BASE_URL}/sitemap-episodes-${i}.xml`);

  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    parts.map((loc) => `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n  </sitemap>`).join('\n') +
    `\n</sitemapindex>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600');
  res.statusCode = 200;
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SiteMapIndex() { return null; }



