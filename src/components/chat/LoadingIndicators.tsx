import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Simple chat-bubble typing indicator (WhatsApp/iMessage style)
export const MessageLoader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      className="flex justify-start"
    >
      <div className="bg-secondary rounded-2xl px-4 py-3">
        {/* Three bouncing dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{ 
                y: [0, -6, 0],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity, 
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Animation generation loader with orbiting sparkles
export const AnimationLoader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      className="flex justify-start"
    >
      <div className="glass rounded-2xl px-4 py-3 border border-primary/20">
        <div className="flex items-center gap-3">
          {/* Orbiting sparkles animation */}
          <div className="relative w-6 h-6">
            {/* Center dot */}
            <motion.div
              className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary"
              style={{ transform: 'translate(-50%, -50%)' }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            
            {/* Orbiting sparkles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  rotate: [0, 360],
                  x: [0, Math.cos((i * 2 * Math.PI) / 3) * 10, 0],
                  y: [0, Math.sin((i * 2 * Math.PI) / 3) * 10, 0],
                  opacity: [0.4, 1, 0.4],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          
          <span className="text-sm text-primary/80 font-medium">
            Rendering animation…
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Subject switching loader with pulse effect
export const SubjectSwitchLoader: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
    >
      {/* Glowing pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 0, 0.8],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </motion.div>
  );
};

// Neon ripple effect for chat container
export const ContainerRipple: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.1) 50%, transparent 100%)',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1,
          repeat: 2,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

// Container edge glow for long waits
export const EdgeGlow: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none rounded-3xl"
      style={{
        boxShadow: '0 0 0 2px transparent',
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-3xl"
        animate={{
          boxShadow: [
            'inset 0 0 20px hsl(var(--primary) / 0.1), 0 0 30px hsl(var(--primary) / 0.15)',
            'inset 0 0 40px hsl(var(--primary) / 0.2), 0 0 50px hsl(var(--primary) / 0.25)',
            'inset 0 0 20px hsl(var(--primary) / 0.1), 0 0 30px hsl(var(--primary) / 0.15)',
          ],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
};

// Send button loading spinner
export const SendButtonLoader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Loader2 className="h-5 w-5 animate-spin" />
    </motion.div>
  );
};

// Error message with retry button
export const ErrorMessage: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start"
    >
      <div className="bg-destructive/10 border border-destructive/30 rounded-2xl px-4 py-3 max-w-[80%]">
        <p className="text-sm text-destructive mb-2">
          I'm having trouble connecting — try again in a moment.
        </p>
        <motion.button
          onClick={onRetry}
          className="text-xs px-3 py-1.5 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Retry
        </motion.button>
      </div>
    </motion.div>
  );
};

// Video generation error with retry
export const VideoErrorMessage: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start"
    >
      <div className="glass border border-border/30 rounded-2xl px-4 py-3 max-w-[80%]">
        <p className="text-sm text-muted-foreground mb-2">
          Couldn't generate animation right now. Here's the explanation instead.
        </p>
        <motion.button
          onClick={onRetry}
          className="text-xs px-3 py-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Try Again
        </motion.button>
      </div>
    </motion.div>
  );
};

// Visualization placeholder (deprecated - kept for backwards compatibility)
export const VisualizationPlaceholder: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="bg-secondary rounded-2xl px-4 py-3 max-w-[80%]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <motion.div
            className="w-4 h-4 rounded-full bg-primary/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
          <span className="text-sm">Visualization coming soon...</span>
        </div>
      </div>
    </motion.div>
  );
};
