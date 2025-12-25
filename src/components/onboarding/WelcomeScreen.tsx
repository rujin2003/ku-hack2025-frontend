import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lightbulb, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered',
      description: 'Intelligent solutions tailored to your learning style',
    },
    {
      icon: Lightbulb,
      title: 'Interactive',
      description: 'Visual simulations that bring concepts to life',
    },
    {
      icon: GraduationCap,
      title: 'Educational',
      description: 'Step-by-step reasoning for deeper understanding',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 circuit-grid opacity-15" />

      {/* Ambient floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              background: `hsla(var(--primary), ${0.2 + Math.random() * 0.3})`,
            }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)],
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 15 + Math.random() * 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main content container */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Ambient glow behind heading */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Main Heading */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        >
          <span className="bg-gradient-to-r from-primary via-[hsl(var(--electric-cyan))] to-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
            Your Intelligent
          </span>
          <br />
          <span className="text-foreground">Learning Companion</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-base md:text-lg text-muted-foreground mb-16 max-w-xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          A smarter way to understand mathematics, physics, and electrical engineering — 
          powered by interactive visuals, step-by-step reasoning, and AI guidance.
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="group relative p-6 rounded-2xl bg-card/30 backdrop-blur-md border border-primary/20 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
              whileHover={{
                y: -8,
                boxShadow: '0 20px 40px -20px hsl(var(--primary) / 0.3), 0 0 20px hsl(var(--primary) / 0.15)',
                borderColor: 'hsl(var(--primary) / 0.5)',
              }}
            >
              {/* Card glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-primary font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="relative inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Orbiting particles on hover */}
          {isHovered && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-primary"
                  initial={{ 
                    opacity: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: [0, Math.cos((i / 6) * Math.PI * 2) * 80],
                    y: [0, Math.sin((i / 6) * Math.PI * 2) * 40],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeOut',
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    translateX: '-50%',
                    translateY: '-50%',
                  }}
                />
              ))}
            </>
          )}

          {/* Glow ring */}
          <motion.div
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary/50 via-[hsl(var(--electric-cyan)/0.5)] to-primary/50 blur-md opacity-0"
            animate={{ opacity: isHovered ? 0.8 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <Button
            onClick={onNext}
            size="lg"
            className="relative px-14 py-7 text-lg font-semibold rounded-full bg-primary hover:bg-primary text-primary-foreground shadow-[0_0_40px_hsl(var(--primary)/0.4)] transition-all duration-300"
          >
            <motion.span
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              Get Started
              <motion.span
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                →
              </motion.span>
            </motion.span>
          </Button>
        </motion.div>

        {/* Micro-tagline */}
        <motion.p
          className="mt-6 text-sm text-muted-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          No sign-up needed. Dive straight into learning.
        </motion.p>

        {/* Step indicator */}
        <motion.div
          className="mt-10 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <div className="w-8 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
