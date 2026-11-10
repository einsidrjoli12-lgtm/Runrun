# Putting Bobber & Brine on itch.io

Everything you need is in this folder:

| File | What it's for |
|---|---|
| `bobber-and-brine-itch.zip` | The game. Upload this. |
| `cover.png` | Cover image (1260 × 1000, the 630 × 500 shape itch.io asks for, at double resolution) |
| `screenshots/` | Seven screenshots for the page |
| `banner-1920x600.png` | Banner image for the top of the page |
| `background-1920x1400.png` | Page background image |
| `embed-bg-1280x800.png` | Embed BG: the picture inside the game window before the player presses Run game |

## Upload steps

1. Sign in at itch.io and choose **Upload new project** (from the arrow next to your name, or itch.io/game/new).
2. Fill in the basics:
   - **Title:** Bobber & Brine
   - **Short description or tagline:** Cast, upgrade and fish your way from a farm pond to the Midnight Trench.
   - **Classification:** Games
   - **Kind of project:** HTML
   - **Release status:** Released (or In development, if you plan to keep adding things)
   - **Pricing:** No payments, or Donate / Pay what you want
3. **Uploads:** upload `bobber-and-brine-itch.zip`, then tick **This file will be played in the browser**.
4. **Embed options:**
   - **Viewport dimensions:** 1280 × 800
   - Tick **Mobile friendly**, orientation **Portrait**
   - Tick **Fullscreen button**
   - Leave **Automatically start on page load** off, so the "Run game" button gives the browser the click it needs to allow sound
   - Leave **Enable scrollbars** off (the game never scrolls the page)
   - **SharedArrayBuffer support:** not needed
5. **Description:** paste the text below.
6. **Genre:** Simulation. **Tags:** idle, incremental, fishing, clicker, casual, relaxing, singleplayer, 2D.
7. **Cover image:** upload `cover.png`. **Screenshots:** upload the files in `screenshots/` in order.
8. Set **Visibility & access** to **Draft** and save. Open the page, play a few casts to check it, then switch to **Public**.

## Page theme (Edit theme, on your game page)

| Setting | Value |
|---|---|
| **Banner** | Upload `banner-1920x600.png`. itch.io scales it down to the page width, and the extra resolution keeps it sharp on high-resolution screens. |
| **Background** | Upload `background-1920x1400.png`. Set it to **not repeat**, aligned **top center**. The bottom fades into the BG color, so long pages have no seam. |
| **BG color** | `#04121b` |
| **BG2 color** (the page column) | `#0d2a3a` |
| **Text** | `#eaf7f5` |
| **Link** | `#ffcf5a` |
| **Button** | `#ff6b3d` |
| **Embed BG** | Upload `embed-bg-1280x800.png`. It's the same size as the 1280 × 800 game window, with the center left clear for the Run game button. |


Font: pick **Nunito** or **Lato** if they're offered. They're close to the game's body text.

## Description (paste this)

**Bobber & Brine** is an idle fishing game. Start with a bamboo rod on a muddy farm pond and work your way down to the Midnight Trench, ten kilometers under a moonless sky.

**How to play**
- Tap the water or press **Space** to cast.
- Watch the bobber. When it dips and a **!** appears, tap fast for a **perfect catch**. Tap too early, and the fish swims off. Watch out for fake nibbles.
- Spend your money on better tackle, hire deckhands who fish while you're away, and unlock new waters with bigger fish.

**Features**
- Six waters, each with its own scene: a farm pond, a willow river, a glacier lake under the northern lights, a rocky coast at sunset, the open ocean, and the glowing Midnight Trench.
- 36 species to log, and six legendary monsters. When one bites, tap as fast as you can before it snaps your line.
- A rod that changes from bamboo to fiberglass, carbon and gold as you level it.
- Abilities (Chum Bucket, Sonar Ping, Golden Hour, Feeding Frenzy) and charms like the Treasure Hook and Golden Scales.
- Storms that roll in with rain and lightning and bring rare fish to the surface.
- 52 goals, logbook bonuses, and Fame to earn by retiring and starting a new career.
- Music and sound made live in your browser, with volume controls.

**Controls:** Space or tap to cast and reel. Keys 1–4 fire abilities. Everything else is on screen.

Your progress saves automatically in your browser. Use **Settings → Backup** to copy a backup code and move your save to another device.

## Good to know

- **Updating the game later:** upload a new zip and delete the old one. Players keep their progress, because saves are tied to your game's page.
- **Developer code:** the code `MOBYDICK` works in this build too. It's stored only as a hash, so players can't read it in the files, but anyone you tell can use it on the public page. Ask Claude for a build without developer mode if you'd rather not ship it.
- **Fonts** load from Google Fonts. Offline, the game still works but uses fallback fonts.
