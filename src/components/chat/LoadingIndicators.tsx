import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Premium AI message loader with skeleton and glowing dots
export const MessageLoader: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start"
    >
      <div className="bg-secondary rounded-2xl px-5 py-4 max-w-[80%] relative overflow-hidden">
        {/* Circular ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Glowing bouncing dots */}
        <div className="flex gap-1.5 mb-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary"
              style={{
                boxShadow: '0 0 8px hsl(var(--primary) / 0.6)',
              }}
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 8px hsl(var(--primary) / 0.6)',
                  '0 0 16px hsl(var(--primary) / 0.9)',
                  '0 0 8px hsl(var(--primary) / 0.6)',
                ],
              }}
              transition={{ 
                duration: 0.7, 
                repeat: Infinity, 
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        
        {/* Animated gradient skeleton paragraphs */}
        <div className="space-y-2">
          <motion.div
            className="h-3 rounded-full"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.2) 50%, hsl(var(--muted)) 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          <motion.div
            className="h-3 rounded-full w-4/5"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.2) 50%, hsl(var(--muted)) 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.2,
            }}
          />
          <motion.div
            className="h-3 rounded-full w-3/5"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.2) 50%, hsl(var(--muted)) 100%)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              backgroundPosition: ['200% 0', '-200% 0'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.4,
            }}
          />
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

// Visualization placeholder
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
