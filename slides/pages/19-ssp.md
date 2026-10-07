---
layout: figure-right
part: Part 1 · Spectra
---
# Stars and gas

- **FSPS** (Conroy, Gunn & White 2009) with the **C3K** stellar library, Padova isochrones and a Chabrier IMF. C3K resolves the 1.6 µm bump and the CO bands at 2.3 and 4.6 µm. The BaSeL library, used before, smooths them out: for a 10 Gyr population W1−W2 moves from +0.02 to −0.08 (Vega).
- **Star-formation history as a table.** FSPS integrates the 117-point history up to $t(z_{\rm obs})$. The spectrum has the correct absolute scale (constant 1 M$_\odot$/yr for 13 Gyr gives 7.8 × 10⁹ M$_\odot$ of surviving stars).
- **Gas emission**: continuum and lines from the CLOUDY grid in FSPS, $\log U$ = −2, gas metallicity = stellar metallicity. Lines are at the native resolution of the library; no velocity broadening.
- **Metallicity**: one relation of formed mass and redshift, fitted to the EAGLE simulation (next slide). No scatter.
- Output: rest-frame $L_\lambda$ on 11,149 points from 0.01 µm to 1 cm.

|||

![metallicity](figs/sed_metallicity.png)

Caption: The metallicity relation used for every galaxy (stars and gas). It is clipped to [−2, 0.3], inside the C3K grid.
