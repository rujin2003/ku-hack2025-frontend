import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Eye, EyeOff, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface GraphFunction {
  id: string;
  equation: string;
  color: string;
  visible: boolean;
  points: { x: number; y: number }[];
}

interface GraphingCalculatorProps {
  onBack: () => void;
}

const COLORS = [
  'hsl(210, 100%, 60%)',
  'hsl(340, 80%, 60%)',
  'hsl(160, 70%, 50%)',
  'hsl(45, 90%, 55%)',
  'hsl(280, 70%, 60%)',
  'hsl(20, 85%, 55%)',
];

const GraphingCalculator: React.FC<GraphingCalculatorProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [functions, setFunctions] = useState<GraphFunction[]>(() => {
    const saved = localStorage.getItem('graphingFunctions');
    return saved ? JSON.parse(saved) : [];
  });
  const [newEquation, setNewEquation] = useState('');
  const [viewState, setViewState] = useState(() => {
    const saved = localStorage.getItem('graphingViewState');
    return saved ? JSON.parse(saved) : { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
  });
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; screenX: number; screenY: number } | null>(null);
  const [animatingFunctionId, setAnimatingFunctionId] = useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; viewState: typeof viewState } | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('graphingFunctions', JSON.stringify(functions));
  }, [functions]);

  useEffect(() => {
    localStorage.setItem('graphingViewState', JSON.stringify(viewState));
  }, [viewState]);

  // Parse and evaluate equation
  const evaluateEquation = useCallback((equation: string, x: number): number | null => {
    try {
      // Replace common math functions
      let expr = equation
        .replace(/sin/g, 'Math.sin')
        .replace(/cos/g, 'Math.cos')
        .replace(/tan/g, 'Math.tan')
        .replace(/log/g, 'Math.log10')
        .replace(/ln/g, 'Math.log')
        .replace(/sqrt/g, 'Math.sqrt')
        .replace(/abs/g, 'Math.abs')
        .replace(/exp/g, 'Math.exp')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e(?![x])/g, 'Math.E')
        .replace(/\^/g, '**');

      // Handle implicit multiplication (2x -> 2*x)
      expr = expr.replace(/(\d)([x])/gi, '$1*$2');
      expr = expr.replace(/([x])(\d)/gi, '$1*$2');
      expr = expr.replace(/\)(\d)/g, ')*$1');
      expr = expr.replace(/(\d)\(/g, '$1*(');
      expr = expr.replace(/\)\(/g, ')*(');
      expr = expr.replace(/([x])\(/gi, '$1*(');
      expr = expr.replace(/\)([x])/gi, ')*$1');

      // Replace x with value
      expr = expr.replace(/x/gi, `(${x})`);

      const result = eval(expr);
      if (typeof result === 'number' && isFinite(result)) {
        return result;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Generate points for a function
  const generatePoints = useCallback((equation: string): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    const step = (viewState.xMax - viewState.xMin) / 500;

    for (let x = viewState.xMin; x <= viewState.xMax; x += step) {
      const y = evaluateEquation(equation, x);
      if (y !== null) {
        points.push({ x, y });
      }
    }
    return points;
  }, [viewState, evaluateEquation]);

  // Add new function
  const handleAddFunction = () => {
    if (!newEquation.trim()) return;

    const cleanEquation = newEquation.replace(/^y\s*=\s*/i, '').trim();
    const points = generatePoints(cleanEquation);

    if (points.length === 0) {
      return; // Invalid equation
    }

    const newFunc: GraphFunction = {
      id: `func-${Date.now()}`,
      equation: cleanEquation,
      color: COLORS[functions.length % COLORS.length],
      visible: true,
      points,
    };

    setFunctions((prev) => [...prev, newFunc]);
    setNewEquation('');
    setAnimatingFunctionId(newFunc.id);
    setAnimationProgress(0);
  };

  // Animation effect
  useEffect(() => {
    if (animatingFunctionId) {
      const startTime = Date.now();
      const duration = 1500;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setAnimationProgress(progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimatingFunctionId(null);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [animatingFunctionId]);

  // Recalculate points when view changes
  useEffect(() => {
    setFunctions((prev) =>
      prev.map((f) => ({
        ...f,
        points: generatePoints(f.equation),
      }))
    );
  }, [viewState, generatePoints]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;

    // Clear
    ctx.fillStyle = 'hsl(222, 47%, 8%)';
    ctx.fillRect(0, 0, width, height);

    // Coordinate transformations
    const xToScreen = (x: number) => ((x - viewState.xMin) / (viewState.xMax - viewState.xMin)) * width;
    const yToScreen = (y: number) => height - ((y - viewState.yMin) / (viewState.yMax - viewState.yMin)) * height;

    // Draw grid
    ctx.strokeStyle = 'hsl(222, 30%, 18%)';
    ctx.lineWidth = 0.5;

    const gridStepX = Math.pow(10, Math.floor(Math.log10((viewState.xMax - viewState.xMin) / 5)));
    const gridStepY = Math.pow(10, Math.floor(Math.log10((viewState.yMax - viewState.yMin) / 5)));

    // Vertical lines
    for (let x = Math.ceil(viewState.xMin / gridStepX) * gridStepX; x <= viewState.xMax; x += gridStepX) {
      ctx.beginPath();
      ctx.moveTo(xToScreen(x), 0);
      ctx.lineTo(xToScreen(x), height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = Math.ceil(viewState.yMin / gridStepY) * gridStepY; y <= viewState.yMax; y += gridStepY) {
      ctx.beginPath();
      ctx.moveTo(0, yToScreen(y));
      ctx.lineTo(width, yToScreen(y));
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'hsl(222, 30%, 35%)';
    ctx.lineWidth = 1.5;

    // X-axis
    if (viewState.yMin <= 0 && viewState.yMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, yToScreen(0));
      ctx.lineTo(width, yToScreen(0));
      ctx.stroke();
    }

    // Y-axis
    if (viewState.xMin <= 0 && viewState.xMax >= 0) {
      ctx.beginPath();
      ctx.moveTo(xToScreen(0), 0);
      ctx.lineTo(xToScreen(0), height);
      ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = 'hsl(222, 20%, 50%)';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';

    for (let x = Math.ceil(viewState.xMin / gridStepX) * gridStepX; x <= viewState.xMax; x += gridStepX) {
      if (Math.abs(x) > 0.001) {
        const screenX = xToScreen(x);
        const screenY = viewState.yMin <= 0 && viewState.yMax >= 0 ? yToScreen(0) + 15 : height - 5;
        ctx.fillText(x.toFixed(gridStepX < 1 ? 1 : 0), screenX, screenY);
      }
    }

    ctx.textAlign = 'right';
    for (let y = Math.ceil(viewState.yMin / gridStepY) * gridStepY; y <= viewState.yMax; y += gridStepY) {
      if (Math.abs(y) > 0.001) {
        const screenX = viewState.xMin <= 0 && viewState.xMax >= 0 ? xToScreen(0) - 5 : 30;
        const screenY = yToScreen(y) + 4;
        ctx.fillText(y.toFixed(gridStepY < 1 ? 1 : 0), screenX, screenY);
      }
    }

    // Draw functions
    functions.forEach((func) => {
      if (!func.visible || func.points.length === 0) return;

      ctx.strokeStyle = func.color;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const isAnimating = animatingFunctionId === func.id;
      const pointsToRender = isAnimating
        ? Math.floor(func.points.length * animationProgress)
        : func.points.length;

      ctx.beginPath();
      let started = false;

      for (let i = 0; i < pointsToRender; i++) {
        const point = func.points[i];
        const screenX = xToScreen(point.x);
        const screenY = yToScreen(point.y);

        // Skip points outside view
        if (screenY < -100 || screenY > height + 100) {
          started = false;
          continue;
        }

        if (!started) {
          ctx.moveTo(screenX, screenY);
          started = true;
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }
      ctx.stroke();

      // Glow effect
      if (isAnimating || func.visible) {
        ctx.strokeStyle = func.color;
        ctx.lineWidth = 6;
        ctx.globalAlpha = 0.2;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.lineWidth = 2.5;
      }
    });

    // Draw hover point
    if (hoveredPoint) {
      ctx.fillStyle = 'hsl(210, 100%, 60%)';
      ctx.beginPath();
      ctx.arc(hoveredPoint.screenX, hoveredPoint.screenY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(hoveredPoint.screenX, hoveredPoint.screenY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [functions, viewState, animatingFunctionId, animationProgress, hoveredPoint]);

  // Mouse handlers for panning and coordinates
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      viewState: { ...viewState }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Handle dragging for panning
    if (isDragging && dragStart) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      const xRange = dragStart.viewState.xMax - dragStart.viewState.xMin;
      const yRange = dragStart.viewState.yMax - dragStart.viewState.yMin;

      const xShift = -(dx / rect.width) * xRange;
      const yShift = (dy / rect.height) * yRange;

      setViewState({
        xMin: dragStart.viewState.xMin + xShift,
        xMax: dragStart.viewState.xMax + xShift,
        yMin: dragStart.viewState.yMin + yShift,
        yMax: dragStart.viewState.yMax + yShift,
      });
      return;
    }

    const x = viewState.xMin + (screenX / rect.width) * (viewState.xMax - viewState.xMin);
    const y = viewState.yMax - (screenY / rect.height) * (viewState.yMax - viewState.yMin);

    setHoveredPoint({ x, y, screenX, screenY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setIsDragging(false);
    setDragStart(null);
  };

  // Wheel handler for zooming
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouse position to graph coordinates
    const graphX = viewState.xMin + (mouseX / rect.width) * (viewState.xMax - viewState.xMin);
    const graphY = viewState.yMax - (mouseY / rect.height) * (viewState.yMax - viewState.yMin);

    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    
    // Zoom centered on mouse position
    setViewState({
      xMin: graphX - (graphX - viewState.xMin) * factor,
      xMax: graphX + (viewState.xMax - graphX) * factor,
      yMin: graphY - (graphY - viewState.yMin) * factor,
      yMax: graphY + (viewState.yMax - graphY) * factor,
    });
  };

  // Zoom handlers
  const handleZoom = (direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 0.8 : 1.25;
    const centerX = (viewState.xMin + viewState.xMax) / 2;
    const centerY = (viewState.yMin + viewState.yMax) / 2;
    const rangeX = (viewState.xMax - viewState.xMin) * factor;
    const rangeY = (viewState.yMax - viewState.yMin) * factor;

    setViewState({
      xMin: centerX - rangeX / 2,
      xMax: centerX + rangeX / 2,
      yMin: centerY - rangeY / 2,
      yMax: centerY + rangeY / 2,
    });
  };

  const handleReset = () => {
    setViewState({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  };

  const toggleVisibility = (id: string) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
  };

  const removeFunction = (id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background p-4"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold neon-text">Graphing Calculator</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleZoom('in')} className="rounded-full">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleZoom('out')} className="rounded-full">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleReset} className="rounded-full">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <div className="flex gap-4 h-[calc(100vh-120px)]">
        {/* Functions Panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-80 flex flex-col"
        >
          <Card className="glass-strong p-4 flex-1 overflow-hidden flex flex-col">
            <h2 className="text-lg font-semibold mb-4 text-primary">Functions</h2>

            {/* Add function input */}
            <div className="flex gap-2 mb-4">
              <Input
                value={newEquation}
                onChange={(e) => setNewEquation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFunction()}
                placeholder="y = x^2, sin(x), ..."
                className="flex-1 bg-secondary/50"
              />
              <Button onClick={handleAddFunction} size="icon" className="shrink-0 neon-glow-subtle">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Function list */}
            <div className="flex-1 overflow-y-auto space-y-2">
              <AnimatePresence>
                {functions.map((func, index) => (
                  <motion.div
                    key={func.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-lg p-3 flex items-center gap-3"
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: func.color }}
                    />
                    <span className="flex-1 font-mono text-sm truncate">
                      y = {func.equation}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleVisibility(func.id)}
                    >
                      {func.visible ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeFunction(func.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {functions.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">No functions plotted</p>
                  <p className="text-xs mt-1 opacity-60">
                    Try: x^2, sin(x), 2*x + 1
                  </p>
                </div>
              )}
            </div>

            {/* Quick examples */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">Quick examples:</p>
              <div className="flex flex-wrap gap-1">
                {['x^2', 'sin(x)', '2*x+1', 'cos(x)', 'x^3', 'sqrt(x)'].map((eq) => (
                  <Button
                    key={eq}
                    variant="outline"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => {
                      setNewEquation(eq);
                    }}
                  >
                    {eq}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 relative"
        >
          <Card className="glass-strong h-full overflow-hidden relative">
            <canvas
              ref={canvasRef}
              className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onWheel={handleWheel}
            />

            {/* Coordinates display */}
            <AnimatePresence>
              {hoveredPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-4 right-4 glass rounded-lg px-3 py-2 font-mono text-sm"
                >
                  <span className="text-muted-foreground">x:</span>{' '}
                  <span className="text-primary">{hoveredPoint.x.toFixed(2)}</span>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <span className="text-muted-foreground">y:</span>{' '}
                  <span className="text-primary">{hoveredPoint.y.toFixed(2)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GraphingCalculator;
