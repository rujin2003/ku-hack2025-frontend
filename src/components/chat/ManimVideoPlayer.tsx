import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Maximize2, X, Volume2, VolumeX } from 'lucide-react';

interface ManimVideoPlayerProps {
  videoUrl: string;
  onClose?: () => void;
}

const ManimVideoPlayer: React.FC<ManimVideoPlayerProps> = ({ videoUrl, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Cleanup blob URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Generate thumbnail from first frame
  useEffect(() => {
    if (!videoUrl) return;
    
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    
    video.addEventListener('loadeddata', () => {
      video.currentTime = 0.1;
    });

    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        setThumbnail(canvas.toDataURL('image/jpeg'));
      }
    });

    return () => {
      video.remove();
    };
  }, [videoUrl]);

  // Handle video metadata loaded - prevents flickering
  const handleLoadedMetadata = () => {
    setIsVideoReady(true);
  };

  const togglePlay = (useModal = false) => {
    const video = useModal ? modalVideoRef.current : videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play().catch(err => console.log('Play failed:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (useModal = false) => {
    const video = useModal ? modalVideoRef.current : videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = (useModal = false) => {
    const video = useModal ? modalVideoRef.current : videoRef.current;
    if (video) {
      const prog = (video.currentTime / video.duration) * 100;
      setProgress(isNaN(prog) ? 0 : prog);
    }
  };

  const handleVideoEnd = (useModal = false) => {
    const video = useModal ? modalVideoRef.current : videoRef.current;
    setIsPlaying(false);
    setProgress(0);
    if (video) {
      video.currentTime = 0;
    }
  };

  const openFullscreen = () => {
    setIsFullscreen(true);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setIsPlaying(false);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  };

  // Auto-hide controls
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setTimeout(() => setShowControls(false), 2000);
    } else {
      setShowControls(true);
    }
    return () => clearTimeout(timer);
  }, [isPlaying]);

  // Sync modal video with main video position when opening fullscreen
  useEffect(() => {
    if (isFullscreen && modalVideoRef.current && videoRef.current) {
      modalVideoRef.current.currentTime = videoRef.current.currentTime;
    }
  }, [isFullscreen]);

  const renderVideoControls = (isModal = false) => (
    <AnimatePresence>
      {showControls && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none"
        >
          {/* Center play button */}
          {!isPlaying && (
            <motion.button
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => togglePlay(isModal)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center pointer-events-auto neon-glow-subtle"
            >
              <Play className="h-7 w-7 text-primary-foreground ml-1" />
            </motion.button>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-auto">
            {/* Progress bar */}
            <div className="w-full h-1 bg-muted/30 rounded-full mb-3 overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePlay(isModal)}
                  className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleMute(isModal)}
                  className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </motion.button>
              </div>

              {!isModal && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openFullscreen}
                  className="w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center"
                >
                  <Maximize2 className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Inline video player */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-start w-full"
      >
        <div className="w-full md:w-[70%] lg:w-[70%] sm:w-[85%]">
          {/* Header */}
          <div className="glass rounded-t-2xl px-4 py-2 border border-border/30">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-sm font-medium text-foreground/80">Generated Animation</span>
            </div>
          </div>

          {/* Video */}
          <div className="glass-strong border-x border-b border-border/30 rounded-b-2xl overflow-hidden">
            <motion.div
              className="relative rounded-2xl overflow-hidden w-full"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => isPlaying && setShowControls(false)}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                boxShadow: '0 0 30px hsl(var(--primary) / 0.3)'
              }}
              transition={{ 
                duration: 0.25,
                boxShadow: { duration: 0.3, delay: 0.1 }
              }}
            >
              {/* Neon border glow effect */}
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                initial={{ boxShadow: '0 0 20px hsl(var(--primary) / 0.5)' }}
                animate={{ boxShadow: '0 0 0px transparent' }}
                transition={{ duration: 1, delay: 0.3 }}
              />

              {/* Video element */}
              <video
                ref={videoRef}
                src={videoUrl}
                poster={thumbnail || undefined}
                muted={isMuted}
                playsInline
                preload="auto"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={() => handleTimeUpdate(false)}
                onEnded={() => handleVideoEnd(false)}
                onClick={() => togglePlay(false)}
                className="w-full aspect-video bg-background/90 cursor-pointer"
                style={{ 
                  opacity: isVideoReady ? 1 : 0,
                  transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
                  transform: isVideoReady ? 'scale(1)' : 'scale(0.97)'
                }}
              />
              
              {/* Loading placeholder while video loads */}
              {!isVideoReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90">
                  <motion.div
                    className="flex items-center gap-2 text-muted-foreground"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm">Loading video...</span>
                  </motion.div>
                </div>
              )}

              {renderVideoControls(false)}
            </motion.div>
            
            {/* Caption */}
            <div className="px-4 py-2 border-t border-border/20">
              <p className="text-xs text-muted-foreground">
                Auto-created using your prompt.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={closeFullscreen}
          >
            {/* Blurred backdrop */}
            <motion.div
              initial={{ backdropFilter: 'blur(0px)' }}
              animate={{ backdropFilter: 'blur(20px)' }}
              exit={{ backdropFilter: 'blur(0px)' }}
              className="absolute inset-0 bg-background/80"
            />

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center"
            >
              <X className="h-5 w-5" />
            </motion.button>

            {/* Modal video */}
            <div className="relative z-10 w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <motion.div
                className="relative rounded-2xl overflow-hidden w-full max-w-4xl"
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  boxShadow: '0 0 30px hsl(var(--primary) / 0.3)'
                }}
                transition={{ 
                  duration: 0.25,
                  boxShadow: { duration: 0.3, delay: 0.1 }
                }}
              >
                <video
                  ref={modalVideoRef}
                  src={videoUrl}
                  poster={thumbnail || undefined}
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onTimeUpdate={() => handleTimeUpdate(true)}
                  onEnded={() => handleVideoEnd(true)}
                  onClick={() => togglePlay(true)}
                  className="w-full aspect-video bg-background/90 cursor-pointer"
                />

                {renderVideoControls(true)}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ManimVideoPlayer;
