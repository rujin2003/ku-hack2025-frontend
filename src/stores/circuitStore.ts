import { create } from 'zustand';
import { calculateCircuitAdvanced, formatCurrent, formatVoltage, formatResistance, formatPower } from '@/lib/circuitCalculator';

export type ComponentType = 'battery' | 'resistor' | 'bulb' | 'switch' | 'wire' | 'ammeter' | 'voltmeter' | 'ground' | 'led';

export interface Position {
  x: number;
  y: number;
}

export interface Terminal {
  id: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  connected: boolean;
  connectedTo?: string;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  position: Position;
  rotation: number;
  properties: {
    resistance?: number;
    voltage?: number;
    current?: number;
    voltageDrop?: number;
    power?: number;
    isOn?: boolean;
    color?: string;
    label?: string;
  };
  terminals: Terminal[];
}

export interface Wire {
  id: string;
  from: { componentId: string; terminalId: string };
  to: { componentId: string; terminalId: string };
  points: Position[];
}

export interface CircuitState {
  totalVoltage: number;
  totalCurrent: number;
  totalResistance: number;
  totalPower: number;
  isComplete: boolean;
  hasShortCircuit: boolean;
}

// Re-export formatters for use in components
export { formatCurrent, formatVoltage, formatResistance, formatPower };

interface CircuitStore {
  components: CircuitComponent[];
  wires: Wire[];
  selectedComponent: string | null;
  circuitState: CircuitState;
  gridSize: number;
  zoom: number;
  panOffset: Position;
  
  addComponent: (type: ComponentType, position: Position) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
  updateComponentProperty: (id: string, property: string, value: any) => void;
  selectComponent: (id: string | null) => void;
  addWire: (wire: Omit<Wire, 'id'>) => void;
  removeWire: (id: string) => void;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: Position) => void;
  calculateCircuit: () => void;
  clearCircuit: () => void;
}

const GRID_SIZE = 20;

const snapToGrid = (value: number): number => {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
};

const createTerminals = (type: ComponentType): Terminal[] => {
  return [
    { id: 'left', position: 'left', connected: false },
    { id: 'right', position: 'right', connected: false },
  ];
};

const getDefaultProperties = (type: ComponentType) => {
  switch (type) {
    case 'battery':
      return { voltage: 9, label: '9V', resistance: 0 };
    case 'resistor':
      return { resistance: 100, label: '100Ω', voltageDrop: 0, current: 0, power: 0 };
    case 'bulb':
      return { resistance: 50, isOn: false, label: 'Bulb 50Ω', voltageDrop: 0, current: 0, power: 0 };
    case 'led':
      return { resistance: 20, color: '#00ff00', isOn: false, label: 'LED', voltageDrop: 0, current: 0, power: 0 };
    case 'switch':
      return { isOn: true, label: 'Switch ON', resistance: 0 };
    case 'ammeter':
      return { current: 0, label: '0 mA', resistance: 0 };
    case 'voltmeter':
      return { voltage: 0, label: '0 V', resistance: Infinity };
    case 'ground':
      return { label: 'GND', resistance: 0 };
    case 'wire':
      return { label: 'Node', resistance: 0 };
    default:
      return { label: type, resistance: 0 };
  }
};

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  components: [],
  wires: [],
  selectedComponent: null,
  circuitState: {
    totalVoltage: 0,
    totalCurrent: 0,
    totalResistance: 0,
    totalPower: 0,
    isComplete: false,
    hasShortCircuit: false,
  },
  gridSize: GRID_SIZE,
  zoom: 1,
  panOffset: { x: 0, y: 0 },

  addComponent: (type, position) => {
    const snappedPosition = {
      x: snapToGrid(position.x),
      y: snapToGrid(position.y),
    };
    
    const newComponent: CircuitComponent = {
      id: `${type}-${Date.now()}`,
      type,
      position: snappedPosition,
      rotation: 0,
      properties: getDefaultProperties(type),
      terminals: createTerminals(type),
    };
    
    set((state) => ({
      components: [...state.components, newComponent],
    }));
    
    setTimeout(() => get().calculateCircuit(), 0);
  },

  removeComponent: (id) => {
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      wires: state.wires.filter(
        (w) => w.from.componentId !== id && w.to.componentId !== id
      ),
      selectedComponent: state.selectedComponent === id ? null : state.selectedComponent,
    }));
    
    setTimeout(() => get().calculateCircuit(), 0);
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    
    // Don't recalculate on position updates (too frequent)
    if (!updates.position) {
      setTimeout(() => get().calculateCircuit(), 0);
    }
  },

  updateComponentProperty: (id, property, value) => {
    set((state) => ({
      components: state.components.map((c) => {
        if (c.id !== id) return c;
        
        const newProps = { ...c.properties, [property]: value };
        
        // Update labels automatically
        if (c.type === 'switch' && property === 'isOn') {
          newProps.label = value ? 'Switch ON' : 'Switch OFF';
        }
        if (c.type === 'resistor' && property === 'resistance') {
          newProps.label = `${value}Ω`;
        }
        if (c.type === 'bulb' && property === 'resistance') {
          newProps.label = `Bulb ${value}Ω`;
        }
        if (c.type === 'battery' && property === 'voltage') {
          newProps.label = `${value}V`;
        }
        
        return { ...c, properties: newProps };
      }),
    }));
    
    setTimeout(() => get().calculateCircuit(), 0);
  },

  selectComponent: (id) => {
    set({ selectedComponent: id });
  },

  addWire: (wire) => {
    // Check if wire already exists
    const existingWire = get().wires.find(w => 
      (w.from.componentId === wire.from.componentId && 
       w.from.terminalId === wire.from.terminalId &&
       w.to.componentId === wire.to.componentId && 
       w.to.terminalId === wire.to.terminalId) ||
      (w.from.componentId === wire.to.componentId && 
       w.from.terminalId === wire.to.terminalId &&
       w.to.componentId === wire.from.componentId && 
       w.to.terminalId === wire.from.terminalId)
    );
    
    if (existingWire) return;
    
    const newWire: Wire = {
      ...wire,
      id: `wire-${Date.now()}`,
    };
    
    set((state) => ({
      wires: [...state.wires, newWire],
      components: state.components.map((c) => {
        if (c.id === wire.from.componentId || c.id === wire.to.componentId) {
          return {
            ...c,
            terminals: c.terminals.map((t) => {
              if (
                (c.id === wire.from.componentId && t.id === wire.from.terminalId) ||
                (c.id === wire.to.componentId && t.id === wire.to.terminalId)
              ) {
                return { ...t, connected: true };
              }
              return t;
            }),
          };
        }
        return c;
      }),
    }));
    
    setTimeout(() => get().calculateCircuit(), 0);
  },

  removeWire: (id) => {
    const wire = get().wires.find((w) => w.id === id);
    if (!wire) return;
    
    set((state) => ({
      wires: state.wires.filter((w) => w.id !== id),
      components: state.components.map((c) => {
        if (c.id === wire.from.componentId || c.id === wire.to.componentId) {
          return {
            ...c,
            terminals: c.terminals.map((t) => {
              if (
                (c.id === wire.from.componentId && t.id === wire.from.terminalId) ||
                (c.id === wire.to.componentId && t.id === wire.to.terminalId)
              ) {
                return { ...t, connected: false, connectedTo: undefined };
              }
              return t;
            }),
          };
        }
        return c;
      }),
    }));
    
    setTimeout(() => get().calculateCircuit(), 0);
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(0.3, Math.min(3, zoom)) });
  },

  setPanOffset: (offset) => {
    set({ panOffset: offset });
  },

  calculateCircuit: () => {
    const { components, wires } = get();
    
    // Use advanced circuit calculator
    const result = calculateCircuitAdvanced(components, wires);
    
    // Update component states with calculated values
    const updatedComponents = components.map((c) => {
      const updates = result.componentUpdates.get(c.id);
      if (!updates) return c;
      
      const props = { ...c.properties };
      props.current = updates.current;
      props.voltageDrop = updates.voltageDrop;
      props.power = updates.power;
      
      if (updates.isOn !== undefined) {
        props.isOn = updates.isOn;
      }
      
      // Update labels with formatted values
      if (c.type === 'ammeter') {
        props.label = formatCurrent(updates.current);
      }
      if (c.type === 'voltmeter') {
        props.label = formatVoltage(updates.voltageDrop || result.circuitState.totalVoltage);
      }
      
      return { ...c, properties: props };
    });
    
    set({
      circuitState: result.circuitState,
      components: updatedComponents,
    });
  },

  clearCircuit: () => {
    set({
      components: [],
      wires: [],
      selectedComponent: null,
      circuitState: {
        totalVoltage: 0,
        totalCurrent: 0,
        totalResistance: 0,
        totalPower: 0,
        isComplete: false,
        hasShortCircuit: false,
      },
    });
  },
}));