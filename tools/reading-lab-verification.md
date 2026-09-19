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

## Validation commands

```sh
node --check source/reading-lab/app.js
node --test tools/reading-lab.test.mjs tools/blog-regression.test.cjs
pnpm run build
node --test tools/blog-built.test.cjs
git diff --check
```

Windows baseline caveat: the pre-existing built search comparison in
`blog-built.test.cjs:41` compares LF generated output against a CRLF checkout
byte-for-byte. Normalizing CRLF to LF makes the untouched search files identical.
Do not change the search implementation to work around this unrelated test.

## Browser checks

Exercise a complete flash session with both correct and incorrect responses,
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
