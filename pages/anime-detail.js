import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { axiosGet } from '../utils/api';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlay, FiArrowLeft, FiCalendar, FiClock, FiTag, FiStar } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AnimeDetail() {
  const router = useRouter();
  const { url } = router.query;
  const [animeDetail, setAnimeDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (url) {
      fetchAnimeDetail();
    }
  }, [url]);

  const fetchAnimeDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosGet(`/api/anime-detail?url=${encodeURIComponent(url)}`);
      
      if (response.data.success) {
        setAnimeDetail(response.data.data);
      } else {
        setError(response.data.message || 'Gagal memuat detail anime');
      }
    } catch (error) {
      console.error('Error fetching anime detail:', error);
      setError('Gagal memuat detail anime');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat detail anime..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
        <p className="text-dark-300 mb-6">{error}</p>
        <button onClick={fetchAnimeDetail} className="btn-primary">
          Coba Lagi
        </button>
      </div>
    );
  }

  if (!animeDetail) {
    return (
      <div className="text-center py-12">
        <div className="text-dark-400 text-6xl mb-4">📺</div>
        <h3 className="text-xl font-semibold text-white mb-2">Anime Tidak Ditemukan</h3>
        <p className="text-dark-300 mb-6">
          Detail anime tidak dapat dimuat.
        </p>
        <Link href="/latest" className="btn-primary">
          Kembali ke Terbaru
        </Link>
      </div>
    );
  }

  return (
      <div className="space-y-8">
        {/* Back Button */}
        <div className="mb-4">
          <Link 
            href="/latest"
            className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors duration-200 text-sm"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>← Kembali ke Terbaru</span>
          </Link>
        </div>

        {/* Anime Header */}
        <div className="card p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Anime Image */}
            <div className="flex-shrink-0">
              {(animeDetail.episodeScreenshot || animeDetail.image) ? (
                <div className="w-48 h-64 relative rounded-lg overflow-hidden">
                  <Image
                    src={animeDetail.episodeScreenshot || animeDetail.image || 'https://via.placeholder.com/192x256/1f2937/6b7280?text=No+Image'}
                    alt={animeDetail.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/192x256/1f2937/6b7280?text=No+Image';
                    }}
                    onLoad={(e) => {
                      e.target.style.opacity = '1';
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
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
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{animeDetail.title}</h1>
              
              {animeDetail.japanese && (
                <p className="text-dark-300 mb-2">
                  <strong className="text-white">Japanese:</strong> {animeDetail.japanese}
                </p>
              )}
              
              {animeDetail.english && (
                <p className="text-dark-300 mb-2">
                  <strong className="text-white">English:</strong> {animeDetail.english}
                </p>
              )}

              {/* Anime Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {animeDetail.status && (
                  <div className="flex items-center space-x-2">
                    <FiTag className="w-4 h-4 text-primary-400" />
                    <span className="text-dark-300">
                      <strong className="text-white">Status:</strong> {animeDetail.status}
                    </span>
                  </div>
                )}
                
                {animeDetail.type && (
                  <div className="flex items-center space-x-2">
                    <FiPlay className="w-4 h-4 text-primary-400" />
                    <span className="text-dark-300">
                      <strong className="text-white">Type:</strong> {animeDetail.type}
                    </span>
                  </div>
                )}
                
                {animeDetail.duration && (
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-primary-400" />
                    <span className="text-dark-300">
                      <strong className="text-white">Duration:</strong> {animeDetail.duration}
                    </span>
                  </div>
                )}
                
                {animeDetail.totalEpisode && (
                  <div className="flex items-center space-x-2">
                    <FiStar className="w-4 h-4 text-primary-400" />
                    <span className="text-dark-300">
                      <strong className="text-white">Episodes:</strong> {animeDetail.totalEpisode}
                    </span>
                  </div>
                )}
                
                {animeDetail.season && (
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="w-4 h-4 text-primary-400" />
                    <span className="text-dark-300">
                      <strong className="text-white">Season:</strong> {animeDetail.season}
                    </span>
                  </div>
                )}
                
                {animeDetail.studio && (
                  <div className="flex items-center space-x-2">
                    <FiPlay className="w-4 h-4 text-primary-400" />
                    <span className="text-dark-300">
                      <strong className="text-white">Studio:</strong> {animeDetail.studio}
                    </span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {animeDetail.genres && animeDetail.genres.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {animeDetail.genres.map((genre, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary-500 text-white text-sm rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Episodes */}
        {animeDetail.episodes && animeDetail.episodes.length > 0 && (
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              Daftar Episode ({animeDetail.episodes.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {animeDetail.episodes.map((episode) => (
                <Link
                  key={episode.id}
                  href={`/episode-player?url=${encodeURIComponent(episode.link)}&title=${encodeURIComponent(animeDetail.title)}`}
                  className="block p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                        <FiPlay className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors duration-200">
                        {episode.title}
                      </h3>
                      <p className="text-xs text-dark-300">
                        Episode {episode.number}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Episodes */}
        {(!animeDetail.episodes || animeDetail.episodes.length === 0) && (
          <div className="card p-6 text-center">
            <div className="text-dark-400 text-4xl mb-4">📺</div>
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Episode</h3>
            <p className="text-dark-300">
              Episode untuk anime ini belum tersedia.
            </p>
          </div>
        )}
      </div>
  );
}
