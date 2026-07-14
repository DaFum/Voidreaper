import { performance } from "node:perf_hooks";

// Mock data to simulate chapters
const chapters = Array.from({ length: 50 }, (_, i) => ({
  id: `chapter-${i}`,
  steps: Array.from({ length: 20 }, (_, j) => ({
    id: `step-${j}`,
    event: j % 2 === 0 ? `event-${j}` : null,
  }))
}));

function baseline() {
  const result = new Set(chapters.flatMap(chapter => chapter.steps.map(step => step.event).filter(Boolean)));
  return result;
}

function optimized() {
  const result = new Set();
  for (const chapter of chapters) {
    for (const step of chapter.steps) {
      if (step.event) {
        result.add(step.event);
      }
    }
  }
  return result;
}

// Warmup
for (let i = 0; i < 10000; i++) {
  baseline();
  optimized();
}

const ITERATIONS = 100000;

const startBaseline = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  baseline();
}
const endBaseline = performance.now();

const startOptimized = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  optimized();
}
const endOptimized = performance.now();

const baselineTime = endBaseline - startBaseline;
const optimizedTime = endOptimized - startOptimized;

console.log(`Baseline: ${baselineTime.toFixed(2)}ms`);
console.log(`Optimized: ${optimizedTime.toFixed(2)}ms`);
console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}% faster`);
