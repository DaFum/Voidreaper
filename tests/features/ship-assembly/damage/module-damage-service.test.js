import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveDamageState } from '../../../../src/features/ship-assembly/damage/module-damage-service.js';

describe('resolveDamageState', () => {
    it('returns "detached" when damageState is already detached', () => {
        const node = { damageState: 'detached', coreIntegrity: 100, maxCoreIntegrity: 100, armorIntegrity: 100 };
        assert.equal(resolveDamageState(node), 'detached');
    });

    it('returns "detached" when coreIntegrity is <= 0', () => {
        const node = { damageState: 'intact', coreIntegrity: 0, maxCoreIntegrity: 100, armorIntegrity: 100 };
        assert.equal(resolveDamageState(node), 'detached');

        const node2 = { damageState: 'intact', coreIntegrity: -10, maxCoreIntegrity: 100, armorIntegrity: 100 };
        assert.equal(resolveDamageState(node2), 'detached');
    });

    it('returns "core-disrupted" when coreIntegrity is < 45% of maxCoreIntegrity', () => {
        const node = { damageState: 'intact', coreIntegrity: 44, maxCoreIntegrity: 100, armorIntegrity: 100 };
        assert.equal(resolveDamageState(node), 'core-disrupted');

        const node2 = { damageState: 'intact', coreIntegrity: 40, maxCoreIntegrity: 100, armorIntegrity: 100 };
        assert.equal(resolveDamageState(node2), 'core-disrupted');
    });

    it('returns "armor-broken" when armorIntegrity is <= 0 and core is >= 45%', () => {
        const node = { damageState: 'intact', coreIntegrity: 100, maxCoreIntegrity: 100, armorIntegrity: 0 };
        assert.equal(resolveDamageState(node), 'armor-broken');

        const node2 = { damageState: 'intact', coreIntegrity: 45, maxCoreIntegrity: 100, armorIntegrity: -5 };
        assert.equal(resolveDamageState(node2), 'armor-broken');
    });

    it('returns "intact" when armor and core are above thresholds', () => {
        const node = { damageState: 'intact', coreIntegrity: 100, maxCoreIntegrity: 100, armorIntegrity: 100 };
        assert.equal(resolveDamageState(node), 'intact');

        const node2 = { damageState: 'intact', coreIntegrity: 45, maxCoreIntegrity: 100, armorIntegrity: 1 };
        assert.equal(resolveDamageState(node2), 'intact');
    });
});
