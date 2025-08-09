import { useState, useEffect, useRef } from 'react';
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
  const [highlightOptions, setHighlightOptions] = useState(false);
  const optionsRef = useRef(null);

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
        
        // Directly try to find player-option-4 first, then fallback to first available
        if (response.data.data.playerOptions && response.data.data.playerOptions.length > 0) {
          let defaultOption = response.data.data.playerOptions.find(option => option.id === 'player-option-4' && option.videoUrl);
          
          if (!defaultOption) {
            // If player-option-4 not found or not available, use first available
            defaultOption = response.data.data.playerOptions.find(option => option.videoUrl);
          }
          
          if (defaultOption) {
            const proxyUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/video-proxy?url=${encodeURIComponent(defaultOption.videoUrl)}`;
            setSelectedVideoUrl(proxyUrl);
          }
        } else if (response.data.data.url) {
          // Fallback to default URL only if no player options available
          const proxyUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/video-proxy?url=${encodeURIComponent(response.data.data.url)}`;
          setSelectedVideoUrl(proxyUrl);
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
            playerOptions: []
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
          playerOptions: []
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
      // Construct direct video URL using backend proxy
      const directUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/video-proxy?url=${encodeURIComponent(episodeUrl)}`;
      return directUrl;
    } catch (error) {
      console.error('Error constructing direct video URL:', error);
      return null;
    }
  };

  const handleVideoSelect = (videoUrl) => {
    // Convert video URL to use backend proxy
    const proxyUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/video-proxy?url=${encodeURIComponent(videoUrl)}`;
    setSelectedVideoUrl(proxyUrl);
  };

  const handleBack = () => {
    router.back();
  };

  const handleOpenSettings = () => {
    if (optionsRef.current) {
      optionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightOptions(true);
      setTimeout(() => setHighlightOptions(false), 1800);
    }
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
              <VideoPlayer videoUrl={selectedVideoUrl} title={title} onOpenSettings={handleOpenSettings} />
            </div>
          )}

          {/* Player Options */}
          {videoData && videoData.playerOptions && videoData.playerOptions.length > 0 && (
            <div ref={optionsRef} className={`card p-4 sm:p-6 mb-6 transition-shadow ${highlightOptions ? 'ring-2 ring-primary-500' : ''}`}>
              <h2 className="text-white text-xl font-semibold mb-4">Pilih Kualitas Video</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {videoData.playerOptions.map((option, index) => {
                  const proxyUrl = option.videoUrl ? 
                    `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/video-proxy?url=${encodeURIComponent(option.videoUrl)}` : 
                    null;
                  
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleVideoSelect(option.videoUrl)}
                      disabled={!option.videoUrl}
                      className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        !option.videoUrl 
                          ? 'bg-dark-600 text-dark-500 cursor-not-allowed'
                          : selectedVideoUrl === proxyUrl
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 hover:bg-dark-600 text-dark-300'
                      }`}
                    >
                      {option.text}
                      {option.videoUrl && (
                        <div className="text-[10px] sm:text-xs text-green-400 mt-1">✓ Tersedia</div>
                      )}
                      {!option.videoUrl && (
                        <div className="text-[10px] sm:text-xs text-red-400 mt-1">✗ Tidak tersedia</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
