import { axiosGet } from '../utils/api';

const BASE_URL = 'https://gitanime-web.vercel.app';

export async function getServerSideProps({ res, params, query }) {
  const page = Number((params?.page || query?.page || '1').toString().replace(/[^0-9]/g, '')) || 1;
  const urls = [];
  try {
    const resp = await axiosGet('/api/latest-episodes', { params: { page, limit: 50 } });
    const list = resp.data?.data?.episodes || [];
    for (const e of list) {
      if (!e.id) continue;
      urls.push({ loc: `${BASE_URL}/episode/${encodeURIComponent(e.id)}`, lastmod: e.createdAt });
    }
  } catch (_) {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((u) => `\n  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}\n  </url>`).join('') +
    `\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600');
  res.statusCode = 200;
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SiteMapEpisodesPage() { return null; }

export const config = {
  runtime: 'edge',
};


