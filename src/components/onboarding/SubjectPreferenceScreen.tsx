import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Atom, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type SubjectPreference = 'math' | 'physics' | 'electrical';

interface SubjectPreferenceScreenProps {
  onComplete: (preference: SubjectPreference) => void;
  onBack: () => void;
}

const subjects = [
  {
    id: 'math' as SubjectPreference,
    icon: Calculator,
    title: 'Mathematics',
    description: 'Algebra, calculus, trigonometry, and problem solving',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    features: ['Equations', 'Calculus', 'Geometry'],
  },
  {
    id: 'physics' as SubjectPreference,
    icon: Atom,
    title: 'Physics',
    description: 'Mechanics, thermodynamics, waves, and modern physics',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    features: ['Mechanics', 'Optics', 'Quantum'],
  },
];

const SubjectPreferenceScreen: React.FC<SubjectPreferenceScreenProps> = ({ onComplete, onBack }) => {
  const [selected, setSelected] = useState<SubjectPreference | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 circuit-grid opacity-10" />

      <motion.div
        className="relative z-10 text-center px-6 max-w-4xl w-full"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            What would you like to explore?
          </h2>
          <p className="text-muted-foreground mb-10">
            Choose your preferred subject area
          </p>
        </motion.div>

        {/* Subject Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
          {subjects.map((subject, index) => {
            const Icon = subject.icon;
            const isSelected = selected === subject.id;
            
            return (
              <motion.button
                key={subject.id}
                className={`relative p-6 rounded-2xl text-left transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'border-2 border-primary shadow-[0_0_40px_hsl(var(--primary)/0.4)]'
                    : 'glass border border-border/30 hover:border-primary/50'
                }`}
                onClick={() => setSelected(subject.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Gradient background when selected */}
                {isSelected && (
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-10`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                  />
                )}

                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}

                {/* Icon */}
                <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      animate={{ 
                        boxShadow: [
                          '0 0 20px rgba(255,255,255,0.2)',
                          '0 0 40px rgba(255,255,255,0.4)',
                          '0 0 20px rgba(255,255,255,0.2)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2 relative z-10">
                  {subject.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 relative z-10">
                  {subject.description}
                </p>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2 relative z-10">
                  {subject.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Navigation */}
        <motion.div
          className="flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-muted" />
            <div className="w-2 h-2 rounded-full bg-muted" />
            <div className="w-8 h-2 rounded-full bg-primary" />
          </div>

          <Button
            onClick={() => selected && onComplete(selected)}
            disabled={!selected}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Learning
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SubjectPreferenceScreen;
