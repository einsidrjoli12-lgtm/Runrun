# Devlog #1: Bobber & Brine is out!

*Suggested post type: **Release**. Suggested cover: `screenshots/4-monster-fight.png`.*

---

**Bobber & Brine** is live, and you can play it right here in your browser! It's an idle fishing game: you start with a bamboo rod on a muddy farm pond and fish your way down to the Midnight Trench, ten kilometers under a moonless sky.

This first devlog covers how the game came together, a few things I changed along the way, and the small details I'm most proud of.

## Where it started

The idea was simple: an idle game where the core action still feels good when you do it yourself. Lots of idle games turn the "click" into a chore you want to automate as fast as possible. I wanted casting a line to stay fun for the whole game, even once you have a crew of a hundred deckhands fishing for you.

So the first version was just a pond, a bobber and one rule: **wait for the dip, then tap.** Hit it right as the **!** appears and you get a perfect catch. Everything else was built around that moment.

## Slowing everything down (twice)

My first economy was way too generous. You could blow through every water in about twenty minutes, and there was nothing left to want. I slowed progression down once, then played it again and slowed it down a lot more.

The goal was for each new water to feel earned. Unlocking a new spot now resets your cash and crew, and each water raises your crew limit (5, 10, 20, 35, 60, then 100 deckhands). Moving on is a real decision instead of something that happens on its own.

## Making the tap matter

Two changes made the cast feel much better:

- **Reeling too early has a cost.** If you tap before the bite, you spook the fish and the line comes back empty. Fake nibbles make the bobber twitch to tempt you, so you have to actually watch it.
- **Your rod decides what bites.** A basic rod mostly catches common fish. Every Rod level makes rarer fish show up more often, so upgrades change *what* you catch, not just how much it's worth.

## Legends

This is my favorite part. About 1 bite in 1,000 is a **legendary monster**: Old Mossback, The Willow King, The Glacier Matriarch, The Lighthouse Grouper, Grandfather Marlin and The Leviathan, one for each water.

When one bites, the music switches to a fast fight theme and you have 10 seconds to tap like crazy and fill the tension meter before the line snaps. Landing one is worth 40× the best fish at that water.

Pure 1-in-1,000 luck felt bad in testing (some people would never see one), so the odds climb the longer you go without a legend, and your first one is guaranteed within your first 120 bites.

## Storms, specials and charms

Once the basic loop worked, I added things that break up the rhythm:

- **Storms** roll in every few minutes with rain, lightning and better odds on rare fish.
- **Four abilities** you fire yourself: Chum Bucket, Sonar Ping, Golden Hour and Feeding Frenzy (keys 1–4).
- **Seven permanent charms**, like the Treasure Hook, Golden Scales and the Monster Magnet.
- **52 goals** that each pay cash and add +1.5% income forever, plus a +10% bonus for logging every species at a water.
- **Retiring** after $1B earns Fame stars for a new career, if you want to go again.

## Music made in the browser

There are no audio files in the game. All the music and sound effects are synthesized live in your browser, with a different tune for each water: a gentle C major on the Farm Pond, a slow, dark D minor in the Midnight Trench. The melodies are improvised as you play, so no two sessions sound exactly the same.

I also rendered one take of each track as a seven-track soundtrack, including *Legend on the Line*, the monster fight theme.

## Works on phones

The game runs in portrait on phones, with a full-screen shop toggle and a labeled ability bar so everything fits on a small screen. Your progress saves automatically, and **Settings → Backup** gives you a code to move your save between your phone and your computer.

## What's next

*[Write a few lines here about what you're planning, for example new waters, more species, more charms, or fixes based on player feedback.]*

I'd love to hear from you in the comments: your best catch, which legend gave you the most trouble, and anything that felt too slow or too fast. Feedback on the balance is especially helpful right now.

Thanks for playing, and tight lines! 🎣
