import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    hasRequiredCoreExposure,
    createCoreExposureService
} from '../../../../src/features/ship-assembly/placement/core-exposure-service.js';

describe('core-exposure-service', () => {
    describe('hasRequiredCoreExposure', () => {
        it('should return true when there are no occupied bounds', () => {
            const coreBounds = { center: { x: 0, y: 0 } };
            assert.equal(hasRequiredCoreExposure({ coreBounds, occupiedBounds: [] }), true);
        });

        it('should return false when all directions are blocked', () => {
            const coreBounds = { center: { x: 0, y: 0 } };
            const occupiedBounds = [
                { minX: -50, maxX: 50, minY: -50, maxY: -20 },
                { minX: -50, maxX: 50, minY: 20, maxY: 50 },
                { minX: -50, maxX: -20, minY: -50, maxY: 50 },
                { minX: 20, maxX: 50, minY: -50, maxY: 50 },
            ];
            assert.equal(hasRequiredCoreExposure({ coreBounds, occupiedBounds }), false);
        });

        it('should return true when only one direction is blocked', () => {
            const coreBounds = { center: { x: 0, y: 0 } };
            const occupiedBounds = [
                { minX: 20, maxX: 50, minY: -10, maxY: 10 }
            ];
            assert.equal(hasRequiredCoreExposure({ coreBounds, occupiedBounds }), true);
        });

        it('should return false when open directions are less than PI/2 apart', () => {
            const coreBounds = { center: { x: 0, y: 0 } };
            const blockedExcept0AndPI4 = [
                { minX: -50, maxX: 50, minY: -50, maxY: -20 },
                { minX: -50, maxX: -20, minY: -20, maxY: 50 },
                { minX: -10, maxX: 10, minY: 20, maxY: 50 },
            ];
            assert.equal(hasRequiredCoreExposure({ coreBounds, occupiedBounds: blockedExcept0AndPI4 }), false);
        });

        it('should ignore intersections closer than distance 12', () => {
            const coreBounds = { center: { x: 0, y: 0 } };
            const occupiedBounds = [
                { minX: -10, maxX: 10, minY: -10, maxY: 10 }
            ];
            assert.equal(hasRequiredCoreExposure({ coreBounds, occupiedBounds }), true);
        });

        it('should ignore intersections farther than distance 220', () => {
            const coreBounds = { center: { x: 0, y: 0 } };
            const occupiedBounds = [
                { minX: 250, maxX: 300, minY: -10, maxY: 10 }
            ];
            assert.equal(hasRequiredCoreExposure({ coreBounds, occupiedBounds }), true);
        });

        it('should correctly handle missing center in coreBounds', () => {
             assert.equal(hasRequiredCoreExposure({ coreBounds: {}, occupiedBounds: [] }), true);
        });
    });

    describe('createCoreExposureService', () => {
        const service = createCoreExposureService();

        describe('accepts', () => {
            it('should return true when the candidate does not block the core', () => {
                const coreGeometry = { bounds: { minX: -10, maxX: 10, minY: -10, maxY: 10 } };
                const candidate = { minX: 250, maxX: 300, minY: -10, maxY: 10 };
                assert.equal(service.accepts({ coreGeometry, occupiedBounds: [], candidate }), true);
            });

            it('should return false when the candidate blocks the core', () => {
                const coreGeometry = { bounds: { minX: -10, maxX: 10, minY: -10, maxY: 10 } };
                const candidate1 = { minX: -50, maxX: 50, minY: -50, maxY: -20 };
                const candidate2 = { minX: -50, maxX: 50, minY: 20, maxY: 50 };
                const candidate3 = { minX: -50, maxX: -20, minY: -50, maxY: 50 };
                const candidate4 = { minX: 20, maxX: 50, minY: -50, maxY: 50 };

                const occupiedBounds = [candidate1, candidate2, candidate3];
                assert.equal(service.accepts({ coreGeometry, occupiedBounds, candidate: candidate4 }), false);
            });

            it('should filter out the coreOwner from occupied bounds', () => {
                const coreGeometry = { bounds: { minX: -10, maxX: 10, minY: -10, maxY: 10 } };
                const coreOwner = { minX: -10, maxX: 10, minY: -10, maxY: 10, id: 'core' };
                const candidate = { minX: 250, maxX: 300, minY: -10, maxY: 10 };
                const occupiedBounds = [coreOwner];

                assert.equal(service.accepts({ coreGeometry, occupiedBounds, candidate }), true);
            });

            it('should handle undefined occupiedBounds', () => {
                const coreGeometry = { bounds: { minX: -10, maxX: 10, minY: -10, maxY: 10 } };
                const candidate = { minX: 20, maxX: 50, minY: -10, maxY: 10 };
                assert.equal(service.accepts({ coreGeometry, candidate }), true);
            });

            it('should handle undefined coreGeometry', () => {
                const candidate = { minX: 20, maxX: 50, minY: -10, maxY: 10 };
                assert.equal(service.accepts({ candidate }), true);
            });
        });

        describe('structuralAbsorption', () => {
            it('should calculate structural absorption correctly', () => {
                // Testing with approximate equality due to floating point rounding (1 - 0.18 = 0.8200000000000001)
                assert.ok(Math.abs(service.structuralAbsorption(0) - 1.00) < 1e-6);
                assert.ok(Math.abs(service.structuralAbsorption(1) - 0.82) < 1e-6);
                assert.ok(Math.abs(service.structuralAbsorption(2) - 0.64) < 1e-6);
                assert.ok(Math.abs(service.structuralAbsorption(3) - 0.46) < 1e-6);
                assert.ok(Math.abs(service.structuralAbsorption(4) - 0.28) < 1e-6);
                assert.equal(service.structuralAbsorption(5), 0.25);
                assert.equal(service.structuralAbsorption(10), 0.25);
            });
        });
    });
});
