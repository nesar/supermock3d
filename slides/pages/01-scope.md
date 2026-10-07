---
layout: wide-figure
part: Overview
---
# What the mock is, and what it is for

<div class="small tight">

- **Purpose.** Galaxies with realistic spectra and colours on a lightcone. They let us test the SPHEREx redshift and cosmology pipelines on a sky where the truth is known. The mock also has LSST, WISE, COSMOS, Legacy Surveys and 2MASS photometry.
- **How it is made.** Dark-matter cores from a 3.4 $h^{-1}$Gpc N-body run get star-formation histories from UniverseMachine. A stellar-population code turns each history into a spectrum. We add dust and absorption by intergalactic hydrogen.
- **What is tuned.** Only the dust model. We fit it to SDSS, DEEP2 and WISE colours and to the number of bright galaxies per square degree. Nothing is fitted to SPHEREx data.

</div>

![One sky patch of the mock](figs/money_plot_patch6.jpg#bare)

Caption: Patch 6 (36.0 M galaxies, 214.9 deg²). Top: galaxies with $i_{\rm LSST}$ < 25.5 or W1 < 20.5 at $z$ < 0.5, and a 0.7° × 0.4° zoom with illustrative morphologies. Bottom: SDSS colours against data, halo mass growth and star formation by mass, painted spectra with SPHEREx photometry (white).
