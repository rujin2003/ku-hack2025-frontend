import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Cpu, BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type UserCategory = 'highschool' | 'engineering' | 'general';

interface UserCategoryScreenProps {
  onNext: (category: UserCategory) => void;
  onBack: () => void;
}

const categories = [
  {
    id: 'highschool' as UserCategory,
    icon: GraduationCap,
    title: 'High School Student',
    description: 'Preparing for exams like JEE, NEET, or board exams',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'engineering' as UserCategory,
    icon: Cpu,
    title: 'Engineering Student',
    description: 'Studying electronics, circuits, or related fields',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'general' as UserCategory,
    icon: BookOpen,
    title: 'General Learner',
    description: 'Learning for curiosity or self-improvement',
    color: 'from-purple-500 to-pink-500',
  },
];

const UserCategoryScreen: React.FC<UserCategoryScreenProps> = ({ onNext, onBack }) => {
  const [selected, setSelected] = useState<UserCategory | null>(null);

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
            Who are you?
          </h2>
          <p className="text-muted-foreground mb-10">
            Help us personalize your experience
          </p>
        </motion.div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isSelected = selected === category.id;
            
            return (
              <motion.button
                key={category.id}
                className={`relative p-6 rounded-2xl text-left transition-all duration-300 ${
                  isSelected
                    ? 'glass border-2 border-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]'
                    : 'glass border border-border/30 hover:border-primary/50'
                }`}
                onClick={() => setSelected(category.id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
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
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
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
            <div className="w-8 h-2 rounded-full bg-primary" />
            <div className="w-2 h-2 rounded-full bg-muted" />
          </div>

          <Button
            onClick={() => selected && onNext(selected)}
            disabled={!selected}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserCategoryScreen;
