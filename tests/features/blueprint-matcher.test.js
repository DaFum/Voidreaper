import test from "node:test";
import assert from "node:assert/strict";
import { matchBlueprintNode, BLUEPRINT_MATCH } from "../../src/features/ship-assembly/blueprints/blueprint-matcher.js";

test("returns BLOCKED if occupied is true", () => {
  const target = {};
  const moduleProfile = {};
  assert.equal(matchBlueprintNode(target, moduleProfile, { occupied: true }), BLUEPRINT_MATCH.BLOCKED);
});

test("returns INCOMPATIBLE instead of throwing when target or moduleProfile is missing", () => {
  assert.equal(matchBlueprintNode(null, {}), BLUEPRINT_MATCH.INCOMPATIBLE);
  assert.equal(matchBlueprintNode({}, null), BLUEPRINT_MATCH.INCOMPATIBLE);
  assert.equal(matchBlueprintNode(undefined, undefined), BLUEPRINT_MATCH.INCOMPATIBLE);
});

test("returns EXACT if preferredModuleDefinitionId matches moduleProfile.definitionId", () => {
  const target = { preferredModuleDefinitionId: "module-a" };
  const moduleProfile = { definitionId: "module-a" };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.EXACT);
});

test("returns COMPATIBLE if an allowedRole matches moduleProfile.visualProfileId", () => {
  const target = { allowedRoles: ["role-a", "role-b"] };
  const moduleProfile = { visualProfileId: "role-b" };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.COMPATIBLE);
});

test("returns COMPATIBLE if an allowedRole matches moduleProfile.rendererId", () => {
  const target = { allowedRoles: ["role-c"] };
  const moduleProfile = { rendererId: "role-c" };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.COMPATIBLE);
});

test("returns COMPATIBLE if an allowedRole matches an item in moduleProfile.roles", () => {
  const target = { allowedRoles: ["role-d"] };
  const moduleProfile = { roles: ["role-d", "role-e"] };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.COMPATIBLE);
});

test("returns COMPATIBLE if an allowedTag matches an item in moduleProfile.tags", () => {
  const target = { allowedTags: ["tag-1"] };
  const moduleProfile = { tags: ["tag-0", "tag-1"] };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.COMPATIBLE);
});

test("returns STRUCTURAL if sizeClass matches and target has no mountType", () => {
  const target = { sizeClass: "medium" };
  const moduleProfile = { sizeClass: "medium" };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.STRUCTURAL);
});

test("returns STRUCTURAL if sizeClass matches and moduleProfile.mountTypes includes target.mountType", () => {
  const target = { sizeClass: "small", mountType: "turret" };
  const moduleProfile = { sizeClass: "small", mountTypes: ["turret", "fixed"] };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.STRUCTURAL);
});

test("returns INCOMPATIBLE if sizeClass matches but mountType is missing from moduleProfile.mountTypes", () => {
  const target = { sizeClass: "small", mountType: "gimbal" };
  const moduleProfile = { sizeClass: "small", mountTypes: ["turret"] };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.INCOMPATIBLE);
});

test("returns INCOMPATIBLE if sizeClass mismatches", () => {
  const target = { sizeClass: "small" };
  const moduleProfile = { sizeClass: "large" };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.INCOMPATIBLE);
});

test("returns INCOMPATIBLE if fields are missing and sizeClass is undefined on both", () => {
  const target = {};
  const moduleProfile = {};
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.INCOMPATIBLE);
});

test("returns INCOMPATIBLE if target sizeClass is undefined but moduleProfile has one", () => {
  const target = {};
  const moduleProfile = { sizeClass: "small" };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.INCOMPATIBLE);
});

test("returns COMPATIBLE on role match even when sizeClass mismatches (role/tag compatibility outranks structural fit)", () => {
  const target = { allowedRoles: ["role-a"], sizeClass: "small" };
  const moduleProfile = { visualProfileId: "role-a", sizeClass: "large" };
  assert.equal(matchBlueprintNode(target, moduleProfile), BLUEPRINT_MATCH.COMPATIBLE);
});
