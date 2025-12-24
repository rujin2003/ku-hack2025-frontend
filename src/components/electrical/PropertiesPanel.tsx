import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Trash2, Zap, Activity, Thermometer } from 'lucide-react';
import { useCircuitStore, CircuitComponent } from '@/stores/circuitStore';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PropertiesPanelProps {
  componentId: string | null;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ componentId }) => {
  const { components, circuitState, updateComponentProperty, updateComponent, removeComponent, selectComponent } = useCircuitStore();
  
  const component = components.find((c) => c.id === componentId);

  if (!component) {
    return (
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 h-full glass-strong rounded-l-2xl p-4 flex flex-col"
      >
        <div className="text-sm font-semibold text-primary mb-4">Properties</div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            Select a component to view its properties
          </p>
        </div>
        
        {/* Quick guide */}
        <div className="mt-4 p-3 rounded-lg bg-secondary/30 space-y-2">
          <p className="text-xs font-medium text-foreground">Quick Guide:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Drag components onto canvas</li>
            <li>• Click terminals to connect wires</li>
            <li>• Shift+Drag to pan the canvas</li>
            <li>• Scroll to zoom in/out</li>
          </ul>
        </div>
      </motion.div>
    );
  }

  const handleRotate = () => {
    updateComponent(component.id, { rotation: (component.rotation + 90) % 360 });
  };

  const handleDelete = () => {
    removeComponent(component.id);
    selectComponent(null);
  };

  const formatValue = (value: number | undefined, decimals: number = 2): string => {
    if (value === undefined || value === 0) return '0';
    if (value < 0.001) return value.toExponential(2);
    return value.toFixed(decimals);
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 h-full glass-strong rounded-l-2xl p-4 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-primary capitalize">{component.type}</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => selectComponent(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {component.type === 'battery' && (
            <motion.div
              key="battery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Voltage (V)</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[component.properties.voltage || 9]}
                    onValueChange={([v]) => {
                      updateComponentProperty(component.id, 'voltage', v);
                    }}
                    min={1}
                    max={24}
                    step={0.5}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={component.properties.voltage || 9}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 1;
                      updateComponentProperty(component.id, 'voltage', v);
                    }}
                    className="w-16 h-8 text-xs font-mono"
                  />
                </div>
              </div>
              
              {/* Battery info */}
              <div className="p-3 rounded-lg bg-secondary/30 space-y-2">
                <p className="text-xs text-muted-foreground">This is the voltage source (EMF) that drives current through the circuit.</p>
              </div>
            </motion.div>
          )}

          {component.type === 'resistor' && (
            <motion.div
              key="resistor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Resistance (Ω)</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[Math.log10(component.properties.resistance || 100)]}
                    onValueChange={([v]) => {
                      const resistance = Math.round(Math.pow(10, v));
                      updateComponentProperty(component.id, 'resistance', resistance);
                    }}
                    min={0}
                    max={5}
                    step={0.1}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={component.properties.resistance || 100}
                    onChange={(e) => {
                      const r = parseFloat(e.target.value) || 1;
                      updateComponentProperty(component.id, 'resistance', r);
                    }}
                    className="w-20 h-8 text-xs font-mono"
                  />
                </div>
              </div>
              
              {/* Calculated values */}
              {circuitState.isComplete && (
                <div className="p-3 rounded-lg bg-secondary/50 space-y-3">
                  <p className="text-xs font-medium text-foreground">Calculated Values:</p>
                  
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-electric-cyan" />
                    <span className="text-xs text-muted-foreground">Current:</span>
                    <span className="text-xs font-mono text-foreground ml-auto">
                      {formatValue((component.properties.current || 0) * 1000)} mA
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-electric-amber" />
                    <span className="text-xs text-muted-foreground">Voltage Drop:</span>
                    <span className="text-xs font-mono text-foreground ml-auto">
                      {formatValue(component.properties.voltageDrop)} V
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-3 w-3 text-electric-red" />
                    <span className="text-xs text-muted-foreground">Power:</span>
                    <span className="text-xs font-mono text-foreground ml-auto">
                      {formatValue((component.properties.power || 0) * 1000)} mW
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {(component.type === 'bulb' || component.type === 'led') && (
            <motion.div
              key="bulb-led"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Resistance (Ω)</Label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[component.properties.resistance || 50]}
                    onValueChange={([v]) => {
                      updateComponentProperty(component.id, 'resistance', v);
                    }}
                    min={10}
                    max={500}
                    step={5}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={component.properties.resistance || 50}
                    onChange={(e) => {
                      const r = parseFloat(e.target.value) || 10;
                      updateComponentProperty(component.id, 'resistance', r);
                    }}
                    className="w-16 h-8 text-xs font-mono"
                  />
                </div>
              </div>
              
              {component.type === 'led' && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Color</Label>
                  <div className="flex gap-2">
                    {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ffffff'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateComponentProperty(component.id, 'color', color)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          component.properties.color === color
                            ? 'border-primary scale-110'
                            : 'border-transparent hover:border-primary/50'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    component.properties.isOn 
                      ? 'text-electric-green bg-electric-green/20' 
                      : 'text-muted-foreground bg-secondary'
                  }`}
                >
                  {component.properties.isOn ? 'ON' : 'OFF'}
                </span>
              </div>
              
              {/* Calculated values */}
              {circuitState.isComplete && (
                <div className="p-3 rounded-lg bg-secondary/50 space-y-3">
                  <p className="text-xs font-medium text-foreground">Calculated Values:</p>
                  
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-electric-cyan" />
                    <span className="text-xs text-muted-foreground">Current:</span>
                    <span className="text-xs font-mono text-foreground ml-auto">
                      {formatValue((component.properties.current || 0) * 1000)} mA
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-electric-amber" />
                    <span className="text-xs text-muted-foreground">Voltage Drop:</span>
                    <span className="text-xs font-mono text-foreground ml-auto">
                      {formatValue(component.properties.voltageDrop)} V
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-3 w-3 text-electric-red" />
                    <span className="text-xs text-muted-foreground">Power:</span>
                    <span className="text-xs font-mono text-foreground ml-auto">
                      {formatValue((component.properties.power || 0) * 1000)} mW
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {component.type === 'switch' && (
            <motion.div
              key="switch"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <Label className="text-xs text-muted-foreground">Switch State</Label>
                <Switch
                  checked={component.properties.isOn}
                  onCheckedChange={(checked) =>
                    updateComponentProperty(component.id, 'isOn', checked)
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground px-1">
                {component.properties.isOn 
                  ? '✓ Circuit is closed - current can flow' 
                  : '✗ Circuit is open - no current flows'}
              </p>
            </motion.div>
          )}

          {component.type === 'ammeter' && (
            <motion.div
              key="ammeter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground mb-2">Current Reading</p>
                <p className="text-2xl font-mono font-bold text-electric-cyan">
                  {formatValue((component.properties.current || 0) * 1000)} mA
                </p>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Ammeter measures the current flowing through the circuit. Connect in series.
              </p>
            </motion.div>
          )}

          {component.type === 'voltmeter' && (
            <motion.div
              key="voltmeter"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground mb-2">Voltage Reading</p>
                <p className="text-2xl font-mono font-bold text-electric-amber">
                  {formatValue(component.properties.voltage)} V
                </p>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                Voltmeter measures potential difference. Connect in parallel across components.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRotate}
          className="flex-1 gap-2"
        >
          <RotateCw className="h-3 w-3" />
          Rotate
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          className="flex-1 gap-2"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </Button>
      </div>
    </motion.div>
  );
};

export default PropertiesPanel;