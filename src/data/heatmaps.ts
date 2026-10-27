export interface AttentionHead {
  id: number;
  name: string;
  role: string;
  layer: number;
  sparsity: number; // Gini coefficient
  entropy: number; // Shannon entropy in bits
  focalBbox: { top: string; left: string; width: string; height: string };
  centerCoords: { x: number; y: number };
  sampleToken: string;
  matrix: number[][]; // 14x14 grid
}

// Generate normalized 14x14 gaussian hotspot matrix
function generateGaussianGrid(cx: number, cy: number, sigma: number, intensity: number): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < 14; r++) {
    const row: number[] = [];
    for (let c = 0; c < 14; c++) {
      const distSq = (r - cy) ** 2 + (c - cx) ** 2;
      const val = Math.exp(-distSq / (2 * sigma ** 2)) * intensity;
      // Add subtle background noise for realistic multi-head attention distribution
      const noise = ((r * 7 + c * 13) % 17) * 0.005;
      row.push(Math.min(1.0, Math.max(0.01, +(val + noise).toFixed(3))));
    }
    grid.push(row);
  }
  return grid;
}

export const ATTENTION_HEADS: AttentionHead[] = [
  {
    id: 1,
    name: 'Head 1: Geometric Contour & Edge Salience',
    role: 'Localizes high-frequency object contours and boundary silhouettes',
    layer: 4,
    sparsity: 0.84,
    entropy: 2.12,
    focalBbox: { top: '24%', left: '34%', width: '38%', height: '42%' },
    centerCoords: { x: 5, y: 5 },
    sampleToken: 'retriever',
    matrix: generateGaussianGrid(6, 5, 2.1, 0.94),
  },
  {
    id: 2,
    name: 'Head 2: Focal Manipulandum (Disc/Object)',
    role: 'Cross-attends directly to target interactive objects in trajectory',
    layer: 8,
    sparsity: 0.92,
    entropy: 1.45,
    focalBbox: { top: '28%', left: '32%', width: '18%', height: '16%' },
    centerCoords: { x: 4, y: 4 },
    sampleToken: 'frisbee',
    matrix: generateGaussianGrid(4, 4, 1.4, 0.99),
  },
  {
    id: 3,
    name: 'Head 3: Dynamic Motion & Velocity Vector',
    role: 'Attends to limbs, paws, and trailing droplets indicating jump velocity',
    layer: 8,
    sparsity: 0.78,
    entropy: 2.58,
    focalBbox: { top: '35%', left: '38%', width: '42%', height: '50%' },
    centerCoords: { x: 7, y: 7 },
    sampleToken: 'leaping',
    matrix: generateGaussianGrid(7, 6, 2.8, 0.89),
  },
  {
    id: 4,
    name: 'Head 4: Semantic Color & Chromaticity',
    role: 'Associates neon pigment wavelengths with token descriptor "orange"',
    layer: 4,
    sparsity: 0.91,
    entropy: 1.62,
    focalBbox: { top: '27%', left: '33%', width: '17%', height: '15%' },
    centerCoords: { x: 5, y: 4 },
    sampleToken: 'orange',
    matrix: generateGaussianGrid(5, 4, 1.3, 0.98),
  },
  {
    id: 5,
    name: 'Head 5: Ground Plane & Spatial Anchor',
    role: 'Encodes spatial horizon line, grass substrate, and lighting direction',
    layer: 1,
    sparsity: 0.65,
    entropy: 3.42,
    focalBbox: { top: '65%', left: '10%', width: '80%', height: '30%' },
    centerCoords: { x: 7, y: 11 },
    sampleToken: 'lawn',
    matrix: generateGaussianGrid(7, 11, 4.2, 0.86),
  },
  {
    id: 6,
    name: 'Head 6: Syntactic Subject-Verb Binding',
    role: 'Binds agent ("dog") with predatory intercept predicate ("catching")',
    layer: 12,
    sparsity: 0.88,
    entropy: 1.88,
    focalBbox: { top: '26%', left: '36%', width: '30%', height: '28%' },
    centerCoords: { x: 6, y: 4 },
    sampleToken: 'catching',
    matrix: generateGaussianGrid(6, 4, 1.9, 0.95),
  },
  {
    id: 7,
    name: 'Head 7: Expression & Cephalic Orientation',
    role: 'Focuses on snout trajectory, gaze vector, and open jaw tension',
    layer: 8,
    sparsity: 0.94,
    entropy: 1.31,
    focalBbox: { top: '29%', left: '46%', width: '22%', height: '22%' },
    centerCoords: { x: 7, y: 4 },
    sampleToken: 'golden',
    matrix: generateGaussianGrid(7, 4, 1.5, 0.97),
  },
  {
    id: 8,
    name: 'Head 8: Global Scene Coherence',
    role: 'Diffused self-attention across wide contextual field and sky illumination',
    layer: 12,
    sparsity: 0.52,
    entropy: 3.89,
    focalBbox: { top: '10%', left: '10%', width: '80%', height: '80%' },
    centerCoords: { x: 6, y: 6 },
    sampleToken: 'gracefully',
    matrix: generateGaussianGrid(6, 6, 5.0, 0.81),
  },
];

export const COLORMAPS = [
  { id: 'cyber', name: 'Cyan & Emerald (WCAG Compliant)', from: 'rgba(76, 215, 246, 0.25)', to: 'rgba(78, 222, 163, 0.85)' },
  { id: 'turbo', name: 'Turbo Spectral', from: 'rgba(50, 100, 255, 0.2)', to: 'rgba(255, 60, 40, 0.85)' },
  { id: 'magma', name: 'Magma High-Contrast', from: 'rgba(128, 0, 128, 0.2)', to: 'rgba(255, 220, 60, 0.9)' },
  { id: 'monochrome', name: 'Monochrome High-Vis (Pure AAA)', from: 'rgba(255, 255, 255, 0.1)', to: 'rgba(255, 255, 255, 0.95)' },
];
