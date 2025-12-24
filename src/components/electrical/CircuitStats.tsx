import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Gauge, Thermometer, AlertTriangle } from 'lucide-react';
import { useCircuitStore } from '@/stores/circuitStore';

const CircuitStats: React.FC = () => {
  const { circuitState } = useCircuitStore();

  const stats = [
    {
      label: 'Voltage',
      value: circuitState.totalVoltage.toFixed(2),
      unit: 'V',
      icon: Zap,
      color: 'text-electric-amber',
    },
    {
      label: 'Current',
      value: circuitState.totalCurrent > 0 ? (circuitState.totalCurrent * 1000).toFixed(2) : '0.00',
      unit: 'mA',
      icon: Activity,
      color: 'text-electric-cyan',
    },
    {
      label: 'Resistance',
      value: circuitState.totalResistance.toFixed(0),
      unit: 'Ω',
      icon: Gauge,
      color: 'text-electric-blue',
    },
    {
      label: 'Power',
      value: circuitState.totalPower > 0 ? (circuitState.totalPower * 1000).toFixed(2) : '0.00',
      unit: 'mW',
      icon: Thermometer,
      color: 'text-electric-red',
    },
  ];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-strong rounded-2xl p-4"
    >
      <div className="flex items-center gap-6">
        {/* Circuit Status */}
        <div className="flex items-center gap-2 pr-6 border-r border-border/50">
          <div
            className={`w-2 h-2 rounded-full ${
              circuitState.hasShortCircuit
                ? 'bg-electric-red animate-pulse'
                : circuitState.isComplete
                ? 'bg-electric-green animate-pulse-glow'
                : 'bg-muted-foreground'
            }`}
          />
          <span className="text-xs font-medium">
            {circuitState.hasShortCircuit
              ? 'Short Circuit!'
              : circuitState.isComplete
              ? 'Circuit Complete'
              : 'Open Circuit'}
          </span>
        </div>

        {/* Stats */}
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            className="flex items-center gap-2"
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground">{stat.label}</span>
              <div className="flex items-baseline gap-1">
                <motion.span
                  key={stat.value}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-mono font-semibold"
                >
                  {stat.value}
                </motion.span>
                <span className="text-[10px] text-muted-foreground">{stat.unit}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Warning */}
        {circuitState.hasShortCircuit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 pl-6 border-l border-border/50"
          >
            <AlertTriangle className="w-4 h-4 text-electric-red animate-pulse" />
            <span className="text-xs text-electric-red font-medium">Warning!</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CircuitStats;
