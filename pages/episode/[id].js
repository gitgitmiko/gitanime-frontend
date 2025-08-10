import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { axiosGet } from '../../utils/api';
import VideoPlayer from '../../components/VideoPlayer';
import EpisodeLoading from '../../components/EpisodeLoading';

export default function EpisodeById({ initialData, initialSelectedUrl, canonical }) {
  const router = useRouter();
  const { title } = router.query;
  const [videoData, setVideoData] = useState(initialData || null);
  const [loading, setLoading] = useState(true); // Selalu mulai dengan loading true
  const [error, setError] = useState(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(initialSelectedUrl || null);
  const [highlightOptions, setHighlightOptions] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Memuat episode...');
  const [isNavigating, setIsNavigating] = useState(false);
  const optionsRef = useRef(null);

  const buildProxiedUrl = (originalUrl) => {
    if (!originalUrl || typeof originalUrl !== 'string') return null;
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const isHls = originalUrl.toLowerCase().includes('.m3u8');
    const path = isHls ? '/api/hls-proxy' : '/api/video-proxy';
    return `${backend}${path}?url=${encodeURIComponent(originalUrl)}`;
  };

  const fetchVideoData = async (episodeUrl) => {
    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingMessage('Memuat episode...');
      
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 80) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);
      
      const messageInterval = setInterval(() => {
        setLoadingMessage(prev => {
          const messages = [
            'Memuat episode...',
            'Mengambil data video...',
            'Menyiapkan player...',
            'Hampir selesai...'
          ];
          const currentIndex = messages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % messages.length;
          return messages[nextIndex];
        });
      }, 1500);
      
      const response = await axiosGet('/api/episode-video', { params: { url: episodeUrl } });
      
      // Clear intervals
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      
      if (response.data.success) {
        setLoadingProgress(100);
        setLoadingMessage('Episode berhasil dimuat!');
        
        // Small delay to show completion
        setTimeout(() => {
          setVideoData(response.data.data);
          const options = response.data.data.playerOptions || [];
          const isMatch720 = (opt) => /(premium|\b)p?\s*720/i.test(opt.text || '');
          const isMatch1080 = (opt) => /(premium|\b)p?\s*1080/i.test(opt.text || '');
          let def = options.find((o) => o.videoUrl && (o.id === 'player-option-3' || isMatch720(o)));
          if (!def) def = options.find((o) => o.videoUrl && (o.id === 'player-option-4' || isMatch1080(o)));
          if (!def) def = options.find((o) => o.videoUrl);
          if (def) setSelectedVideoUrl(buildProxiedUrl(def.videoUrl));
          else if (response.data.data.url) setSelectedVideoUrl(buildProxiedUrl(response.data.data.url));
          setLoading(false);
        }, 500);
      } else {
        setError(response.data.message || 'Tidak dapat memuat data video');
        setLoading(false);
      }
    } catch (e) {
      setError(e?.message || 'Terjadi kesalahan saat memuat data video');
      setLoading(false);
    }
  };

  const handleVideoSelect = (videoUrl) => setSelectedVideoUrl(buildProxiedUrl(videoUrl));
  const handleBack = () => router.back();
  const handleOpenSettings = () => {
    if (optionsRef.current) {
      optionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightOptions(true);
      setTimeout(() => setHighlightOptions(false), 1800);
    }
  };

  // Handle initial loading state and navigation
  useEffect(() => {
    // Jika ada initialData, langsung set loading false
    if (initialData) {
      setLoading(false);
      setLoadingProgress(100);
      setLoadingMessage('Episode berhasil dimuat!');
    } else {
      // Jika tidak ada initialData, fetch data
      setLoading(true);
      setLoadingProgress(0);
      setLoadingMessage('Memuat episode...');
      
      // Auto-fetch data if not available
      const episodeUrl = `https://v1.samehadaku.how/${router.query.id}/`;
      fetchVideoData(episodeUrl);
    }
  }, [initialData, router.query.id]);

  // Add loading state for better UX
  useEffect(() => {
    if (loading && loadingProgress < 100) {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 8;
        });
      }, 300);
      
      return () => clearInterval(progressInterval);
    }
  }, [loading, loadingProgress]);

  // Handle route change events for better loading experience
  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      if (url.includes('/episode/')) {
        setIsNavigating(true);
        setLoadingMessage('Memuat episode...');
        setLoadingProgress(0);
      }
    };

    const handleRouteChangeComplete = () => {
      setIsNavigating(false);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  // Tampilkan loading jika sedang loading atau navigating
  if (loading || isNavigating) {
    return <EpisodeLoading title={title} progress={loadingProgress} message={loadingMessage} />;
  }

  if (error && !selectedVideoUrl) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-red-500 text-6xl mb-4 animate-bounce">⚠️</div>
          <h1 className="text-white text-xl mb-2 font-semibold">Terjadi Kesalahan</h1>
          <p className="text-dark-300 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={handleBack} 
            className="btn-primary px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200"
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{title ? `${title} - GitAnime` : 'Episode Player - GitAnime'}</title>
        {canonical && <link rel="canonical" href={canonical} />}
        {/* Open Graph */}
        <meta property="og:type" content="video.other" />
        <meta property="og:site_name" content="GitAnime" />
        <meta property="og:title" content={title || 'Episode Player'} />
        {canonical && <meta property="og:url" content={canonical} />}
        {/* Twitter */}
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content={title || 'Episode Player'} />
        {/* JSON-LD VideoObject enrinched + Breadcrumb */}
        {title && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'VideoObject',
                name: title,
                description: `Tonton ${title} di GitAnime`,
                uploadDate: (videoData?.createdAt || new Date()).toString(),
                thumbnailUrl: videoData?.thumbnailUrl || undefined,
                embedUrl: canonical,
                contentUrl: selectedVideoUrl || undefined,
                publisher: {
                  '@type': 'Organization',
                  name: 'GitAnime',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://gitanime-web.vercel.app/favicon.svg'
                  }
                }
              }),
            }}
          />
        )}
        {canonical && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://gitanime-web.vercel.app/' },
                  { '@type': 'ListItem', position: 2, name: 'Episode', item: 'https://gitanime-web.vercel.app/episode' },
                  { '@type': 'ListItem', position: 3, name: title || 'Episode', item: canonical },
                ]
              })
            }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-dark-900">
        {/* Header */}
        <div className="bg-dark-800 border-b border-dark-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={handleBack} className="btn-secondary">← Kembali</button>
              <h1 className="text-white text-xl font-semibold">{title || 'Episode Player'}</h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          {selectedVideoUrl && (
            <div className="mb-6">
              <VideoPlayer videoUrl={selectedVideoUrl} title={title} onOpenSettings={handleOpenSettings} />
            </div>
          )}

          {videoData?.playerOptions?.length > 0 && (
            <div ref={optionsRef} className={`card p-4 sm:p-6 mb-6 transition-shadow ${highlightOptions ? 'ring-2 ring-primary-500' : ''}`}>
              <h2 className="text-white text-xl font-semibold mb-4">Pilih Kualitas Video</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {videoData.playerOptions.map((option) => {
                  const proxyUrl = option.videoUrl ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/video-proxy?url=${encodeURIComponent(option.videoUrl)}` : null;
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
                      {option.videoUrl ? (
                        <div className="text-[10px] sm:text-xs text-green-400 mt-1">✓ Tersedia</div>
                      ) : (
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

export async function getServerSideProps({ params, query }) {
  try {
    const id = params?.id;
    if (!id) return { notFound: true };
    
    // Simulate API delay for better loading experience
    const episodeUrl = `https://v1.samehadaku.how/${id}/`;
    
    // Add artificial delay to simulate real API response time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const res = await axiosGet('/api/episode-video', { params: { url: episodeUrl } });
    if (!res.data?.success) {
      return { props: { initialData: null, initialSelectedUrl: null, canonical: `https://gitanime-web.vercel.app/episode/${id}` } };
    }
    const data = res.data.data || {};
    const options = data.playerOptions || [];
    const isMatch720 = (opt) => /(premium|\b)p?\s*720/i.test(opt.text || '');
    const isMatch1080 = (opt) => /(premium|\b)p?\s*1080/i.test(opt.text || '');
    let def = options.find((o) => o.videoUrl && (o.id === 'player-option-3' || isMatch720(o)));
    if (!def) def = options.find((o) => o.videoUrl && (o.id === 'player-option-4' || isMatch1080(o)));
    if (!def) def = options.find((o) => o.videoUrl);
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const buildProxiedUrl = (originalUrl) => {
      if (!originalUrl || typeof originalUrl !== 'string') return null;
      const isHls = originalUrl.toLowerCase().includes('.m3u8');
      const path = isHls ? '/api/hls-proxy' : '/api/video-proxy';
      return `${backend}${path}?url=${encodeURIComponent(originalUrl)}`;
    };
    const selected = def ? buildProxiedUrl(def.videoUrl) : data.url ? buildProxiedUrl(data.url) : null;
    const canonical = `https://gitanime-web.vercel.app/episode/${id}`;
    return { props: { initialData: data, initialSelectedUrl: selected, canonical } };
  } catch (e) {
    return { props: { initialData: null, initialSelectedUrl: null, canonical: null } };
  }
}


