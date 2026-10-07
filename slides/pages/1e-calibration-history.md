---
layout: figure-right
part: Part 1 · Dust calibration
---
# Why the dust model changed in July 2026

| date | change | reason |
|---|---|---|
| 7–9 July | first fit: optical and WISE colours | replaced a dust package that had been used incorrectly |
| 18 July | bright-galaxy counts added to the score | see below |
| 18 July | fit moved to galaxies from a mock patch | the fit population is now the production population |
| 20 July | WISE table made with the painter's own code | the old table was about 1 mag too red in W2−W3 |
| 21 July | three start points | one start point found the wrong solution twice |
| 22 July | model frozen (patch 4) | — |

**The count problem.** The first fit compared only the shapes of colour histograms. Nothing in it checked whether galaxies were too faint. The fit put $A_i$ = 0.9 to 1.8 mag on massive galaxies, and the mock had 53 galaxies per deg² brighter than $i$ = 17.77 against 100 to 120 observed. With the counts in the score, the dust is almost the same for all galaxies ($A_i \approx$ 0.3 mag at low $z$) and the mock has 97 to 123 bright galaxies per deg².

|||

![A_V history](figs/sed_dust_av_history.png)

Caption: $A_V$ against redshift for the three fits, for a galaxy with log M$_*$ = 10 (and 11 for the first fit). The first fit put more than 2 mag of dust on massive galaxies at every redshift. The production model depends on redshift only.
