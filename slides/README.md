# SuperMock v3 slides

Served at `<site>/slides/` (GitHub Pages, same repo as the 3D flythrough; the two pages do not link to each other).
One Markdown file per slide in `pages/`; `slides.json` sets the order. The text follows the same style as `Mocks_v3/documentation/`: short sentences, plain words, a terms slide (`03-terms.md`) instead of undefined jargon; every number on a slide is checked against the production files (last check: 7 October 2026). `index.html` + `assets/deck.{js,css}` render them in the browser; there is no build step.

## Editing a slide

```
---
layout: figure-right        # text | figure-right | figure-left | wide-figure | title | section
part: Part 1 · Spectra      # footer label (left)
kicker: Part 1              # small label above the title (title/section layouts only)
---
# Slide title (inline $math$ allowed)

Markdown body: lists, **bold** (teal), *italic* (gold), tables, `code`, $\LaTeX$, $$display$$.

|||

![alt text](figs/some_figure.png)

Caption: a paragraph starting with "Caption:" is set small and grey.

???
Speaker notes: everything after a line containing only ??? is not shown.
```

- A line with only `|||` splits the body into columns (left `|||` right). Layout `figure-right` gives the right column more width, `figure-left` the left one.
- `wide-figure`: one column, text on top and a figure below it; the figure is scaled to fill what remains.
- Images are sized automatically so each column fits the 1600 × 900 slide. Append `#bare` to an image URL to drop the white card (e.g. a picture with its own dark background).
- HTML is allowed for special blocks: `<div class="flow">` with `<div class="box">` children (pipeline boxes; `box cal` rose, `box out` gold), `<div class="stats">` (big numbers), `<div class="small">` / `<div class="mid">` around Markdown to shrink text, `<p class="note">` for a grey footnote. Leave a blank line after an opening `<div>` so the Markdown inside is parsed.

To add a slide: create `pages/NN-name.md`, add its file name to `slides.json`. To remove: delete it from `slides.json` (the file can stay).

## Figures

`figs/*.png` are written by the scripts in `Mocks_v3_data/money_plot/slides/scripts/` (not in this repo); vector PDFs of the same figures are in `money_plot/slides/figs_pdf/`.

| script | figures |
|---|---|
| `fig_footprint.py` | `footprint_mollweide` |
| `fig_cores.py` | `cores_*` (patch-3 catalog) |
| `fig_matching.py` | `matching_*` (UM/SMDPL pool + patch 3) |
| `run_c3k.sh fig_sed_physics.py --compute` once, then `run_c3k.sh fig_sed_physics.py` | `sed_*` (production painter chain, FSPS-C3K), including `sed_dust_curve` and `sed_dust_av_history` |
| `fig_filters.py` | `filters_all` (reads the pinned filter files in `Mocks_v3/pipeline/data/filters/`) |
| `money_plot/make_money_plot_v2.py --patch 6 --slide` | `money_plot_patch6.jpg` (slide 2) |
| `aggregate_reports.py`, then `fig_validation.py` | `val_*` (all 19 patch reports combined) |

`lastjourney_heitmann21.jpg` is Fig. 1 of Heitmann et al. 2021; `lightcone_schematic_korytov19.png` is from Korytov et al. 2019.

## Viewing

Arrow keys / space / PageUp-Down, Home/End, `o` overview, `f` fullscreen, swipe on touch screens; the URL hash is the slide number (`#12`). Print from the browser (landscape, no margins, background graphics on) for a PDF with one slide per page.
The repo root has `.nojekyll` so Pages serves the `.md` files as-is (Jekyll would convert them to `.html`); keep it.
Local preview: `python3 -m http.server` in `docs/` and open `http://localhost:8000/slides/` (opening the file directly does not work, the pages are fetched).
