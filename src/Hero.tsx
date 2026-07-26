import { useRef, useEffect, useCallback } from 'react';
import { Globe, ArrowRight, MessageCircle, Heart } from 'lucide-react';

const FADE_DURATION = 500; // ms
const FADE_OUT_LEAD = 0.55; // seconds before end to start fading out
const LOOP_RESET_DELAY = 100; // ms

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fadingOutRef = useRef(false);
  const fadeAnimRef = useRef<number | null>(null);
  const prevTimeRef = useRef(0);

  const cancelFade = useCallback(() => {
    if (fadeAnimRef.current !== null) {
      cancelAnimationFrame(fadeAnimRef.current);
      fadeAnimRef.current = null;
    }
  }, []);

  // fadeIn: video becomes visible — overlay goes from black (1) toward transparent (0)
  const fadeIn = useCallback(() => {
    cancelFade();
    fadingOutRef.current = false;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const startTime = performance.now();
    const startOpacity = parseFloat(overlay.style.opacity) || 1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / FADE_DURATION, 1);
      overlay.style.opacity = String(startOpacity * (1 - progress));
      if (progress < 1) {
        fadeAnimRef.current = requestAnimationFrame(animate);
      } else {
        overlay.style.opacity = '0';
        fadeAnimRef.current = null;
      }
    };

    fadeAnimRef.current = requestAnimationFrame(animate);
  }, [cancelFade]);

  // fadeOut: video disappears — overlay goes from transparent (0) toward black (1)
  const fadeOut = useCallback(() => {
    if (fadingOutRef.current) return;
    fadingOutRef.current = true;
    cancelFade();
    const overlay = overlayRef.current;
    if (!overlay) return;
    const startTime = performance.now();
    const startOpacity = parseFloat(overlay.style.opacity) || 0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / FADE_DURATION, 1);
      overlay.style.opacity = String(startOpacity + (1 - startOpacity) * progress);
      if (progress < 1) {
        fadeAnimRef.current = requestAnimationFrame(animate);
      } else {
        overlay.style.opacity = '1';
        fadeAnimRef.current = null;
      }
    };

    fadeAnimRef.current = requestAnimationFrame(animate);
  }, [cancelFade]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    // Detect native loop: currentTime jumped backward significantly
    if (prevTimeRef.current > video.currentTime + FADE_OUT_LEAD + 0.1) {
      if (fadingOutRef.current) {
        fadingOutRef.current = false;
      }
      fadeIn();
    }

    const timeLeft = video.duration - video.currentTime;
    if (timeLeft <= FADE_OUT_LEAD && !fadingOutRef.current) {
      fadeOut();
    }

    prevTimeRef.current = video.currentTime;
  }, [fadeIn, fadeOut]);

  const handleEnded = useCallback(() => {
    // Fallback for browsers where native loop doesn't work
    const overlay = overlayRef.current;
    const video = videoRef.current;
    if (overlay) overlay.style.opacity = '1';
    fadingOutRef.current = false;
    setTimeout(() => {
      if (video) {
        video.currentTime = 0;
        video.play();
        fadeIn();
      }
    }, LOOP_RESET_DELAY);
  }, [fadeIn]);

  const handlePlay = useCallback(() => {
    // Only fade in on initial play, not on mid-loop resume
    if (!fadingOutRef.current) {
      fadeIn();
    }
  }, [fadeIn]);

  useEffect(() => {
    return () => {
      if (fadeAnimRef.current !== null) {
        cancelAnimationFrame(fadeAnimRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
      {/* Video background — fills entire viewport, centered composition */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover object-center"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
          muted
          autoPlay
          playsInline
          loop
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={handlePlay}
        />
        {/* Fade overlay — starts black, fades to transparent on play */}
        <div
          ref={overlayRef}
          className="absolute inset-0 bg-black pointer-events-none"
          style={{ opacity: 1 }}
        />
      </div>

      {/* Navigation — top edge */}
      <nav className="relative z-20 pl-6 pr-6 py-6">
        <div className="rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto liquid-glass">
          <div className="flex items-center gap-2">
            <Globe size={24} className="text-white" />
            <span className="text-white font-semibold text-lg">Asme</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Features
            </a>
            <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              Pricing
            </a>
            <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
              About
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white text-sm font-medium">Sign Up</button>
            <button className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium">
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer — pushes hero content toward the lower portion of the screen */}
      <div className="flex-1 min-h-[8vh]" />

      {/* Hero content — sits in the lower portion, away from the video's halo center */}
      <div className="relative z-10 flex flex-col items-center px-6 pb-4 text-center">
        <h1
          className="text-5xl md:text-6xl lg:text-7xl text-white mb-6 tracking-tight whitespace-nowrap"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the curious
        </h1>

        <div className="max-w-xl w-full space-y-4">
          {/* Email input bar */}
          <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-base outline-none border-none"
            />
            <button
              type="submit"
              className="bg-white rounded-full p-3 text-black flex-shrink-0 hover:opacity-90 transition-opacity"
              aria-label="Submit email"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Subtitle */}
          <p className="text-white text-sm leading-relaxed px-4">
            Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates.
          </p>

          {/* Manifesto button */}
          <div className="flex justify-center pt-2">
            <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors">
              Manifesto
            </button>
          </div>
        </div>
      </div>

      {/* Social footer — bottom edge */}
      <div className="relative z-10 flex justify-center gap-4 pb-8">
        <button
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Instagram"
        >
          <MessageCircle size={20} />
        </button>
        <button
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Twitter"
        >
          <Heart size={20} />
        </button>
        <button
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
          aria-label="Globe"
        >
          <Globe size={20} />
        </button>
      </div>
    </div>
  );
}