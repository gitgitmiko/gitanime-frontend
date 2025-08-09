import Link from 'next/link';
import Image from 'next/image';
import { FiPlay, FiEye, FiClock, FiUser } from 'react-icons/fi';

export default function AnimeCard({ anime, viewMode = 'grid' }) {
  // Construct the correct episode URL
  const constructEpisodeUrl = () => {
    if (anime.id) {
      // Use the episode ID to construct the correct URL
      return `https://v1.samehadaku.how/${anime.id}/`;
    }
    // Fallback to original link if no ID
    return anime.link;
  };

  const episodeUrl = constructEpisodeUrl();

  // Get the best available image URL
  const getImageUrl = () => {
    // Priority: imageUrl > episodeScreenshot > image
    return anime.imageUrl || anime.episodeScreenshot || anime.image;
  };

  const imageUrl = getImageUrl();

  if (viewMode === 'list') {
    return (
      <Link href={`/episode-player?url=${encodeURIComponent(episodeUrl)}&title=${encodeURIComponent(anime.title)}`}>
        <div className="anime-card flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-lg hover:bg-dark-700 transition-colors duration-200">
          {/* Image */}
          <div className="flex-shrink-0">
            {imageUrl ? (
              <div className="relative w-16 h-20 sm:w-20 sm:h-28 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 64px, 80px"
                  onError={(e) => {
                    // Hide the image on error and show fallback
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                />
                {/* Fallback div */}
                <div className="w-16 h-20 sm:w-20 sm:h-28 bg-dark-700 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
                  <FiPlay className="w-6 h-6 sm:w-8 sm:h-8 text-dark-400" />
                </div>
              </div>
            ) : (
              <div className="w-16 h-20 sm:w-20 sm:h-28 bg-dark-700 rounded-lg flex items-center justify-center">
                <FiPlay className="w-6 h-6 sm:w-8 sm:h-8 text-dark-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white truncate mb-1">
              {anime.title}
            </h3>
            {anime.altTitle && (
              <p className="text-xs sm:text-sm text-dark-300 mb-2 line-clamp-1">{anime.altTitle}</p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-dark-400">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Episode {anime.episodeNumber || 'N/A'}</span>
              </span>
              {anime.postedBy && (
                <span className="inline-flex items-center gap-1 text-primary-400 whitespace-nowrap">
                  <span className="text-dark-500">•</span>
                  <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{anime.postedBy}</span>
                </span>
              )}
              {anime.releasedOn && (
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span className="text-dark-500">•</span>
                  <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{anime.releasedOn}</span>
                </span>
              )}
            </div>
          </div>

          {/* Play Button */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors duration-200">
              <FiPlay className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid mode (default)
  return (
    <Link href={anime.id ? `/episode/${encodeURIComponent(anime.id)}?title=${encodeURIComponent(anime.title)}` : `/episode-player?url=${encodeURIComponent(episodeUrl)}&title=${encodeURIComponent(anime.title)}`}>
      <div className="anime-card group rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          {imageUrl ? (
            <div className="relative w-full h-40 sm:h-48">
              <Image
                src={imageUrl}
                alt={anime.title}
                fill
                className="anime-image object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onError={(e) => {
                  // Hide the image on error and show fallback
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
                onLoad={(e) => {
                  e.target.style.opacity = '1';
                }}
                style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
              />
              {/* Fallback div */}
              <div className="w-full h-40 sm:h-48 bg-dark-700 flex items-center justify-center" style={{ display: 'none' }}>
                <FiPlay className="w-12 h-12 sm:w-16 sm:h-16 text-dark-400" />
              </div>
            </div>
          ) : (
            <div className="w-full h-40 sm:h-48 bg-dark-700 flex items-center justify-center">
              <FiPlay className="w-12 h-12 sm:w-16 sm:h-16 text-dark-400" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <FiPlay className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span className="text-white text-xs sm:text-sm font-medium">Tonton</span>
                </div>
                <div className="text-white text-xs sm:text-sm">
                  Episode {anime.episodeNumber || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {anime.status && (
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                anime.status.toLowerCase().includes('ongoing') || anime.status.toLowerCase().includes('sedang')
                  ? 'bg-yellow-600 text-yellow-100'
                  : anime.status.toLowerCase().includes('completed') || anime.status.toLowerCase().includes('selesai')
                  ? 'bg-green-600 text-green-100'
                  : 'bg-dark-600 text-dark-200'
              }`}>
                {anime.status}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
          <div className="p-3 sm:p-4">
          <h3 className="text-sm sm:text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors duration-200">
            {anime.title}
          </h3>
          
          {anime.altTitle && (
            <p className="text-xs sm:text-sm text-dark-300 mb-3 line-clamp-1">
              {anime.altTitle}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-dark-400">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Episode {anime.episodeNumber || 'N/A'}</span>
            </span>
            {anime.postedBy && (
              <span className="inline-flex items-center gap-1 text-primary-400 whitespace-nowrap">
                <span className="text-dark-500">•</span>
                <FiUser className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{anime.postedBy}</span>
              </span>
            )}
            {anime.releasedOn && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <span className="text-dark-500">•</span>
                <FiClock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{anime.releasedOn}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
