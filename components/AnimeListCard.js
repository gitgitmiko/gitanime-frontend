import Link from 'next/link';
import Image from 'next/image';
import { FiPlay, FiEye, FiStar, FiTag, FiClock } from 'react-icons/fi';

function extractAnimeSlug(link) {
  try {
    const url = new URL(link);
    // path like /anime/slug/
    const segments = url.pathname.split('/').filter(Boolean);
    const last = segments[segments.length - 1];
    const second = segments[segments.length - 2];
    if (second === 'anime') return last; // typical pattern
    return last;
  } catch (_) {
    // fallback: try remove trailing slash
    if (typeof link === 'string') {
      const parts = link.split('/').filter(Boolean);
      return parts[parts.length - 1] || '';
    }
    return '';
  }
}

export default function AnimeListCard({ anime, viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <Link href={`/anime/${encodeURIComponent(extractAnimeSlug(anime.link))}`}>
        <div className="anime-card flex items-center space-x-4 p-4 hover:bg-dark-700 transition-colors duration-200 rounded-lg">
          {/* Image */}
          <div className="flex-shrink-0">
            {anime.imageUrl ? (
              <div className="relative w-20 h-28 rounded-lg overflow-hidden">
                <Image
                  src={anime.imageUrl}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x112/1f2937/6b7280?text=No+Image';
                  }}
                  onLoad={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                />
              </div>
            ) : (
              <div className="w-20 h-28 bg-dark-700 rounded-lg flex items-center justify-center">
                <FiPlay className="w-8 h-8 text-dark-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate mb-1">
              {anime.title}
            </h3>
            
            {/* Rating */}
            {anime.rating && (
              <div className="flex items-center space-x-1 mb-2">
                <FiStar className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400">{anime.rating}</span>
              </div>
            )}

            {/* Info */}
            <div className="flex items-center space-x-4 text-sm text-dark-400 mb-2">
              {anime.type && (
                <span className="flex items-center space-x-1">
                  <FiTag className="w-4 h-4" />
                  <span>{anime.type}</span>
                </span>
              )}
              {anime.status && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  anime.status.toLowerCase().includes('ongoing') || anime.status.toLowerCase().includes('sedang')
                    ? 'bg-yellow-600 text-yellow-100'
                    : anime.status.toLowerCase().includes('completed') || anime.status.toLowerCase().includes('selesai')
                    ? 'bg-green-600 text-green-100'
                    : 'bg-dark-600 text-dark-200'
                }`}>
                  {anime.status}
                </span>
              )}
              {anime.episodeInfo && (
                <span className="flex items-center space-x-1">
                  <FiPlay className="w-4 h-4" />
                  <span>{anime.episodeInfo}</span>
                </span>
              )}
            </div>

            {/* Genres */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {anime.genres.slice(0, 3).map((genre, index) => (
                  <span key={index} className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                    {genre}
                  </span>
                ))}
                {anime.genres.length > 3 && (
                  <span className="text-xs text-dark-400">+{anime.genres.length - 3} more</span>
                )}
              </div>
            )}

            {/* Description */}
            {anime.description && (
              <p className="text-sm text-dark-300 line-clamp-2">
                {anime.description}
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors duration-200">
              <FiEye className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid mode (default)
  return (
    <Link href={`/anime/${encodeURIComponent(extractAnimeSlug(anime.link))}`}>
      <div className="anime-card group">
        {/* Image Container */}
        <div className="relative overflow-hidden rounded-t-lg">
          {anime.imageUrl ? (
            <div className="relative w-full h-48">
              <Image
                src={anime.imageUrl}
                alt={anime.title}
                fill
                className="anime-image object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200/1f2937/6b7280?text=No+Image';
                }}
                onLoad={(e) => {
                  e.target.style.opacity = '1';
                }}
                style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-dark-700 flex items-center justify-center">
              <FiPlay className="w-16 h-16 text-dark-400" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <FiEye className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium">Detail</span>
                </div>
                {anime.rating && (
                  <div className="flex items-center space-x-1">
                    <FiStar className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm">{anime.rating}</span>
                  </div>
                )}
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

          {/* Rating Badge */}
          {anime.rating && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-600 text-yellow-100 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <FiStar className="w-3 h-3" />
                <span>{anime.rating}</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors duration-200">
            {anime.title}
          </h3>

          {/* Info Row */}
          <div className="flex items-center justify-between text-sm text-dark-400 mb-3">
            <div className="flex items-center space-x-2">
              {anime.type && (
                <span className="flex items-center space-x-1">
                  <FiTag className="w-4 h-4" />
                  <span>{anime.type}</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {anime.episodeInfo && (
                <span className="flex items-center space-x-1">
                  <FiPlay className="w-4 h-4" />
                  <span>{anime.episodeInfo}</span>
                </span>
              )}
            </div>
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {anime.genres.slice(0, 2).map((genre, index) => (
                <span key={index} className="text-xs bg-primary-600 text-white px-2 py-1 rounded">
                  {genre}
                </span>
              ))}
              {anime.genres.length > 2 && (
                <span className="text-xs text-dark-400">+{anime.genres.length - 2} more</span>
              )}
            </div>
          )}

          {/* Description */}
          {anime.description && (
            <p className="text-sm text-dark-300 line-clamp-2">
              {anime.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
