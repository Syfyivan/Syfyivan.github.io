# Reading Lab verification

The standalone page is at `/reading-lab/`. Hexo copies its files unchanged via
`skip_render`; `source/js/home-showcase.js` adds its homepage entry. It uses native
ES modules and browser storage, with no new packages or external services.

## Scope

- `source/reading-lab/index.html`, `style.css`: responsive training interface.
- `source/reading-lab/app.js`: flash recall, story playback and quizzes, Schulte
  grid, imports/exports and local training history.
- `source/reading-lab/core.js`, `data.js`: validated word banks, original stories,
  import parsing, classification, wrapping, shuffle and accuracy calculations.
- `tools/reading-lab.test.mjs`: data and core regression tests.
- `_config.yml`, `source/js/home-showcase.js`: static route and discovery.
- `rewards.js`, `player-store.js`: separate local player wallets, cumulative scores,
  once-only settlement, migration, backup validation and pet progression.
- `companions.css`, `pets/*.svg`: companion home, shop, rankings and three local
  vector illustrations. No remote assets or additional dependencies are used.

## Validation commands

```sh
node --check source/reading-lab/app.js
node --test tools/reading-lab.test.mjs tools/blog-regression.test.cjs
node --test tools/reading-lab-rewards.test.mjs tools/reading-lab-player-store.test.mjs
pnpm run build
node --test tools/blog-built.test.cjs
git diff --check
```

Windows baseline caveat: the pre-existing built search comparison in
`blog-built.test.cjs:41` compares LF generated output against a CRLF checkout
byte-for-byte. Normalizing CRLF to LF makes the untouched search files identical.
Do not change the search implementation to work around this unrelated test.

## Browser checks

Exercise a complete flash session with both remembered and forgotten self-ratings,
retry mistakes, and verify that imported numeric values are actually displayed.
Exercise story completion, pause/resume, all masks, retelling and three-question
scoring; custom articles intentionally use self-assessment. Finish a 3×3 grid,
including one wrong click. Switch views mid-training and confirm pause behavior.
Check long content at 320px, 390px and desktop width, and reload to verify storage.

Only completed flash answers count toward partial sessions. Flash appearance is
timed after paint, but browser scheduling and screen refresh can affect very short
exposures. Story speed counts displayed non-whitespace code points, including
punctuation, per foreground playback minute. The mask represents playback progress,
not measured eye position. Difficulty levels are game bands, not validated
cross-language equivalents. No claim of improved general reading speed is made.

Records and imported material remain in the current browser. Storage may be
unavailable or fill up; the UI reports failures and still allows JSON export.
Word imports are limited to 1 MB/5000 entries; versioned backups allow 12 MB.
Backups merge valid records, retain at most 100, and restore the custom article.
Physical mobile devices and Safari require separate device acceptance testing.

## Local players and companions

The `reading-lab-v2` browser store contains up to eight profiles. Each profile has
its own history, spendable coins, lifetime score, best single-session scores,
settlement IDs, adopted pets and XP. Word banks and the custom article are shared.
The prior `reading-lab-v1` store is retained; migration copies its records to the
first player without inventing historical rewards. V2 backup import never adds
an existing profile's wallet a second time. An untouched empty default profile
can make room for all eight players in a full backup.

Flash rewards self-rated recall by difficulty with a completion bonus; retries
have a smaller reward. Story rewards require at least 20 non-whitespace code
points in the retelling, with additional points for comprehension answers.
Grid scores depend on size and errors. No speed bonus is awarded. Purchases and
feeding reduce only spendable coins. Pet XP has ten levels and three visual stages.
The UI contains the exact rules and affordability feedback.

Incomplete training is reset on profile changes after a discard prompt, and
settlement targets the session's original player ID. Other-tab storage changes
pause the current page and request a refresh; a snapshot check before writes
also rejects detected stale writes. This local-only feature is not an online
competitive economy and is not an atomic multi-client database.

Browser acceptance covers earning 118 points through eight 3×3 grids (one error),
buying the 80-point cat, feeding twice to level 2, retaining 118 lifetime points
with 8 spendable coins, switching to a fresh player, and reload persistence.
Legacy records, flash reward settlement and custom-story rewards are checked too.


## Manual flash and continuous mask update

Flash rounds begin only on a button press. After the timed stimulus disappears,
the reader can reveal the answer and select remembered or forgotten without
typing. Results and history explicitly say self-assessed; the existing score
rules and mistake retry flow are retained. The next round waits for another click.

The reading viewport uses one fixed pseudo-element from its top edge to the
reading guide, including inter-line space, instead of separate rectangles on
completed rows. The default translucent black, opaque black and gray options
all cover the same region. Browser checks verify a five-round self-rating run,
scoring, no text input, and that mask width equals the viewport width and mask
height equals the guide position.
