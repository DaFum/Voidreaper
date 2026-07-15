import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createRepairService } from '../../../../src/features/ship-assembly/damage/repair-service.js';
import { REPAIR_ACTIONS } from '../../../../src/content/ship-assembly/repair-actions.js';

describe('createRepairService', () => {
    let mockAssemblyService;
    let mockEventBus;
    let mockRemountDetached;
    let mockResources;
    let repairService;

    beforeEach(() => {
        let currentNode = null;

        mockAssemblyService = {
            requireNode: (nodeId) => {
                if (nodeId === 'invalid-node') throw new Error('Invalid node');
                if (!currentNode) {
                    currentNode = {
                        id: nodeId,
                        armorIntegrity: 10,
                        maxArmorIntegrity: 100,
                        coreIntegrity: 10,
                        maxCoreIntegrity: 100,
                        structuralPenalties: ['penalty1'],
                        supportMode: 'active',
                        damageState: 'core-disrupted'
                    };
                }
                return currentNode;
            },
            getSnapshot: () => ({
                portsById: {
                    'valid-port': { id: 'valid-port' }
                }
            }),
            replacePort: (payload) => ({ replaced: true, payload }),
            transaction: (cb) => cb(),
            publishDamageChange: () => {}
        };

        mockEventBus = {
            events: [],
            emit(event, payload) {
                this.events.push({ event, payload });
            }
        };

        mockRemountDetached = (payload) => ({ remounted: true, payload });

        mockResources = { scrap: 100, flux: 100 };

        repairService = createRepairService({
            assemblyService: mockAssemblyService,
            resources: mockResources,
            eventBus: mockEventBus,
            remountDetached: mockRemountDetached
        });
    });

    describe('preview', () => {
        it('returns correct preview for valid node', () => {
            const result = repairService.preview(REPAIR_ACTIONS.PATCH_ARMOR, 'valid-node');
            assert.equal(result.action, REPAIR_ACTIONS.PATCH_ARMOR);
            assert.equal(result.allowed, true);
            assert.equal(result.node.id, 'valid-node');
        });

        it('returns allowed=false for invalid node unless action is remount or replace', () => {
            const result = repairService.preview(REPAIR_ACTIONS.PATCH_ARMOR, 'invalid-node');
            assert.equal(result.allowed, false);
            assert.equal(result.node, null);
        });

        it('returns allowed=true for REMOUNT_DETACHED without valid node', () => {
            const result = repairService.preview(REPAIR_ACTIONS.REMOUNT_DETACHED, 'invalid-node');
            assert.equal(result.allowed, true);
        });

        it('returns allowed=true for REPLACE_PORT without valid node', () => {
            const result = repairService.preview(REPAIR_ACTIONS.REPLACE_PORT, null);
            assert.equal(result.allowed, true);
        });
    });

    describe('apply', () => {
        it('throws if insufficient resources', () => {
            mockResources.scrap = 0;
            assert.throws(() => repairService.apply(REPAIR_ACTIONS.PATCH_ARMOR, 'valid-node'), /Nicht genügend Reparaturressourcen/);
        });

        it('throws if in combat without capability', () => {
            assert.throws(() => repairService.apply(REPAIR_ACTIONS.PATCH_ARMOR, 'valid-node', { inCombat: true }), /Diese Reparatur benötigt ein aktives Reparaturmodul/);
        });

        it('handles REPLACE_PORT successfully', () => {
            const result = repairService.apply(REPAIR_ACTIONS.REPLACE_PORT, 'valid-port', { payload: { profile: 'test-profile' } });
            assert.equal(result.replaced, true);
            assert.equal(mockResources.scrap, 80); // 100 - 20 (REPLACE_PORT cost)
            assert.equal(mockEventBus.events.length, 1);
            assert.equal(mockEventBus.events[0].event, 'assembly:port-replaced');
            assert.equal(mockEventBus.events[0].payload.portId, 'valid-port');
        });

        it('throws on REPLACE_PORT with unknown port', () => {
            assert.throws(() => repairService.apply(REPAIR_ACTIONS.REPLACE_PORT, 'invalid-port'), /Unknown assembly port: invalid-port/);
        });

        it('handles REMOUNT_DETACHED successfully', () => {
            const result = repairService.apply(REPAIR_ACTIONS.REMOUNT_DETACHED, 'detached-node');
            assert.equal(result.remounted, true);
            assert.equal(mockResources.scrap, 84); // 100 - 16 (REMOUNT_DETACHED cost)
            assert.equal(mockEventBus.events.length, 1);
            assert.equal(mockEventBus.events[0].event, 'assembly:module-remounted');
            assert.equal(mockEventBus.events[0].payload.item, 'detached-node');
        });

        it('throws on REMOUNT_DETACHED if remount function is unavailable', () => {
            const serviceNoRemount = createRepairService({
                assemblyService: mockAssemblyService,
                resources: mockResources,
                eventBus: mockEventBus,
                remountDetached: null
            });
            assert.throws(() => serviceNoRemount.apply(REPAIR_ACTIONS.REMOUNT_DETACHED, 'node-id'), /Detached module remount is unavailable/);
        });

        it('handles PATCH_ARMOR successfully', () => {
            const result = repairService.apply(REPAIR_ACTIONS.PATCH_ARMOR, 'valid-node');
            assert.equal(result.armorIntegrity, 50); // 10 + (100 * 0.4)
            assert.equal(mockResources.scrap, 92); // 100 - 8 (PATCH_ARMOR cost)
            assert.equal(mockEventBus.events.length, 1);
            assert.equal(mockEventBus.events[0].event, 'assembly:module-repaired');
            assert.equal(mockEventBus.events[0].payload.nodeId, 'valid-node');
            assert.equal(mockEventBus.events[0].payload.action, REPAIR_ACTIONS.PATCH_ARMOR);
        });

        it('handles RESTART_CORE successfully', () => {
            const result = repairService.apply(REPAIR_ACTIONS.RESTART_CORE, 'valid-node');
            assert.equal(result.coreIntegrity, 50); // Max(10, 100 * 0.5)
            assert.equal(mockResources.flux, 99); // 100 - 1 (RESTART_CORE cost)
            assert.equal(mockEventBus.events.length, 1);
        });

        it('handles FULL_REPAIR successfully', () => {
            const result = repairService.apply(REPAIR_ACTIONS.FULL_REPAIR, 'valid-node');
            assert.equal(result.armorIntegrity, 100);
            assert.equal(result.coreIntegrity, 100);
            assert.equal(result.damageState, 'intact');
            assert.equal(mockResources.scrap, 76); // 100 - 24 (FULL_REPAIR cost)
            assert.equal(mockResources.flux, 99); // 100 - 1 (FULL_REPAIR cost)
        });

        it('handles STABILIZE_BRACE successfully', () => {
            const result = repairService.apply(REPAIR_ACTIONS.STABILIZE_BRACE, 'valid-node');
            assert.deepEqual(result.structuralPenalties, []);
            assert.equal(result.supportMode, null);
            assert.equal(mockResources.scrap, 88); // 100 - 12 (STABILIZE_BRACE cost)
        });

        it('allows combat apply with capability', () => {
            const result = repairService.apply(REPAIR_ACTIONS.PATCH_ARMOR, 'valid-node', { inCombat: true, capability: true });
            assert.equal(result.armorIntegrity, 50);
        });
    });
});
