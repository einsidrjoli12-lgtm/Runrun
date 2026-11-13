# Bobber & Brine roadmap

## Ready to ship

### Travel walk (approved)
When you unlock a water or travel to one, the angler stands up, picks up his bucket, walks off the dock, the new water fades in, and he walks back in and sits down. The pet follows him. Unlock banner and fanfare play when he arrives. About 4.5 s, fishing paused while walking.

- Test build: `experiments/travel-walk/index.html` (playable test link: https://claude.ai/artifact/Ba8CRgbFs5d54zH2v7wJsN)
- To ship: port the changes into `index.html` (walk state + `startWalk`/`stepWalk`, `drawWalker`, the fade in `draw()`, the `unlockOrTravel` change, the `doAction`/`stepCast` guards), drop the `-test` version suffix and the test page title, add a What's new line.

## v1.3 "Winter Update" (planned, decisions pending)

- **Winter event** (around Dec 15 to Jan 6, by device date): snow on every water, string lights on boats, 3 event fish in their own Logbook page (Frostfin, Glimmer Eel, The Yule Pike).
- **Winter skins as challenge rewards** (not sold for pearls):
  1. Catch your first Frostfin → String Lights lantern
  2. Catch 50 winter fish → Winter Scarf & Beanie
  3. Catch 5 Glimmer Eels → Ornament Bobber
  4. Do daily quests on 5 different event days → Santa Hat
  5. Land The Yule Pike → Penguin pet
  6. Finish all 5 → Icicle Rod
- **Daily quests and streak:** 3 quests a day scaled to your water (+10/+15/+25 pearls), one free reroll, a 7-day streak with a bigger day-7 reward.
- **Share card:** a Share button after legendary/golden/epic catches, records and monster wins that makes an image of the catch.
- **Phone vibration** on bites, perfect catches and monster fights (Android only; iPhone browsers don't allow it), with a Settings toggle.
- **Travel walk** (above).

Open questions: exact event dates; whether missed winter skins return next year; whether missing a day resets the streak or allows one free miss per week; event fish names; a holiday code (for example an extra Reindeer Antlers skin) or none.

## Later

- Dock aquarium for your rarest catches
- Installable app (PWA) and a Google Play version (needs Android device verification first)
- Leaderboards (needs a small server)
