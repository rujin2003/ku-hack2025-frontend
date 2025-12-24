// Advanced Circuit Calculator with Series, Parallel, and Mixed Circuit Support
import { CircuitComponent, Wire, CircuitState } from '@/stores/circuitStore';

interface Node {
  id: string;
  connections: Set<string>;
  componentId?: string;
  terminalId?: string;
}

interface CircuitGraph {
  nodes: Map<string, Node>;
  edges: Map<string, { componentId: string; resistance: number; type: string }>;
}

interface CalculationResult {
  circuitState: CircuitState;
  componentUpdates: Map<string, { current: number; voltageDrop: number; power: number; isOn?: boolean }>;
}

// LED current thresholds in Amps
const LED_MIN_CURRENT = 0.002; // 2mA minimum to light
const LED_MAX_CURRENT = 0.020; // 20mA max safe current
const BULB_MIN_CURRENT = 0.001; // 1mA minimum to glow

// Build graph representation of the circuit
function buildCircuitGraph(components: CircuitComponent[], wires: Wire[]): CircuitGraph {
  const nodes = new Map<string, Node>();
  const edges = new Map<string, { componentId: string; resistance: number; type: string }>();
  
  // Create nodes for each terminal
  components.forEach(comp => {
    comp.terminals.forEach(terminal => {
      const nodeId = `${comp.id}:${terminal.id}`;
      nodes.set(nodeId, {
        id: nodeId,
        connections: new Set(),
        componentId: comp.id,
        terminalId: terminal.id,
      });
    });
    
    // Create internal edge (connection through component)
    const leftNode = `${comp.id}:left`;
    const rightNode = `${comp.id}:right`;
    const edgeId = `${leftNode}-${rightNode}`;
    
    // Only add edge if switch is on or it's not a switch
    if (comp.type !== 'switch' || comp.properties.isOn) {
      const resistance = getComponentResistance(comp);
      edges.set(edgeId, {
        componentId: comp.id,
        resistance,
        type: comp.type,
      });
      
      // Connect internal terminals
      nodes.get(leftNode)?.connections.add(rightNode);
      nodes.get(rightNode)?.connections.add(leftNode);
    }
  });
  
  // Add wire connections (0 resistance connections between nodes)
  wires.forEach(wire => {
    const fromNode = `${wire.from.componentId}:${wire.from.terminalId}`;
    const toNode = `${wire.to.componentId}:${wire.to.terminalId}`;
    
    if (nodes.has(fromNode) && nodes.has(toNode)) {
      nodes.get(fromNode)?.connections.add(toNode);
      nodes.get(toNode)?.connections.add(fromNode);
    }
  });
  
  return { nodes, edges };
}

function getComponentResistance(component: CircuitComponent): number {
  switch (component.type) {
    case 'resistor':
    case 'bulb':
    case 'led':
      return component.properties.resistance || 0;
    case 'battery':
    case 'wire':
    case 'ammeter':
    case 'ground':
      return 0;
    case 'switch':
      return component.properties.isOn ? 0 : Infinity;
    case 'voltmeter':
      return Infinity; // Ideal voltmeter has infinite resistance
    default:
      return 0;
  }
}

// Find all nodes connected to a given node (union-find style)
function findConnectedNodes(startNode: string, nodes: Map<string, Node>, wires: Wire[]): Set<string> {
  const visited = new Set<string>();
  const queue = [startNode];
  
  // Build wire connections map (direct wire connections, not through components)
  const wireConnections = new Map<string, Set<string>>();
  wires.forEach(wire => {
    const fromNode = `${wire.from.componentId}:${wire.from.terminalId}`;
    const toNode = `${wire.to.componentId}:${wire.to.terminalId}`;
    
    if (!wireConnections.has(fromNode)) wireConnections.set(fromNode, new Set());
    if (!wireConnections.has(toNode)) wireConnections.set(toNode, new Set());
    
    wireConnections.get(fromNode)?.add(toNode);
    wireConnections.get(toNode)?.add(fromNode);
  });
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    
    // Only traverse wire connections (not through components)
    const connections = wireConnections.get(current);
    if (connections) {
      connections.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      });
    }
  }
  
  return visited;
}

// Detect circuit topology
interface CircuitTopology {
  isComplete: boolean;
  hasShortCircuit: boolean;
  isOpen: boolean;
  branches: Branch[];
  batteryVoltage: number;
}

interface Branch {
  id: string;
  components: CircuitComponent[];
  isParallel: boolean;
  resistance: number;
}

function detectTopology(
  components: CircuitComponent[],
  wires: Wire[],
  graph: CircuitGraph
): CircuitTopology {
  const battery = components.find(c => c.type === 'battery');
  
  if (!battery) {
    return {
      isComplete: false,
      hasShortCircuit: false,
      isOpen: true,
      branches: [],
      batteryVoltage: 0,
    };
  }
  
  const batteryVoltage = battery.properties.voltage || 0;
  const batteryPosNode = `${battery.id}:right`;
  const batteryNegNode = `${battery.id}:left`;
  
  // BFS to check if circuit is complete
  const visited = new Set<string>();
  const queue = [batteryPosNode];
  const parent = new Map<string, string>();
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    
    const node = graph.nodes.get(current);
    if (node) {
      node.connections.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          parent.set(neighbor, current);
          queue.push(neighbor);
        }
      });
    }
  }
  
  const isComplete = visited.has(batteryNegNode);
  
  if (!isComplete) {
    return {
      isComplete: false,
      hasShortCircuit: false,
      isOpen: true,
      branches: [],
      batteryVoltage,
    };
  }
  
  // Check for short circuit (path with no resistance)
  const resistiveComponents = components.filter(c => 
    (c.type === 'resistor' || c.type === 'bulb' || c.type === 'led') &&
    (c.properties.resistance || 0) > 0
  );
  
  // Find all paths from battery+ to battery-
  const paths = findAllPaths(graph, batteryPosNode, batteryNegNode);
  
  // Check if any path has zero resistance
  let hasShortCircuit = false;
  paths.forEach(path => {
    let pathResistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const edgeId1 = `${path[i]}-${path[i + 1]}`;
      const edgeId2 = `${path[i + 1]}-${path[i]}`;
      const edge = graph.edges.get(edgeId1) || graph.edges.get(edgeId2);
      if (edge) {
        pathResistance += edge.resistance;
      }
    }
    if (pathResistance === 0 && path.length > 2) {
      hasShortCircuit = true;
    }
  });
  
  if (resistiveComponents.length === 0) {
    hasShortCircuit = true;
  }
  
  // Analyze branches for series/parallel detection
  const branches = analyzeBranches(components, wires, graph, batteryPosNode, batteryNegNode);
  
  return {
    isComplete,
    hasShortCircuit,
    isOpen: false,
    branches,
    batteryVoltage,
  };
}

// Find all paths between two nodes (DFS)
function findAllPaths(
  graph: CircuitGraph,
  start: string,
  end: string,
  maxPaths: number = 10
): string[][] {
  const paths: string[][] = [];
  const visited = new Set<string>();
  
  function dfs(current: string, path: string[]) {
    if (paths.length >= maxPaths) return;
    if (current === end) {
      paths.push([...path]);
      return;
    }
    
    visited.add(current);
    const node = graph.nodes.get(current);
    
    if (node) {
      node.connections.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path, neighbor]);
        }
      });
    }
    
    visited.delete(current);
  }
  
  dfs(start, [start]);
  return paths;
}

// Analyze circuit branches
function analyzeBranches(
  components: CircuitComponent[],
  wires: Wire[],
  graph: CircuitGraph,
  startNode: string,
  endNode: string
): Branch[] {
  const paths = findAllPaths(graph, startNode, endNode);
  const branches: Branch[] = [];
  
  paths.forEach((path, index) => {
    const branchComponents: CircuitComponent[] = [];
    let resistance = 0;
    
    for (let i = 0; i < path.length - 1; i++) {
      const edgeId1 = `${path[i]}-${path[i + 1]}`;
      const edgeId2 = `${path[i + 1]}-${path[i]}`;
      const edge = graph.edges.get(edgeId1) || graph.edges.get(edgeId2);
      
      if (edge) {
        const comp = components.find(c => c.id === edge.componentId);
        if (comp && !branchComponents.includes(comp)) {
          branchComponents.push(comp);
          resistance += edge.resistance;
        }
      }
    }
    
    branches.push({
      id: `branch-${index}`,
      components: branchComponents,
      isParallel: paths.length > 1,
      resistance,
    });
  });
  
  return branches;
}

// Calculate equivalent resistance
function calculateEquivalentResistance(branches: Branch[]): number {
  if (branches.length === 0) return 0;
  
  // Check if all branches share the same components (series)
  if (branches.length === 1) {
    return branches[0].resistance;
  }
  
  // Parallel branches - 1/R_eq = sum(1/Ri)
  let inverseSum = 0;
  let hasInfinite = false;
  
  branches.forEach(branch => {
    if (branch.resistance === Infinity) {
      hasInfinite = true;
    } else if (branch.resistance > 0) {
      inverseSum += 1 / branch.resistance;
    }
  });
  
  // If all branches have infinite resistance, return infinity
  if (inverseSum === 0) {
    return hasInfinite ? Infinity : 0;
  }
  
  return 1 / inverseSum;
}

// Main calculation function
export function calculateCircuitAdvanced(
  components: CircuitComponent[],
  wires: Wire[]
): CalculationResult {
  const graph = buildCircuitGraph(components, wires);
  const topology = detectTopology(components, wires, graph);
  const componentUpdates = new Map<string, { current: number; voltageDrop: number; power: number; isOn?: boolean }>();
  
  // Initialize all components with zero values
  components.forEach(comp => {
    componentUpdates.set(comp.id, {
      current: 0,
      voltageDrop: 0,
      power: 0,
      isOn: comp.type === 'bulb' || comp.type === 'led' ? false : comp.properties.isOn,
    });
  });
  
  // Handle incomplete or short circuit cases
  if (!topology.isComplete || topology.hasShortCircuit) {
    return {
      circuitState: {
        totalVoltage: topology.batteryVoltage,
        totalCurrent: topology.hasShortCircuit ? Infinity : 0,
        totalResistance: topology.hasShortCircuit ? 0 : Infinity,
        totalPower: 0,
        isComplete: topology.isComplete,
        hasShortCircuit: topology.hasShortCircuit,
      },
      componentUpdates,
    };
  }
  
  // Calculate equivalent resistance
  const totalResistance = calculateEquivalentResistance(topology.branches);
  
  if (totalResistance === 0 || totalResistance === Infinity) {
    return {
      circuitState: {
        totalVoltage: topology.batteryVoltage,
        totalCurrent: totalResistance === 0 ? Infinity : 0,
        totalResistance,
        totalPower: 0,
        isComplete: true,
        hasShortCircuit: totalResistance === 0,
      },
      componentUpdates,
    };
  }
  
  // Ohm's Law: I = V / R
  const totalCurrent = topology.batteryVoltage / totalResistance;
  
  // Total Power: P = V * I
  const totalPower = topology.batteryVoltage * totalCurrent;
  
  // Calculate individual component values
  if (topology.branches.length === 1) {
    // Series circuit - same current through all components
    topology.branches[0].components.forEach(comp => {
      const resistance = getComponentResistance(comp);
      const current = totalCurrent;
      const voltageDrop = current * resistance; // V = I * R
      const power = current * current * resistance; // P = I²R
      
      let isOn: boolean | undefined;
      if (comp.type === 'bulb') {
        isOn = current >= BULB_MIN_CURRENT;
      } else if (comp.type === 'led') {
        isOn = current >= LED_MIN_CURRENT && current <= LED_MAX_CURRENT;
      }
      
      componentUpdates.set(comp.id, { current, voltageDrop, power, isOn });
    });
  } else {
    // Parallel or mixed circuit
    topology.branches.forEach(branch => {
      if (branch.resistance === 0 || branch.resistance === Infinity) return;
      
      // Branch current: I_branch = V / R_branch
      const branchCurrent = topology.batteryVoltage / branch.resistance;
      
      // Calculate for each component in the branch
      branch.components.forEach(comp => {
        const resistance = getComponentResistance(comp);
        
        // For series components within a parallel branch
        const current = branchCurrent;
        const voltageDrop = current * resistance;
        const power = current * current * resistance;
        
        let isOn: boolean | undefined;
        if (comp.type === 'bulb') {
          isOn = current >= BULB_MIN_CURRENT;
        } else if (comp.type === 'led') {
          isOn = current >= LED_MIN_CURRENT && current <= LED_MAX_CURRENT;
        }
        
        // Combine if component appears in multiple branches
        const existing = componentUpdates.get(comp.id);
        if (existing && existing.current > 0) {
          componentUpdates.set(comp.id, {
            current: existing.current + current,
            voltageDrop: Math.max(existing.voltageDrop, voltageDrop),
            power: existing.power + power,
            isOn: isOn ?? existing.isOn,
          });
        } else {
          componentUpdates.set(comp.id, { current, voltageDrop, power, isOn });
        }
      });
    });
  }
  
  // Update ammeter and voltmeter readings
  components.forEach(comp => {
    if (comp.type === 'ammeter') {
      componentUpdates.set(comp.id, {
        current: totalCurrent,
        voltageDrop: 0,
        power: 0,
      });
    } else if (comp.type === 'voltmeter') {
      componentUpdates.set(comp.id, {
        current: 0,
        voltageDrop: topology.batteryVoltage,
        power: 0,
      });
    }
  });
  
  return {
    circuitState: {
      totalVoltage: topology.batteryVoltage,
      totalCurrent,
      totalResistance,
      totalPower,
      isComplete: true,
      hasShortCircuit: false,
    },
    componentUpdates,
  };
}

// Format values for display
export function formatCurrent(amps: number): string {
  if (amps >= 1) return `${amps.toFixed(2)} A`;
  if (amps >= 0.001) return `${(amps * 1000).toFixed(1)} mA`;
  return `${(amps * 1000000).toFixed(0)} µA`;
}

export function formatVoltage(volts: number): string {
  if (volts >= 1) return `${volts.toFixed(2)} V`;
  return `${(volts * 1000).toFixed(1)} mV`;
}

export function formatResistance(ohms: number): string {
  if (ohms === Infinity) return '∞ Ω';
  if (ohms >= 1000000) return `${(ohms / 1000000).toFixed(2)} MΩ`;
  if (ohms >= 1000) return `${(ohms / 1000).toFixed(2)} kΩ`;
  return `${ohms.toFixed(1)} Ω`;
}

export function formatPower(watts: number): string {
  if (watts >= 1) return `${watts.toFixed(2)} W`;
  return `${(watts * 1000).toFixed(2)} mW`;
}
