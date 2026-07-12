import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { overlapsAny } from '../../../../src/features/ship-assembly/placement/collision-bounds.js';

describe('collision-bounds', () => {
    describe('overlapsAny', () => {
        it('should return false if occupied is empty', () => {
            const candidate = { ownerId: 'c1', minX: 0, minY: 0, maxX: 10, maxY: 10 };
            assert.equal(overlapsAny(candidate, []), false);
        });

        it('should return false if disjoint', () => {
            const candidate = { ownerId: 'c1', minX: 0, minY: 0, maxX: 10, maxY: 10 };
            const occupied = [
                { ownerId: 'o1', minX: 20, minY: 20, maxX: 30, maxY: 30 }
            ];
            assert.equal(overlapsAny(candidate, occupied), false);
        });

        it('should return true if fully overlapping and different owner', () => {
            const candidate = { ownerId: 'c1', minX: 0, minY: 0, maxX: 10, maxY: 10 };
            const occupied = [
                { ownerId: 'o1', minX: 2, minY: 2, maxX: 8, maxY: 8 }
            ];
            assert.equal(overlapsAny(candidate, occupied), true);
        });

        it('should return true if partially overlapping and different owner', () => {
            const candidate = { ownerId: 'c1', minX: 0, minY: 0, maxX: 10, maxY: 10 };
            const occupied = [
                { ownerId: 'o1', minX: 5, minY: 5, maxX: 15, maxY: 15 }
            ];
            assert.equal(overlapsAny(candidate, occupied), true);
        });

        it('should return false if overlapping but same owner', () => {
            const candidate = { ownerId: 'c1', minX: 0, minY: 0, maxX: 10, maxY: 10 };
            const occupied = [
                { ownerId: 'c1', minX: 5, minY: 5, maxX: 15, maxY: 15 }
            ];
            assert.equal(overlapsAny(candidate, occupied), false);
        });

        it('should use default margin of 4', () => {
            const candidate = { ownerId: 'c1', minX: 0, minY: 0, maxX: 10, maxY: 10 };

            // X-axis touching with margin 4:
            // candidate.maxX = 10, bounds.minX = 15. Distance is 5, > 4. No overlap.
            assert.equal(overlapsAny(candidate, [{ ownerId: 'o1', minX: 15, minY: 0, maxX: 20, maxY: 10 }]), false);

            // X-axis touching with margin 4:
            // candidate.maxX = 10, bounds.minX = 14. Distance is 4, <= 4. Overlap.
            assert.equal(overlapsAny(candidate, [{ ownerId: 'o1', minX: 14, minY: 0, maxX: 20, maxY: 10 }]), true);

            // X-axis left side margin
            // candidate.minX = 0, bounds.maxX = -5. Distance is 5. No overlap.
            assert.equal(overlapsAny(candidate, [{ ownerId: 'o1', minX: -10, minY: 0, maxX: -5, maxY: 10 }]), false);

            // X-axis left side margin
            // candidate.minX = 0, bounds.maxX = -4. Distance is 4. Overlap.
            assert.equal(overlapsAny(candidate, [{ ownerId: 'o1', minX: -10, minY: 0, maxX: -4, maxY: 10 }]), true);

            // Y-axis bottom margin
            // candidate.maxY = 10, bounds.minY = 15. No overlap.
            assert.equal(overlapsAny(candidate, [{ ownerId: 'o1', minX: 0, minY: 15, maxX: 10, maxY: 20 }]), false);

            // Y-axis bottom margin
            // candidate.maxY = 10, bounds.minY = 14. Overlap.
            assert.equal(overlapsAny(candidate, [{ ownerId: 'o1', minX: 0, minY: 14, maxX: 10, maxY: 20 }]), true);

            // Y-axis top margin
            // candidate.minY = 0, bounds.maxY = -5. No overlap.
            assert.equal(overlapsAny(candidate, [{ ownerId: 'o1', minX: 0, minY: -10, maxX: 10, maxY: -5 }]), false);

            // Y-axis top margin
            // candidate.minY = 0, bounds.maxY = -4. Overlap.
            assert.equal(overlapsAny(candidate, [{ ownerId: 'o1', minX: 0, minY: -10, maxX: 10, maxY: -4 }]), true);
        });

        it('should use custom margin if provided', () => {
            const candidate = { ownerId: 'c1', minX: 0, minY: 0, maxX: 10, maxY: 10 };

            // distance is 5
            const occupied = [
                { ownerId: 'o1', minX: 15, minY: 0, maxX: 20, maxY: 10 }
            ];

            // Default margin 4 -> distance 5 > 4 -> no overlap
            assert.equal(overlapsAny(candidate, occupied), false);

            // Margin 5 -> distance 5 <= 5 -> overlap
            assert.equal(overlapsAny(candidate, occupied, 5), true);

            // Margin 6 -> distance 5 <= 6 -> overlap
            assert.equal(overlapsAny(candidate, occupied, 6), true);

            // Distance is 2
            const occupied2 = [
                { ownerId: 'o1', minX: 12, minY: 0, maxX: 20, maxY: 10 }
            ];

            // Custom margin 1 -> distance 2 > 1 -> no overlap
            assert.equal(overlapsAny(candidate, occupied2, 1), false);
        });
    });
});
