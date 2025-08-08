import { useState, useEffect } from 'react';
import { axiosGet } from '../utils/api';
import Link from 'next/link';
import { FiArrowRight, FiEye } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Latest() {
  const [latestData, setLatestData] = useState({ latest: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestEpisodes();
  }, []);

  const fetchLatestEpisodes = async () => {
    try {
      setLoading(true);
      const response = await axiosGet('/api/latest');
      setLatestData(response.data || { latest: [], summary: {} });
    } catch (error) {
      console.error('Error fetching latest episodes:', error);
      setError('Gagal memuat episode terbaru');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Memuat episode terbaru..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
        <p className="text-dark-300 mb-6">{error}</p>
        <button onClick={fetchLatestEpisodes} className="btn-primary">
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gradient mb-4">
          Episode Terbaru
        </h1>
        <p className="text-xl text-dark-300 max-w-2xl mx-auto">
          Update episode anime terbaru yang baru saja ditambahkan ke GitAnime.
          Dapatkan notifikasi episode terbaru dari anime favorit Anda.
        </p>
      </div>

      {/* Summary Stats */}
      {latestData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center p-4">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {latestData.summary.totalAnime || 0}
            </div>
            <div className="text-sm text-dark-300">Total Anime</div>
          </div>
          <div className="card text-center p-4">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {latestData.summary.totalEpisodes || 0}
            </div>
            <div className="text-sm text-dark-300">Total Episode</div>
          </div>
          <div className="card text-center p-4">
            <div className="text-2xl font-bold text-primary-400 mb-1">
              {latestData.latest.length || 0}
            </div>
            <div className="text-sm text-dark-300">Anime Terbaru</div>
          </div>
        </div>
      )}

      {/* Latest Episodes */}
      {latestData.latest && latestData.latest.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Anime Terbaru ({latestData.latest.length})
            </h2>
            <Link 
              href="/"
              className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors duration-200"
            >
              <span>Lihat Semua Anime</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestData.latest.map((anime, index) => (
              <div key={index} className="card overflow-hidden group hover:shadow-lg transition-all duration-300">
                {/* Anime Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-dark-700 to-dark-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📺</div>
                    <div className="text-sm text-dark-400">Anime Poster</div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded">
                      {anime.totalEpisodes} EP
                    </span>
                  </div>
                </div>

                {/* Anime Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-primary-400 transition-colors duration-200 mb-4">
                    {anime.title}
                  </h3>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    <Link
                      href={`/anime-detail?url=${encodeURIComponent(`https://v1.samehadaku.how/anime/${anime.title.toLowerCase().replace(/\s+/g, '-')}/`)}`}
                      className="w-full btn-secondary text-center py-2 text-sm flex items-center justify-center space-x-1"
                    >
                      <FiEye className="w-4 h-4" />
                      <span>Detail Anime</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-dark-400 text-6xl mb-4">📺</div>
          <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Episode Terbaru</h3>
          <p className="text-dark-300 mb-6">
            Episode terbaru akan muncul di sini setelah scraping selesai.
          </p>
          <Link href="/" className="btn-primary">
            Lihat Semua Anime
          </Link>
        </div>
      )}

      {/* Info Section */}
      <div className="card p-6 mt-12">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            Tentang Update Otomatis
          </h3>
          <p className="text-dark-300 mb-4">
            GitAnime secara otomatis memperbarui data anime setiap jam dari samehadaku.how.
            Episode terbaru akan muncul di halaman ini segera setelah tersedia.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-primary-400 text-2xl mb-2">🔄</div>
              <p className="text-white font-medium">Update Otomatis</p>
              <p className="text-dark-300">Setiap jam</p>
            </div>
            <div className="text-center">
              <div className="text-primary-400 text-2xl mb-2">⚡</div>
              <p className="text-white font-medium">Real-time</p>
              <p className="text-dark-300">Data terbaru</p>
            </div>
            <div className="text-center">
              <div className="text-primary-400 text-2xl mb-2">🎯</div>
              <p className="text-white font-medium">Akurat</p>
              <p className="text-dark-300">Dari sumber resmi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
