'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface HeroMediaProps {
  videoSrc?: string;
  fallbackSrc: string;
  posterSrc?: string;
  alt: string;
  overlayContent?: React.ReactNode;
  className?: string;
  priority?: boolean;
}

export function HeroMedia({
  videoSrc,
  fallbackSrc,
  posterSrc,
  alt,
  overlayContent,
  className = '',
  priority = false,
}: HeroMediaProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
  };

  // Show static image if reduced motion is preferred, video failed to load, or no video source
  const showStaticImage = prefersReducedMotion || videoError || !videoSrc;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Video Background */}
      {!showStaticImage && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          aria-label={alt}
        >
          {videoSrc && <source src={videoSrc} type="video/mp4" />}
          {videoSrc?.replace('.mp4', '.webm') && (
            <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
          )}
          Your browser does not support the video tag.
        </video>
      )}

      {/* Fallback Static Image */}
      {(showStaticImage || !videoLoaded) && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            showStaticImage || !videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={fallbackSrc}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B12] via-[#050B12]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050B12]/80 via-transparent to-[#050B12]/40" />

      {/* Content Overlay */}
      {overlayContent && (
        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-6 pb-16 md:pb-24">
            {overlayContent}
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified version for use as section background
export function HeroBackground({
  fallbackSrc,
  alt,
  className = '',
}: {
  fallbackSrc: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <Image
        src={fallbackSrc}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050B12] via-[#050B12]/70 to-[#050B12]/40" />
    </div>
  );
}

export default HeroMedia;
