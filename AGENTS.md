# Project Operations — Tidefall Rebuild

## Build Commands
```bash
npm run dev          # Dev server on port 3000
npm run build        # Production build (must succeed)
npm run test         # Unit tests
npm run test:e2e:ci  # Playwright E2E (must pass)
```

## Validation Gates (backpressure)
- Build succeeds: `npm run build` returns 0
- Tests pass: `npm run test:e2e:ci` returns 0
- No broken asset references (check console)

## Operational Notes
- One file per iteration. Make change, validate, exit.
- Update PROGRESS.md after EVERY iteration.
- Use all Smallburg assets in public/assets/sprites/.
- Pixel art mode ON (pixelArt: true, roundPixels: true, antialias: false).
- All UI panels must use sprite-based borders not rectangles.
- Maintain 60 FPS target.

## Asset layout
- Runtime assets live in `public/assets/sprites/` (curated Smallburg subset).
- Local vendor packs may exist under `game/` (~46MB). That directory is gitignored and must not be committed; BootScene loads only from `public/assets/sprites/`.

## Known gaps (do not invent content)
- DiveScene / MineScene / FarmScene are registered in main.js but nothing calls scene.start/launch into them yet — FishingScene is the only live loop.
- No audio files under public/assets/sounds or public/assets/music. AudioManager uses WebAudio placeholders; preloadSounds is a no-op until real assets land.
