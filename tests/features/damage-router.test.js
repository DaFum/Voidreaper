import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { sortHitCandidates } from '../../src/features/ship-assembly/damage/damage-router.js';

describe('sortHitCandidates', () => {
    test('sorts by distanceAlongRay in ascending order', () => {
        const candidates = [
            { distanceAlongRay: 10, zone: { priority: 1 } },
            { distanceAlongRay: 5, zone: { priority: 1 } },
            { distanceAlongRay: 15, zone: { priority: 1 } },
        ];
        const sorted = sortHitCandidates(candidates);
        assert.deepEqual(sorted, [
            { distanceAlongRay: 5, zone: { priority: 1 } },
            { distanceAlongRay: 10, zone: { priority: 1 } },
            { distanceAlongRay: 15, zone: { priority: 1 } },
        ]);
    });

    test('sorts by zone.priority in descending order when distanceAlongRay is equal', () => {
        const candidates = [
            { distanceAlongRay: 10, zone: { priority: 1 } },
            { distanceAlongRay: 10, zone: { priority: 5 } },
            { distanceAlongRay: 10, zone: { priority: 3 } },
        ];
        const sorted = sortHitCandidates(candidates);
        assert.deepEqual(sorted, [
            { distanceAlongRay: 10, zone: { priority: 5 } },
            { distanceAlongRay: 10, zone: { priority: 3 } },
            { distanceAlongRay: 10, zone: { priority: 1 } },
        ]);
    });

    test('handles complex sorting with both distance and priority', () => {
        const candidates = [
            { id: 1, distanceAlongRay: 10, zone: { priority: 1 } },
            { id: 2, distanceAlongRay: 5, zone: { priority: 1 } },
            { id: 3, distanceAlongRay: 10, zone: { priority: 5 } },
            { id: 4, distanceAlongRay: 15, zone: { priority: 1 } },
            { id: 5, distanceAlongRay: 5, zone: { priority: 3 } },
        ];
        const sorted = sortHitCandidates(candidates);
        assert.deepEqual(sorted, [
            { id: 5, distanceAlongRay: 5, zone: { priority: 3 } },
            { id: 2, distanceAlongRay: 5, zone: { priority: 1 } },
            { id: 3, distanceAlongRay: 10, zone: { priority: 5 } },
            { id: 1, distanceAlongRay: 10, zone: { priority: 1 } },
            { id: 4, distanceAlongRay: 15, zone: { priority: 1 } },
        ]);
    });

    test('does not mutate the original array', () => {
        const candidates = [
            { distanceAlongRay: 10, zone: { priority: 1 } },
            { distanceAlongRay: 5, zone: { priority: 1 } },
        ];
        const originalCandidates = [...candidates];
        const sorted = sortHitCandidates(candidates);
        assert.notStrictEqual(sorted, candidates);
        assert.deepEqual(candidates, originalCandidates);
    });

    test('handles an empty array', () => {
        const sorted = sortHitCandidates([]);
        assert.deepEqual(sorted, []);
    });
});
