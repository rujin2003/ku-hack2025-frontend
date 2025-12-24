import React from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, Lightbulb, ToggleLeft, Circle, Gauge, Activity, ArrowDownToLine, CircleDot } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { ComponentType } from '@/stores/circuitStore';

interface ComponentItem {
  type: ComponentType;
  label: string;
  icon: React.ElementType;
  color: string;
}

const components: ComponentItem[] = [
  { type: 'battery', label: 'Battery', icon: Battery, color: 'text-electric-amber' },
  { type: 'resistor', label: 'Resistor', icon: Zap, color: 'text-electric-blue' },
  { type: 'bulb', label: 'Bulb', icon: Lightbulb, color: 'text-electric-amber' },
  { type: 'led', label: 'LED', icon: CircleDot, color: 'text-electric-green' },
  { type: 'switch', label: 'Switch', icon: ToggleLeft, color: 'text-electric-purple' },
  { type: 'wire', label: 'Wire', icon: Circle, color: 'text-muted-foreground' },
  { type: 'ammeter', label: 'Ammeter', icon: Activity, color: 'text-electric-cyan' },
  { type: 'voltmeter', label: 'Voltmeter', icon: Gauge, color: 'text-electric-red' },
  { type: 'ground', label: 'Ground', icon: ArrowDownToLine, color: 'text-muted-foreground' },
];

interface DraggableComponentProps {
  item: ComponentItem;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `toolbox-${item.type}`,
    data: { type: item.type },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  const Icon = item.icon;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        relative flex flex-col items-center gap-2 p-3 rounded-lg cursor-grab
        bg-secondary/50 border border-border/50
        hover:bg-secondary hover:border-primary/30
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-110 z-50' : ''}
      `}
      whileHover={{ y: -2, boxShadow: '0 8px 25px hsl(var(--primary) / 0.15)' }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`p-2 rounded-md bg-background/50 ${item.color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs text-muted-foreground font-medium">{item.label}</span>
      
      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          background: 'radial-gradient(circle at center, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
};

const ComponentToolbox: React.FC = () => {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-24 h-full glass-strong rounded-r-2xl p-3 flex flex-col gap-2 overflow-y-auto"
    >
      <div className="text-xs font-semibold text-primary mb-2 text-center">Components</div>
      
      <div className="flex flex-col gap-2">
        {components.map((item) => (
          <DraggableComponent key={item.type} item={item} />
        ))}
      </div>
    </motion.div>
  );
};

export default ComponentToolbox;
