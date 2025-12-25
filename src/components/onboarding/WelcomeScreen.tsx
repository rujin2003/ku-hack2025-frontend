import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FynmanLogo from '@/components/FynmanLogo';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Smart, adaptive solutions tailored for you.',
    },
    {
      icon: Lightbulb,
      title: 'Interactive',
      description: 'Visual simulations that make ideas intuitive.',
    },
    {
      icon: GraduationCap,
      title: 'Educational',
      description: 'Clear explanations built for real understanding.',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Cleaner background grid */}
      <div className="absolute inset-0 circuit-grid opacity-8" />

      {/* Reduced density ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              background: `hsla(var(--primary), ${0.15 + Math.random() * 0.2})`,
            }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 20 + Math.random() * 25,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <motion.div
        className="relative z-10 text-center px-8 max-w-2xl mx-auto py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Subtle ambient glow - reduced intensity */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        >
          <FynmanLogo size={48} />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="text-4xl md:text-5xl font-light mb-5 leading-tight tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
        >
          <span className="text-primary">Meet </span>
          <span className="text-foreground font-normal">Fynman</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-sm md:text-base text-muted-foreground mb-16 max-w-md mx-auto leading-relaxed font-light"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Your intelligent companion for learning mathematics, physics, and engineering — powered by clarity, visuals, and AI reasoning.
        </motion.p>

        {/* Feature Cards - Minimal */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative p-5 rounded-xl bg-card/20 backdrop-blur-sm border border-border/30 transition-all duration-300"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
              whileHover={{
                y: -4,
                borderColor: 'hsl(var(--primary) / 0.3)',
                boxShadow: '0 8px 24px -12px hsl(var(--primary) / 0.15)',
              }}
            >
              <div className="relative z-10">
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/12 transition-colors duration-300">
                  <feature.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-primary font-medium text-sm mb-1.5">{feature.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed font-light">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button - Elegant & Minimal */}
        <motion.div
          className="relative inline-block"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Button
            onClick={onNext}
            size="lg"
            className="relative px-10 py-6 text-sm font-medium rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.03]"
          >
            <span className="flex items-center gap-2">
              Get Started
              <motion.span
                animate={{ x: isHovered ? 3 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs"
              >
                →
              </motion.span>
            </span>
          </Button>
        </motion.div>

        {/* Micro-tagline */}
        <motion.p
          className="mt-5 text-xs text-muted-foreground/50 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          No sign-up. Instant learning.
        </motion.p>

        {/* Step indicator - Subtler */}
        <motion.div
          className="mt-12 flex justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <div className="w-6 h-1.5 rounded-full bg-primary/80" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
