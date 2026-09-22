# Farm world redesign

The farm remains the first-screen centerpiece. Replace the sparse sprite layout with a coherent original illustrated world, while preserving direct access to blog content.

## Implementation and cleanup plan

- Keep article rendering, search, pagination, project cards and all existing destination routes.
- Replace only the old homepage village mount and its loaded renderer/styles. Retain historical assets and regression coverage; no broad theme cleanup.
- Use two original matching day/night maps, compressed to WebP without resizing. Buildings are real links, independent of animation or collection state.
- Add three optional discoveries with a bounded, versioned local collection. No rewards gate content. Never autoplay sound.
- Provide a readable destination list, keyboard-operable controls, live feedback, reduced-motion support and offscreen suspension. Mobile starts with a complete map, with optional zoom and native panning.
- Validate state restoration, duplicate rewards, unsupported storage, bounds, keyboard interaction, responsive layout, navigation, day/night, weather, motion and generated asset routes before deploying.

## Assets

Day and blue-hour map artwork generated for this site on 2026-09-22. Main artwork: 1536 × 1024. No third-party game screenshots. Legacy animal sprites retain the existing Farm RPG Asset Pack attribution. Source generation originals remain in the Codex generated-images directory; production assets are under source/img/farm-world.


## Verification (2026-09-22)

- Hexo generation succeeded with the existing dependency set; no dependencies added.
- 18 Node regression checks passed. The existing search byte comparison was run with the local source normalized to LF, matching the generator; checkout line endings were restored afterwards. Search logic was unchanged.
- Browser review: desktop, 768px tablet, 390px and 320px mobile; no horizontal document overflow or missing images.
- Verified: three discoveries, duplicate-safe progress, persistence after reload, completed notebook, Escape dismissal, building navigation, zoom and pan bounds, day/night map loading, rain, pause/resume, opt-in sound toggle.
- Emulated prefers-reduced-motion: animations disabled and motion control explains the system setting; emulation cleared after verification.
- Production maps total approximately 1.8 MB; the night map loads only when requested by the scene or site theme.
- Not verified on a physical Safari/iOS device.

Changed areas: `_config.fluid.yml`, `source/js/home-showcase.js`, new `source/js/farm-world*.js`, `source/css/farm-world.css`, `source/img/farm-world/`, three journal icons and their generator, focused regression checks, and the Pages verification command.
