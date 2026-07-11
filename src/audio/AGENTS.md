# Audio Instructions

## Purpose
- Procedural audio synthesis: [audio-system.js](audio-system.js) plays short oscillator-based cues for the named events in [sound-events.js](sound-events.js).

## Rules
- Keep audio reactive to named sound events; do not embed gameplay decisions here.
- Add new cues by extending `SOUND_EVENTS` and `SOUND_CONFIG` together.

## Gotchas
- The AudioContext is created lazily in `unlock()` (requires a user gesture); `play()` silently no-ops until then, so a missing sound is often an unlock-order issue, not a config bug.
- The legacy runtime carries its own procedural audio (`AudioSys` in `src/legacy/legacy-runtime.js`); check which path is live for a given cue before changing either.
- Sounds on hot events (shots, hits) run per occurrence; keep durations short and avoid adding allocations per call.
