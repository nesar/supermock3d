---
layout: text
part: Part 1 · Dust calibration
---
# Dust calibration: the one tuned step

The fit compares the mock with three sets of data. One score adds the three parts. The fit changes all dust parameters at the same time to make the score as small as possible.

| part | data | what is compared |
|---|---|---|
| optical colours | SDSS ($z$ < 0.4), DEEP2 ($z$ < 1.4) | histograms of $u-g$, $g-i$, $r-i$, $i-z$ in redshift bins, inside each survey's magnitude window, with the survey's own errors added to the mock |
| infrared colours | WISE galaxies with SuperCOSMOS redshifts (4,300 galaxies, $z$ < 0.35) | histograms of W1−W2 and W2−W3 in redshift bins. W3−W4 is not used: that sample needs a W4 detection and so prefers warm, AGN-like galaxies. |
| bright-galaxy counts | the $r$-band luminosity function of Blanton et al. (2003) | galaxies per deg² in each magnitude bin, 15 < $r$ < 19.5 |

<div class="small">

- **Galaxies.** 250,000 galaxies from one mock patch ($z$ < 1.5), weighted to represent the whole patch. Their dust-free spectra are made once. Each trial of the parameters re-applies the dust in milliseconds.
- **WISE table.** W3 and W4 need the infrared emission, which is slower. Before the fit we tabulate the WISE magnitudes of 3,000 galaxies at 15 dust amounts with the painter's own code. The fit reads this table.
- **Two solutions.** The score has two low regions: little dust dependence on mass (good), or much more dust in massive galaxies (bad). A downhill fit from the default start found the bad one twice. The fit now starts from three points and keeps the best.
- Production model: fitted on patch 4, frozen on 22 July 2026. See `Mocks_v3/documentation/DUST_MODEL.md`.

</div>
