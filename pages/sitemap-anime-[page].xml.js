import { axiosGet } from '../utils/api';

const BASE_URL = 'https://gitanime-web.vercel.app';

function extractSlug(link) {
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1];
  } catch (_) {
    return '';
  }
}

export async function getServerSideProps({ res, params, query }) {
  const page = Number((params?.page || query?.page || '1').toString().replace(/[^0-9]/g, '')) || 1;
  const urls = [];
  try {
    const resp = await axiosGet('/api/anime-list', { params: { page, limit: 50 } });
    const list = resp.data?.data?.anime || [];
    const lastUpdated = resp.data?.data?.summary?.lastUpdated;
    for (const a of list) {
      const slug = extractSlug(a.link || '');
      if (!slug) continue;
      urls.push({ loc: `${BASE_URL}/anime/${encodeURIComponent(slug)}`, lastmod: lastUpdated || a.scrapedAt || a.createdAt });
    }
  } catch (_) {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((u) => `\n  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}\n  </url>`).join('') +
    `\n</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, max-age=3600');
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SiteMapAnimePage() { return null; }


