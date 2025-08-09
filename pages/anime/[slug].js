import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { FiPlay, FiCalendar, FiClock, FiTag, FiStar } from 'react-icons/fi';
import { axiosGet } from '../../utils/api';

export default function AnimeSlugDetail({ animeDetail, canonical, error }) {
  const router = useRouter();
  const handleBack = () => router.back();

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-xl mb-2">Terjadi Kesalahan</h1>
          <p className="text-dark-300 mb-4">{error}</p>
          <div className="flex space-x-4 justify-center">
            <button onClick={handleBack} className="btn-secondary">Kembali</button>
          </div>
        </div>
      </div>
    );
  }

  if (!animeDetail) return null;

  // JSON-LD: TVSeries
  const tvSeriesJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: animeDetail.title,
    image: animeDetail.imageUrl || animeDetail.episodeScreenshot || animeDetail.image || undefined,
    description: animeDetail.synopsis || undefined,
    numberOfEpisodes: animeDetail.totalEpisodes || undefined,
    genre: Array.isArray(animeDetail.genres) ? animeDetail.genres : undefined,
  };

  // JSON-LD: Breadcrumb
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://gitanime-web.vercel.app/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Anime',
        item: 'https://gitanime-web.vercel.app/anime',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: animeDetail.title,
        item: canonical,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Head>
        <title>{animeDetail.title ? `${animeDetail.title} - GitAnime` : 'Detail Anime - GitAnime'}</title>
        {canonical && <link rel="canonical" href={canonical} />}
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GitAnime" />
        <meta property="og:title" content={animeDetail.title || 'Detail Anime'} />
        {animeDetail.synopsis && <meta property="og:description" content={animeDetail.synopsis.substring(0, 150)} />}
        {(animeDetail.imageUrl || animeDetail.episodeScreenshot || animeDetail.image) && (
          <meta property="og:image" content={animeDetail.imageUrl || animeDetail.episodeScreenshot || animeDetail.image} />
        )}
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={animeDetail.title || 'Detail Anime'} />
        {animeDetail.synopsis && <meta name="twitter:description" content={animeDetail.synopsis.substring(0, 150)} />}
        {(animeDetail.imageUrl || animeDetail.episodeScreenshot || animeDetail.image) && (
          <meta name="twitter:image" content={animeDetail.imageUrl || animeDetail.episodeScreenshot || animeDetail.image} />
        )}
        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tvSeriesJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      </Head>

      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={handleBack} className="btn-secondary">← Kembali</button>
            <h1 className="text-white text-xl font-semibold">{animeDetail.title || 'Detail Anime'}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="space-y-8">
          {/* Anime Header */}
          <div className="card p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Anime Image */}
              <div className="flex-shrink-0">
                {(animeDetail.imageUrl || animeDetail.episodeScreenshot || animeDetail.image) ? (
                  <div className="w-48 h-64 relative rounded-lg overflow-hidden">
                    <Image
                      src={animeDetail.imageUrl || animeDetail.episodeScreenshot || animeDetail.image}
                      alt={animeDetail.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-64 bg-dark-700 rounded-lg flex items-center justify-center">
                    <FiPlay className="w-16 h-16 text-dark-400" />
                  </div>
                )}
              </div>

              {/* Anime Info */}
              <div className="flex-1">
                {animeDetail.japanese && (
                  <p className="text-dark-300 mb-2"><strong className="text-white">Japanese:</strong> {animeDetail.japanese}</p>
                )}
                {animeDetail.english && (
                  <p className="text-dark-300 mb-2"><strong className="text-white">English:</strong> {animeDetail.english}</p>
                )}

                {/* Anime Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {animeDetail.status && (
                    <div className="flex items-center space-x-2">
                      <FiTag className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300"><strong className="text-white">Status:</strong> {animeDetail.status}</span>
                    </div>
                  )}
                  {animeDetail.type && (
                    <div className="flex items-center space-x-2">
                      <FiPlay className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300"><strong className="text-white">Type:</strong> {animeDetail.type}</span>
                    </div>
                  )}
                  {animeDetail.totalEpisodes && (
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300"><strong className="text-white">Total Episodes:</strong> {animeDetail.totalEpisodes}</span>
                    </div>
                  )}
                  {animeDetail.duration && (
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300"><strong className="text-white">Duration:</strong> {animeDetail.duration}</span>
                    </div>
                  )}
                  {animeDetail.rating && (
                    <div className="flex items-center space-x-2">
                      <FiStar className="w-4 h-4 text-yellow-400" />
                      <span className="text-dark-300"><strong className="text-white">Rating:</strong> {animeDetail.rating}</span>
                    </div>
                  )}
                  {animeDetail.releaseDate && (
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-primary-400" />
                      <span className="text-dark-300"><strong className="text-white">Release Date:</strong> {animeDetail.releaseDate}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {animeDetail.genres && animeDetail.genres.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-2">Genres:</h3>
                    <div className="flex flex-wrap gap-2">
                      {animeDetail.genres.map((genre, index) => (
                        <span key={`genre-${index}-${genre}`} className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm">{genre}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synopsis */}
                {animeDetail.synopsis && (
                  <div className="mt-6">
                    <h3 className="text-white font-semibold mb-2">Synopsis:</h3>
                    <p className="text-dark-300 leading-relaxed">{animeDetail.synopsis}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Episodes List */}
          {animeDetail.episodes && Array.isArray(animeDetail.episodes) && animeDetail.episodes.length > 0 && (
            <div className="card p-6">
              <h2 className="text-white text-xl font-semibold mb-4">Daftar Episode</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {animeDetail.episodes.map((episode, index) => {
                  const episodeKey = episode.id || episode.url || `episode-${index}`;
                  const episodeUrl = episode.url || episode.link;
                  // arahkan ke rute baru episode/[id] jika id tersedia
                  let href = `/episode-player?url=${encodeURIComponent(episodeUrl)}&title=${encodeURIComponent(animeDetail.title)}`;
                  if (episode.id) href = `/episode/${encodeURIComponent(episode.id)}?title=${encodeURIComponent(animeDetail.title)}`;
                  return (
                    <Link key={episodeKey} href={href} className="block p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Episode {episode.episodeNumber || episode.number || index + 1}</h3>
                          {episode.title && <p className="text-dark-300 text-sm mt-1">{episode.title}</p>}
                        </div>
                        <FiPlay className="w-5 h-5 text-primary-400" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const slug = params?.slug;
    if (!slug) return { notFound: true };
    const targetUrl = `https://v1.samehadaku.how/anime/${slug}/`;
    const res = await axiosGet(`/api/anime-detail`, { params: { url: targetUrl } });
    if (!res.data?.success) {
      return { props: { error: res.data?.message || 'Gagal memuat detail anime' } };
    }
    const detailData = res.data.data || {};
    // Enrich imageUrl from anime-list
    try {
      const listRes = await axiosGet('/api/anime-list', { params: { search: detailData.title, limit: 1 } });
      const list = listRes.data?.data?.anime || [];
      const match = list.find((a) => a.title && detailData.title && (
        a.title.toLowerCase().includes(detailData.title.toLowerCase()) ||
        detailData.title.toLowerCase().includes(a.title.toLowerCase())
      ));
      if (match?.imageUrl) detailData.imageUrl = match.imageUrl;
    } catch (_) {}

    const canonical = `https://gitanime-web.vercel.app/anime/${slug}`;
    return { props: { animeDetail: detailData, canonical } };
  } catch (e) {
    return { props: { error: e?.message || 'Gagal memuat detail anime' } };
  }
}


