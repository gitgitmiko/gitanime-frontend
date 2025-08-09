import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { axiosGet } from '../../utils/api';
import VideoPlayer from '../../components/VideoPlayer';

export default function EpisodeById({ initialData, initialSelectedUrl, canonical }) {
  const router = useRouter();
  const { title } = router.query;
  const [videoData, setVideoData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState(initialSelectedUrl || null);
  const [highlightOptions, setHighlightOptions] = useState(false);
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
      const response = await axiosGet('/api/episode-video', { params: { url: episodeUrl } });
      if (response.data.success) {
        setVideoData(response.data.data);
        const options = response.data.data.playerOptions || [];
        const isMatch720 = (opt) => /(premium|\b)p?\s*720/i.test(opt.text || '');
        const isMatch1080 = (opt) => /(premium|\b)p?\s*1080/i.test(opt.text || '');
        let def = options.find((o) => o.videoUrl && (o.id === 'player-option-3' || isMatch720(o)));
        if (!def) def = options.find((o) => o.videoUrl && (o.id === 'player-option-4' || isMatch1080(o)));
        if (!def) def = options.find((o) => o.videoUrl);
        if (def) setSelectedVideoUrl(buildProxiedUrl(def.videoUrl));
        else if (response.data.data.url) setSelectedVideoUrl(buildProxiedUrl(response.data.data.url));
      } else {
        setError(response.data.message || 'Tidak dapat memuat data video');
      }
    } catch (e) {
      setError(e?.message || 'Terjadi kesalahan saat memuat data video');
    } finally {
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
          <button onClick={handleBack} className="btn-primary">Kembali</button>
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
    const episodeUrl = `https://v1.samehadaku.how/${id}/`;
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


