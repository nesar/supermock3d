---
layout: text
part: Part 2 · Limitations
---
# Known limits

<div class="mid tight">

1. **Mass floor.** Cores exist only above 80 particles ($M_{\rm peak}$ ≥ 2.2 × 10¹¹ $h^{-1}$M$_\odot$). The catalog is incomplete below log M$_*$ ≈ 9.6, and faint counts are limited by mass, not by flux (half of the expected LSST surface density).
2. **Merged cores are duplicates.** The UM stellar mass and history already include all progenitors, and the host halo absorbs the satellite mass at merging (median 74%). The 7.7% of rows that are merged cores carry 8.8% of the stellar mass a second time. Dropping them makes the counts and the stellar-mass function worse (count score 0.067 → 0.095 dex), so part of the present agreement depends on them. Not changed in production: the dust fit was made with them, and all patches must stay the same type.
3. **Colours.** $u-g$ is 0.4 to 0.8 mag too blue and $g-i$ 0.4 to 0.5 too red against SDSS and DEEP2. W3−W4 is too blue. Dust is one $\tau_V(z)$ with no scatter between galaxies, metallicity has no scatter, there is no active nucleus.
4. **Massive end.** The stellar-mass function is above GAMA for log M$_*$ > 11.4. The GAMA stacks are 1.3 to 2.8× brighter at a fixed mass label (a mass-definition offset).
5. **A step at $z \approx 2.86$.** The cut-sample d$N$/d$z$ halves within Δ$z$ = 0.025 (the full population drops about 10%). It is at a UniverseMachine snapshot ($z$ = 2.876) and a lightcone step ($z$ = 2.851). The median $M_*$ at fixed $M_{\rm peak}$ drops 0.07 dex across it. Not diagnosed yet.
6. **Conventions.** `stellar_mass` is the UM mass today (use `stellar_mass_zobs`). The catalog x, y, z differ from $D_C(z)$ in the SMDPL cosmology by about 0.3% at $z \sim 4.5$. Rest-frame $u$ and $g$ luminosities include intergalactic absorption at $z \gtrsim 2.5$. The matching features use each core's full history to $z$ = 0.

</div>
