import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, DragMoveEvent } from '@dnd-kit/core';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ComponentToolbox from './ComponentToolbox';
import CircuitCanvas from './CircuitCanvas';
import PropertiesPanel from './PropertiesPanel';
import CircuitStats from './CircuitStats';
import { useCircuitStore, ComponentType } from '@/stores/circuitStore';

interface ElectricalSimulatorProps {
  onBack: () => void;
}

const ElectricalSimulator: React.FC<ElectricalSimulatorProps> = ({ onBack }) => {
  const { selectedComponent, addComponent, zoom, panOffset } = useCircuitStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'circuit-canvas') {
      const componentType = (active.data.current as { type: ComponentType })?.type;
      if (componentType) {
        // Get the canvas element to calculate proper position
        const canvasElement = document.getElementById('circuit-canvas-container');
        if (canvasElement && event.delta) {
          const rect = canvasElement.getBoundingClientRect();
          
          // Calculate position relative to canvas, accounting for zoom and pan
          const toolboxWidth = 96; // w-24 = 6rem = 96px
          const x = (event.activatorEvent as MouseEvent).clientX - rect.left + event.delta.x - toolboxWidth;
          const y = (event.activatorEvent as MouseEvent).clientY - rect.top + event.delta.y - 64; // Subtract header
          
          // Transform to canvas coordinates
          const canvasX = (x - panOffset.x) / zoom;
          const canvasY = (y - panOffset.y) / zoom;
          
          addComponent(componentType, { x: canvasX - 30, y: canvasY - 30 });
        } else {
          // Fallback position
          addComponent(componentType, { x: 200, y: 150 });
        }
      }
    }
  }, [addComponent, zoom, panOffset]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex h-screen w-full bg-background"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-4 left-4 z-50"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="glass gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
        >
          <h1 className="text-xl font-bold neon-text">Electrical Circuit Simulator</h1>
        </motion.div>

        {/* Main Layout */}
        <div className="flex w-full h-full pt-16">
          {/* Left Toolbox */}
          <ComponentToolbox />

          {/* Center Canvas */}
          <div className="flex-1 p-4 relative" id="circuit-canvas-container">
            <CircuitCanvas />
            <CircuitStats />
          </div>

          {/* Right Properties Panel */}
          <PropertiesPanel componentId={selectedComponent} />
        </div>
      </motion.div>
    </DndContext>
  );
};

export default ElectricalSimulator;