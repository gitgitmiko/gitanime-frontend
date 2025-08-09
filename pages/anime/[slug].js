import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { axiosGet } from '../../utils/api';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlay, FiCalendar, FiClock, FiTag, FiStar } from 'react-icons/fi';

export default function AnimeSlugDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [animeDetail, setAnimeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildAnimeUrl = (s) => `https://v1.samehadaku.how/anime/${s}/`;

  useEffect(() => {
    if (slug) {
      fetchAnimeDetail(buildAnimeUrl(slug));
    }
  }, [slug]);

  const fetchAnimeDetail = async (targetUrl) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosGet(`/api/anime-detail?url=${encodeURIComponent(targetUrl)}`);

      if (response.data && response.data.success) {
        const detailData = response.data.data;

        // Coba enrich imageUrl dari anime-list
        try {
          const animeListResponse = await axiosGet('/api/anime-list', {
            params: { search: detailData.title, limit: 1 }
          });

          if (animeListResponse.data?.success && animeListResponse.data.data?.anime?.length > 0) {
            const match = animeListResponse.data.data.anime.find((a) =>
              a.title && detailData.title && (
                a.title.toLowerCase().includes(detailData.title.toLowerCase()) ||
                detailData.title.toLowerCase().includes(a.title.toLowerCase())
              )
            );
            if (match?.imageUrl) detailData.imageUrl = match.imageUrl;
          }
        } catch (_) {}

        setAnimeDetail(detailData);
      } else {
        setError(response.data?.message || 'Gagal memuat detail anime');
      }
    } catch (err) {
      setError(err?.message || 'Gagal memuat detail anime');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.back();

  const canonical = slug ? `https://gitanime-web.vercel.app/anime/${slug}` : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-white mt-4">Memuat detail anime...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-dark-900">
      <Head>
        <title>{animeDetail.title ? `${animeDetail.title} - GitAnime` : 'Detail Anime - GitAnime'}</title>
        {canonical && <link rel="canonical" href={canonical} />}
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


