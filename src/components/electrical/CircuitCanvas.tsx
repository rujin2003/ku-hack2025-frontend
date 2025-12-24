import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { ZoomIn, ZoomOut, RotateCcw, Trash2 } from 'lucide-react';
import { useCircuitStore, Position } from '@/stores/circuitStore';
import { Button } from '@/components/ui/button';
import ComponentRenderer from './ComponentRenderer';

const CircuitCanvas: React.FC = () => {
  const canvasRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<{ componentId: string; terminal: 'left' | 'right' } | null>(null);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });
  
  const {
    components,
    wires,
    selectedComponent,
    circuitState,
    zoom,
    panOffset,
    selectComponent,
    updateComponent,
    setZoom,
    setPanOffset,
    clearCircuit,
    addWire,
  } = useCircuitStore();

  const { setNodeRef, isOver } = useDroppable({
    id: 'circuit-canvas',
  });

  const gridSize = 20;

  // Get mouse position relative to canvas with zoom/pan transforms
  const getCanvasCoordinates = useCallback((clientX: number, clientY: number): Position => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - panOffset.x) / zoom;
    const y = (clientY - rect.top - panOffset.y) / zoom;
    
    return { x, y };
  }, [zoom, panOffset]);

  const snapToGrid = useCallback((value: number): number => {
    return Math.round(value / gridSize) * gridSize;
  }, [gridSize]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(zoom + delta);
    }
  }, [zoom, setZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  }, [panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    setMousePos(coords);

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingComponent) {
      const newPos = {
        x: snapToGrid(coords.x - dragOffset.x),
        y: snapToGrid(coords.y - dragOffset.y),
      };
      updateComponent(draggingComponent, { position: newPos });
    }
  }, [isPanning, panStart, setPanOffset, draggingComponent, dragOffset, getCanvasCoordinates, snapToGrid, updateComponent]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingComponent(null);
  }, []);

  const handleComponentMouseDown = useCallback((e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    setDraggingComponent(componentId);
    setDragOffset({
      x: coords.x - component.position.x,
      y: coords.y - component.position.y,
    });
    selectComponent(componentId);
  }, [components, getCanvasCoordinates, selectComponent]);

  const handleComponentClick = useCallback((e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    selectComponent(componentId);
  }, [selectComponent]);

  const handleCanvasClick = useCallback(() => {
    selectComponent(null);
    setConnectingFrom(null);
  }, [selectComponent]);

  const handleTerminalClick = useCallback((e: React.MouseEvent, componentId: string, terminal: 'left' | 'right') => {
    e.stopPropagation();
    
    if (!connectingFrom) {
      setConnectingFrom({ componentId, terminal });
    } else {
      // Don't connect to the same component or same terminal
      if (connectingFrom.componentId !== componentId) {
        addWire({
          from: { componentId: connectingFrom.componentId, terminalId: connectingFrom.terminal },
          to: { componentId, terminalId: terminal },
          points: [],
        });
      }
      setConnectingFrom(null);
    }
  }, [connectingFrom, addWire]);

  const getTerminalPosition = useCallback((componentId: string, terminal: 'left' | 'right'): Position | null => {
    const component = components.find(c => c.id === componentId);
    if (!component) return null;
    
    const rotation = component.rotation;
    const centerX = component.position.x + 30;
    const centerY = component.position.y + 30;
    
    // Base positions (before rotation)
    let x = terminal === 'left' ? component.position.x : component.position.x + 60;
    let y = component.position.y + 30;
    
    // Apply rotation around center
    if (rotation === 90) {
      x = centerX;
      y = terminal === 'left' ? component.position.y : component.position.y + 60;
    } else if (rotation === 180) {
      x = terminal === 'left' ? component.position.x + 60 : component.position.x;
      y = component.position.y + 30;
    } else if (rotation === 270) {
      x = centerX;
      y = terminal === 'left' ? component.position.y + 60 : component.position.y;
    }
    
    return { x, y };
  }, [components]);

  return (
    <div 
      ref={(node) => {
        setNodeRef(node);
        (containerRef as any).current = node;
      }}
      className="relative flex-1 h-full overflow-hidden bg-background rounded-xl"
    >
      {/* Canvas controls */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 z-20 flex gap-2"
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => setZoom(zoom + 0.1)}
          className="glass h-8 w-8"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setZoom(zoom - 0.1)}
          className="glass h-8 w-8"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setZoom(1);
            setPanOffset({ x: 0, y: 0 });
          }}
          className="glass h-8 w-8"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={clearCircuit}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Zoom indicator */}
      <div className="absolute top-4 left-4 z-20 glass rounded-lg px-3 py-1">
        <span className="text-xs font-mono text-muted-foreground">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Connection hint */}
      {connectingFrom && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-14 left-4 z-20 glass rounded-lg px-3 py-2"
        >
          <span className="text-xs text-primary">Click another terminal to connect</span>
        </motion.div>
      )}

      {/* SVG Canvas */}
      <svg
        ref={canvasRef}
        className={`w-full h-full circuit-grid-dots ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* Current flow gradient */}
          <linearGradient id="currentFlow" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          </linearGradient>

          {/* Terminal glow */}
          <filter id="terminalGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Transformed content */}
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
          {/* Wires */}
          {wires.map((wire) => {
            const fromPos = getTerminalPosition(wire.from.componentId, wire.from.terminalId as 'left' | 'right');
            const toPos = getTerminalPosition(wire.to.componentId, wire.to.terminalId as 'left' | 'right');
            
            if (!fromPos || !toPos) return null;
            
            const midX = (fromPos.x + toPos.x) / 2;
            
            return (
              <g key={wire.id}>
                {/* Base wire */}
                <path
                  d={`M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y}, ${midX} ${toPos.y}, ${toPos.x} ${toPos.y}`}
                  fill="none"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Current flow animation */}
                {circuitState.isComplete && !circuitState.hasShortCircuit && (
                  <motion.path
                    d={`M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y}, ${midX} ${toPos.y}, ${toPos.x} ${toPos.y}`}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="4"
                    strokeDasharray="8 12"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -20 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                    filter="url(#glow)"
                  />
                )}
              </g>
            );
          })}

          {/* Wire being drawn */}
          {connectingFrom && (() => {
            const fromPos = getTerminalPosition(connectingFrom.componentId, connectingFrom.terminal);
            if (!fromPos) return null;
            
            const midX = (fromPos.x + mousePos.x) / 2;
            
            return (
              <path
                d={`M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y}, ${midX} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="5 5"
                opacity={0.7}
              />
            );
          })()}

          {/* Components */}
          {components.map((component) => (
            <g
              key={component.id}
              style={{ cursor: draggingComponent === component.id ? 'grabbing' : 'grab' }}
              onMouseDown={(e) => handleComponentMouseDown(e, component.id)}
              onClick={(e) => handleComponentClick(e, component.id)}
            >
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <g transform={`translate(${component.position.x}, ${component.position.y})`}>
                  {/* Hit area for dragging */}
                  <rect
                    x="-5"
                    y="-5"
                    width="70"
                    height="70"
                    fill="transparent"
                  />
                  
                  <ComponentRenderer
                    component={component}
                    isSelected={selectedComponent === component.id}
                    isCircuitComplete={circuitState.isComplete && !circuitState.hasShortCircuit}
                  />
                  
                  {/* Enhanced terminals */}
                  <g transform={`rotate(${component.rotation}, 30, 30)`}>
                    {/* Left terminal */}
                    <motion.circle
                      cx="0"
                      cy="30"
                      r={connectingFrom?.componentId === component.id && connectingFrom?.terminal === 'left' ? 7 : 6}
                      fill={connectingFrom?.componentId === component.id && connectingFrom?.terminal === 'left' 
                        ? 'hsl(var(--primary))' 
                        : 'hsl(var(--primary) / 0.3)'}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => handleTerminalClick(e, component.id, 'left')}
                      whileHover={{ scale: 1.3 }}
                      filter={connectingFrom ? 'url(#terminalGlow)' : undefined}
                    />
                    {/* Right terminal */}
                    <motion.circle
                      cx="60"
                      cy="30"
                      r={connectingFrom?.componentId === component.id && connectingFrom?.terminal === 'right' ? 7 : 6}
                      fill={connectingFrom?.componentId === component.id && connectingFrom?.terminal === 'right' 
                        ? 'hsl(var(--primary))' 
                        : 'hsl(var(--primary) / 0.3)'}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => handleTerminalClick(e, component.id, 'right')}
                      whileHover={{ scale: 1.3 }}
                      filter={connectingFrom ? 'url(#terminalGlow)' : undefined}
                    />
                  </g>
                  
                  {/* Label */}
                  <text
                    x="30"
                    y="75"
                    textAnchor="middle"
                    fontSize="11"
                    fill="hsl(var(--foreground))"
                    fontFamily="'JetBrains Mono', monospace"
                    fontWeight="500"
                  >
                    {component.properties.label}
                  </text>
                </g>
              </motion.g>
            </g>
          ))}
        </g>

        {/* Drop indicator */}
        {isOver && (
          <motion.rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="hsl(var(--primary) / 0.1)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        )}
      </svg>

      {/* Empty state */}
      {components.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="text-center space-y-2">
            <div className="text-lg text-muted-foreground">Drag components here to build your circuit</div>
            <div className="text-sm text-muted-foreground/60">Click terminals to connect wires • Shift + Drag to pan • Scroll to zoom</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CircuitCanvas;