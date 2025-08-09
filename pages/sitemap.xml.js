import { axiosGet } from '../utils/api';

const BASE_URL = 'https://gitanime-web.vercel.app';

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function extractAnimeSlug(link) {
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    const second = parts[parts.length - 2];
    if (second === 'anime') return last;
    return last;
  } catch (_) {
    if (typeof link === 'string') {
      const parts = link.split('/').filter(Boolean);
      return parts[parts.length - 1] || '';
    }
    return '';
  }
}

export async function getServerSideProps({ res }) {
  const urls = [];

  // Static important pages
  urls.push({ loc: `${BASE_URL}/`, changefreq: 'daily', priority: '1.0' });
  urls.push({ loc: `${BASE_URL}/anime`, changefreq: 'daily', priority: '0.9' });

  try {
    // Anime list first page
    const animeRes = await axiosGet('/api/anime-list', { params: { page: 1, limit: 50 } });
    const anime = animeRes.data?.data?.anime || [];
    const lastUpdated = animeRes.data?.data?.summary?.lastUpdated;
    anime.forEach((a) => {
      const slug = extractAnimeSlug(a.link || '');
      if (slug) {
        urls.push({
          loc: `${BASE_URL}/anime/${encodeURIComponent(slug)}`,
          lastmod: lastUpdated || a.scrapedAt || a.createdAt,
          changefreq: 'weekly',
          priority: '0.8',
        });
      }
    });
  } catch (_) {}

  try {
    // Latest episodes first page
    const epRes = await axiosGet('/api/latest-episodes', { params: { page: 1, limit: 50 } });
    const episodes = epRes.data?.data?.episodes || [];
    episodes.forEach((e) => {
      if (e.id) {
        urls.push({
          loc: `${BASE_URL}/episode/${encodeURIComponent(e.id)}`,
          lastmod: e.createdAt,
          changefreq: 'daily',
          priority: '0.7',
        });
      }
    });
  } catch (_) {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((u) => {
      return `\n  <url>\n    <loc>${escapeXml(u.loc)}</loc>` +
        (u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : '') +
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

export default function SiteMap() {
  return null;
}


