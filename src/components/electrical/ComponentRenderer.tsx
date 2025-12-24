import React from 'react';
import { motion } from 'framer-motion';
import { CircuitComponent } from '@/stores/circuitStore';

interface ComponentRendererProps {
  component: CircuitComponent;
  isSelected: boolean;
  isCircuitComplete: boolean;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  isCircuitComplete,
}) => {
  const renderComponent = () => {
    switch (component.type) {
      case 'battery':
        return (
          <g>
            {/* Battery symbol */}
            <rect x="10" y="20" width="8" height="20" fill="hsl(var(--electric-amber))" rx="1" />
            <rect x="22" y="15" width="4" height="30" fill="hsl(var(--electric-amber))" rx="1" />
            <rect x="30" y="20" width="8" height="20" fill="hsl(var(--electric-amber))" rx="1" />
            <rect x="42" y="15" width="4" height="30" fill="hsl(var(--electric-amber))" rx="1" />
            {/* + symbol */}
            <text x="52" y="18" fontSize="10" fill="hsl(var(--electric-amber))" fontFamily="monospace">+</text>
            {/* - symbol */}
            <text x="2" y="34" fontSize="10" fill="hsl(var(--electric-amber))" fontFamily="monospace">-</text>
          </g>
        );
      
      case 'resistor':
        return (
          <g>
            {/* Zigzag resistor symbol */}
            <path
              d="M5,30 L10,30 L15,20 L20,40 L25,20 L30,40 L35,20 L40,40 L45,20 L50,30 L55,30"
              fill="none"
              stroke="hsl(var(--electric-blue))"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      
      case 'bulb':
        return (
          <g>
            <circle
              cx="30"
              cy="30"
              r="18"
              fill={component.properties.isOn ? 'hsl(var(--electric-amber) / 0.3)' : 'transparent'}
              stroke="hsl(var(--electric-amber))"
              strokeWidth="2"
            />
            {/* Filament */}
            <path
              d="M22,30 Q30,20 38,30 Q30,40 22,30"
              fill="none"
              stroke={component.properties.isOn ? 'hsl(var(--electric-amber))' : 'hsl(var(--muted-foreground))'}
              strokeWidth="1.5"
            />
            {/* Glow effect when on */}
            {component.properties.isOn && (
              <motion.circle
                cx="30"
                cy="30"
                r="22"
                fill="none"
                stroke="hsl(var(--electric-amber))"
                strokeWidth="1"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </g>
        );
      
      case 'led':
        const ledColor = component.properties.color || '#00ff00';
        return (
          <g>
            {/* LED triangle */}
            <polygon
              points="15,15 45,30 15,45"
              fill={component.properties.isOn ? ledColor + '40' : 'transparent'}
              stroke={ledColor}
              strokeWidth="2"
            />
            {/* Cathode bar */}
            <line x1="45" y1="15" x2="45" y2="45" stroke={ledColor} strokeWidth="2" />
            {/* Arrow rays */}
            <line x1="35" y1="12" x2="42" y2="5" stroke={ledColor} strokeWidth="1.5" />
            <line x1="40" y1="15" x2="47" y2="8" stroke={ledColor} strokeWidth="1.5" />
            {/* Glow effect */}
            {component.properties.isOn && (
              <motion.circle
                cx="30"
                cy="30"
                r="25"
                fill={ledColor}
                opacity={0.2}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </g>
        );
      
      case 'switch':
        return (
          <g>
            {/* Fixed contacts */}
            <circle cx="12" cy="30" r="4" fill="hsl(var(--electric-purple))" />
            <circle cx="48" cy="30" r="4" fill="hsl(var(--electric-purple))" />
            {/* Switch arm */}
            <motion.line
              x1="12"
              y1="30"
              x2={component.properties.isOn ? "48" : "42"}
              y2={component.properties.isOn ? "30" : "18"}
              stroke="hsl(var(--electric-purple))"
              strokeWidth="3"
              strokeLinecap="round"
              initial={false}
              animate={{
                x2: component.properties.isOn ? 48 : 42,
                y2: component.properties.isOn ? 30 : 18,
              }}
              transition={{ duration: 0.2 }}
            />
          </g>
        );
      
      case 'ammeter':
        return (
          <g>
            <circle cx="30" cy="30" r="20" fill="transparent" stroke="hsl(var(--electric-cyan))" strokeWidth="2" />
            <text x="30" y="35" textAnchor="middle" fontSize="14" fill="hsl(var(--electric-cyan))" fontWeight="bold">A</text>
          </g>
        );
      
      case 'voltmeter':
        return (
          <g>
            <circle cx="30" cy="30" r="20" fill="transparent" stroke="hsl(var(--electric-red))" strokeWidth="2" />
            <text x="30" y="35" textAnchor="middle" fontSize="14" fill="hsl(var(--electric-red))" fontWeight="bold">V</text>
          </g>
        );
      
      case 'ground':
        return (
          <g>
            <line x1="30" y1="10" x2="30" y2="25" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="15" y1="25" x2="45" y2="25" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="20" y1="32" x2="40" y2="32" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
            <line x1="25" y1="39" x2="35" y2="39" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
          </g>
        );
      
      case 'wire':
        return (
          <g>
            <circle cx="30" cy="30" r="6" fill="hsl(var(--primary))" />
            {isCircuitComplete && (
              <motion.circle
                cx="30"
                cy="30"
                r="10"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                initial={{ opacity: 0.5, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </g>
        );
      
      default:
        return <circle cx="30" cy="30" r="20" fill="hsl(var(--muted))" />;
    }
  };

  return (
    <g transform={`rotate(${component.rotation}, 30, 30)`}>
      {renderComponent()}
      
      {/* Selection indicator */}
      {isSelected && (
        <motion.rect
          x="-5"
          y="-5"
          width="70"
          height="70"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="5,5"
          rx="8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </g>
  );
};

export default ComponentRenderer;