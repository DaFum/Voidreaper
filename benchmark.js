import { performance } from 'node:perf_hooks';

// Mock state
const state = {
  nodesById: {},
  nodeIdByModuleInstanceId: {}
};

for (let i = 0; i < 10000; i++) {
  const nodeId = `node-${i}`;
  const moduleInstanceId = `module-${i}`;
  state.nodesById[nodeId] = { nodeId, moduleInstanceId };
  state.nodeIdByModuleInstanceId[moduleInstanceId] = nodeId;
}

const selectModuleOwnerOld = (state, moduleInstanceId) => Object.values(state.nodesById).find(node => node.moduleInstanceId === moduleInstanceId) ?? null;
const selectModuleOwnerNew = (state, moduleInstanceId) => {
  if (state.nodeIdByModuleInstanceId) {
    const nodeId = state.nodeIdByModuleInstanceId[moduleInstanceId];
    return nodeId ? state.nodesById[nodeId] ?? null : null;
  }
  return Object.values(state.nodesById).find(node => node.moduleInstanceId === moduleInstanceId) ?? null;
};

// Warmup
for (let i = 0; i < 100; i++) {
  selectModuleOwnerOld(state, `module-${i}`);
  selectModuleOwnerNew(state, `module-${i}`);
}

const iterations = 10000;

const startOld = performance.now();
for (let i = 0; i < iterations; i++) {
  selectModuleOwnerOld(state, `module-${i}`);
}
const endOld = performance.now();
console.log(`Old: ${endOld - startOld}ms`);

const startNew = performance.now();
for (let i = 0; i < iterations; i++) {
  selectModuleOwnerNew(state, `module-${i}`);
}
const endNew = performance.now();
console.log(`New: ${endNew - startNew}ms`);
