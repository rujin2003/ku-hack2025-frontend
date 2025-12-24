import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Calculator, Atom } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 circuit-grid opacity-20" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/40"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 text-center px-6 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo/Icons */}
        <motion.div
          className="flex justify-center gap-6 mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            className="p-4 glass rounded-xl neon-glow"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Calculator className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.div
            className="p-4 glass rounded-xl neon-glow"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Atom className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.div
            className="p-4 glass rounded-xl neon-glow"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Zap className="w-10 h-10 text-primary" />
          </motion.div>
        </motion.div>

        {/* Title with typing effect */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Physics & Math Solver
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          Your intelligent companion for solving complex problems in mathematics, 
          physics, and electrical engineering.
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid grid-cols-3 gap-4 mb-12 text-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <div className="glass p-4 rounded-lg">
            <div className="text-primary font-semibold mb-1">AI-Powered</div>
            <div className="text-muted-foreground text-xs">Intelligent solutions</div>
          </div>
          <div className="glass p-4 rounded-lg">
            <div className="text-primary font-semibold mb-1">Interactive</div>
            <div className="text-muted-foreground text-xs">Circuit simulation</div>
          </div>
          <div className="glass p-4 rounded-lg">
            <div className="text-primary font-semibold mb-1">Educational</div>
            <div className="text-muted-foreground text-xs">Step-by-step guidance</div>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
        >
          <Button
            onClick={onNext}
            size="lg"
            className="px-12 py-6 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.7)] transition-all duration-300"
          >
            Get Started
            <motion.span
              className="ml-2"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
          </Button>
        </motion.div>

        {/* Step indicator */}
        <motion.div
          className="mt-8 flex justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <div className="w-8 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="w-2 h-2 rounded-full bg-muted" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
