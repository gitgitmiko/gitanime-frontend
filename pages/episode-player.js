import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function EpisodePlayer() {
  const router = useRouter();
  const { url, title } = router.query;
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(null);

  useEffect(() => {
    if (url) {
      fetchVideoData();
    }
  }, [url]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/episode-video?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.success) {
        setVideoData(data.data);
        // Set default video URL if available
        if (data.data.url) {
          setSelectedVideoUrl(data.data.url);
        }
      } else {
        setError(data.message || 'Gagal memuat data video');
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
      setError('Terjadi kesalahan saat memuat data video');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (videoUrl) => {
    setSelectedVideoUrl(videoUrl);
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-white mt-4">Memuat video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-xl mb-2">Terjadi Kesalahan</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title || 'Episode Player'} - GitAnime</title>
      </Head>
      
      <div className="min-h-screen bg-gray-900">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Kembali
              </button>
              <h1 className="text-white text-xl font-semibold">
                {title || 'Episode Player'}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          {/* Video Player */}
          {selectedVideoUrl && (
            <div className="mb-6">
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-96 md:h-[500px] lg:h-[600px]"
                  src={selectedVideoUrl}
                  poster="/video-poster.jpg"
                >
                  Browser Anda tidak mendukung tag video.
                </video>
              </div>
            </div>
          )}

          {/* Player Options */}
          {videoData && videoData.playerOptions && videoData.playerOptions.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-white text-xl font-semibold mb-4">Pilih Kualitas Video</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {videoData.playerOptions.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => handleVideoSelect(option.videoUrl)}
                    disabled={!option.videoUrl}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      !option.videoUrl 
                        ? 'bg-gray-600 text-gray-500 cursor-not-allowed'
                        : selectedVideoUrl === option.videoUrl
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {option.text}
                    {option.videoUrl && (
                      <div className="text-xs text-green-400 mt-1">✓ Tersedia</div>
                    )}
                    {!option.videoUrl && (
                      <div className="text-xs text-red-400 mt-1">✗ Tidak tersedia</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Video Information */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">Informasi Video</h2>
            <div className="space-y-2 text-gray-300">
              <p><strong>Episode URL:</strong> {videoData?.episodeUrl}</p>
              <p><strong>Video Type:</strong> {videoData?.type || 'Tidak tersedia'}</p>
              <p><strong>Player Options:</strong> {videoData?.playerOptions?.length || 0} opsi tersedia</p>
            </div>
          </div>

          {/* Direct Video Links */}
          {videoData && videoData.playerOptions && videoData.playerOptions.some(option => option.videoUrl) && (
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h2 className="text-white text-xl font-semibold mb-4">Link Video Langsung</h2>
              <div className="space-y-3">
                {videoData.playerOptions
                  .filter(option => option.videoUrl)
                  .map((option, index) => (
                    <div key={option.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">{option.text}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVideoSelect(option.videoUrl)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Putar
                        </button>
                        <a
                          href={option.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Buka
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
