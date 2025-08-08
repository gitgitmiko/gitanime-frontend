import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VideoPlayer from '../components/VideoPlayer';
import { axiosGet } from '../utils/api';

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
      setError(null);
      
      // Try to fetch video data from API
      const response = await axiosGet('/api/episode-video', { 
        params: { url: url } 
      });
      
      if (response.data.success) {
        setVideoData(response.data.data);
        // Set default video URL if available
        if (response.data.data.url) {
          setSelectedVideoUrl(response.data.data.url);
        } else if (response.data.data.playerOptions && response.data.data.playerOptions.length > 0) {
          // Set first available video URL
          const firstAvailable = response.data.data.playerOptions.find(option => option.videoUrl);
          if (firstAvailable) {
            setSelectedVideoUrl(firstAvailable.videoUrl);
          }
        }
      } else {
        // If API fails, try to construct video URL directly from the episode URL
        console.log('API failed, trying direct video URL construction');
        const directVideoUrl = constructDirectVideoUrl(url);
        if (directVideoUrl) {
          setSelectedVideoUrl(directVideoUrl);
          setVideoData({
            episodeUrl: url,
            url: directVideoUrl,
            type: 'direct',
            playerOptions: [
              {
                id: 'direct',
                text: 'Video Langsung',
                videoUrl: directVideoUrl
              }
            ]
          });
        } else {
          setError('Tidak dapat memuat data video untuk episode ini');
        }
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
      // Try direct video URL construction as fallback
      const directVideoUrl = constructDirectVideoUrl(url);
      if (directVideoUrl) {
        setSelectedVideoUrl(directVideoUrl);
        setVideoData({
          episodeUrl: url,
          url: directVideoUrl,
          type: 'direct',
          playerOptions: [
            {
              id: 'direct',
              text: 'Video Langsung',
              videoUrl: directVideoUrl
            }
          ]
        });
      } else {
        setError('Terjadi kesalahan saat memuat data video');
      }
    } finally {
      setLoading(false);
    }
  };

  const constructDirectVideoUrl = (episodeUrl) => {
    if (!episodeUrl) return null;
    
    try {
      // Extract episode ID from URL
      const urlParts = episodeUrl.split('/');
      const episodeId = urlParts[urlParts.length - 2]; // Get the episode ID
      
      // Construct direct video URL
      // This is a fallback method - you might need to adjust based on your backend structure
      const directUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/video/${episodeId}`;
      return directUrl;
    } catch (error) {
      console.error('Error constructing direct video URL:', error);
      return null;
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
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-white mt-4">Memuat video...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedVideoUrl) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-white text-xl mb-2">Terjadi Kesalahan</h1>
          <p className="text-dark-300 mb-4">{error}</p>
          <button
            onClick={handleBack}
            className="btn-primary"
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
      
      <div className="min-h-screen bg-dark-900">
        {/* Header */}
        <div className="bg-dark-800 border-b border-dark-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="btn-secondary"
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
              <VideoPlayer videoUrl={selectedVideoUrl} title={title} />
            </div>
          )}

          {/* Player Options */}
          {videoData && videoData.playerOptions && videoData.playerOptions.length > 0 && (
            <div className="card p-6 mb-6">
              <h2 className="text-white text-xl font-semibold mb-4">Pilih Kualitas Video</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {videoData.playerOptions.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => handleVideoSelect(option.videoUrl)}
                    disabled={!option.videoUrl}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      !option.videoUrl 
                        ? 'bg-dark-600 text-dark-500 cursor-not-allowed'
                        : selectedVideoUrl === option.videoUrl
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 hover:bg-dark-600 text-dark-300'
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
          <div className="card p-6">
            <h2 className="text-white text-xl font-semibold mb-4">Informasi Video</h2>
            <div className="space-y-2 text-dark-300">
              <p><strong>Episode URL:</strong> {videoData?.episodeUrl}</p>
              <p><strong>Video Type:</strong> {videoData?.type || 'Tidak tersedia'}</p>
              <p><strong>Player Options:</strong> {videoData?.playerOptions?.length || 0} opsi tersedia</p>
            </div>
          </div>

          {/* Direct Video Links */}
          {videoData && videoData.playerOptions && videoData.playerOptions.some(option => option.videoUrl) && (
            <div className="card p-6 mt-6">
              <h2 className="text-white text-xl font-semibold mb-4">Link Video Langsung</h2>
              <div className="space-y-3">
                {videoData.playerOptions
                  .filter(option => option.videoUrl)
                  .map((option, index) => (
                    <div key={option.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <span className="text-dark-300">{option.text}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVideoSelect(option.videoUrl)}
                          className="btn-primary text-sm"
                        >
                          Putar
                        </button>
                        <a
                          href={option.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm"
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
