# Core Utilities Instructions

## Purpose
- Shared, dependency-light utilities: event-bus, registry, rng, ids, math, schema.

## Rules
- Keep this layer free of imports from features, render, UI, or content; core is imported by everyone and must not import back.
- Keep utilities generic; feature-specific logic belongs in the owning feature folder.

## Gotchas
- Event-bus payload shapes are implicit APIs; changing what a publisher emits requires migrating all listeners at once.
- Registry and id-factory behavior feeds validators and persistence; changing id formats is a compatibility change.
- RNG determinism matters for seeded runs and seeded visuals; do not swap algorithms or consume extra random draws in existing paths.
