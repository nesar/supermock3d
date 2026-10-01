---
layout: text
part: Part 2 · Limitations
---
# Known limitations

<div class="mid tight">

1. **Mass floor.** Cores exist only above 80 particles ($M_{\rm peak}$ ≥ 2.2 × 10¹¹ $h^{-1}$M$_\odot$): the catalog is incomplete below log M$_*$ ≈ 9.6, and faint counts are mass-limited (LSST-depth surface density about half of projections).
2. **Merged cores are duplicates.** UM's `sm` and SFHs already include all progenitors, and the host's tree-node mass absorbs the satellite at merging (median 74%). The 7.7% of rows that are merged cores carry 8.8% of $M_*$ twice. Removing them worsens the count and GSMF agreement (count term 0.067 → 0.095 dex), so part of the current agreement relies on them. Not changed in production because the dust fit was made with them.
3. **Colours:** $u-g$ 0.4–0.8 mag too blue and $g-i$ 0.4–0.5 too red against SDSS and DEEP2; W3−W4 too blue. Dust is a single $\tau_V(z)$ with no galaxy-to-galaxy scatter, metallicity has no scatter, no AGN.
4. **Massive end:** GSMF above GAMA for log M$_*$ > 11.4; GAMA SED stacks 1.3–2.8× brighter at fixed mass label (mass-definition offset).
5. **Feature step at $z \approx 2.86$:** the cut-sample d$N$/d$z$ halves within Δ$z$ = 0.025 (the full population drops ~10%). It coincides with an SMDPL snapshot ($z$ = 2.876) and a LastJourney lightcone step ($z$ = 2.851); median $M_*$ at fixed $M_{\rm peak}$ drops 0.07 dex across it. Not yet diagnosed.
6. **Conventions to respect:** `stellar_mass` is the UM $a$ = 1 mass (use `stellar_mass_zobs`); catalog x, y, z differ from $D_C(z)$ in the SMDPL cosmology by ~0.3% at $z \sim 4.5$; rest-frame $u/g$ luminosities include IGM absorption at $z \gtrsim 2.5$; matching features use each core's full history to $z$ = 0.

</div>
