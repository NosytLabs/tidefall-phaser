# Fishing System Spec

## Fish Shadows
- 3 sizes: small (16x16), medium (16x16), big (16x16)
- Use actual shadow animation spritesheets
- Spawn in water zone only
- Swim animation plays continuously

## Minigame
- Progress bar UI using status bar sprites
- Green zone (success) / red zone (fail)
- Spacebar to fight
- Visual feedback: splash particles on success/fail

## Catch Flow
1. Player near water → cast (spacebar)
2. Bobber appears at cast point with floating animation
3. Wait random 2-8s
4. Bite indicator (!) + bobber bite animation
5. Spacebar within window → hook
6. Minigame: keep marker in green zone
7. Success → catch panel with fish sprite + stats
8. Fail → fish escapes with splash
