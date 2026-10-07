---
layout: figure-right
part: Part 1 · Spectra
---
# Dust absorption: applied to the rest-frame spectrum

- FSPS runs **without dust**. We then multiply the rest-frame spectrum by $e^{-\tau(\lambda)}$, with $\tau(\lambda) = \tau_V\,k(\lambda)$.
- $k(\lambda)$ is the **Calzetti (2000) curve** with a 2175 Å bump. The fit allowed a change of slope ($n$) and extra dust around young stars ($\mu$). Both came out at zero.
- The **dust amount** was allowed to depend on stellar mass, metallicity, redshift and star-formation rate:
  $\tau_V = a\,10^{b(\log M_*-10)}\,10^{c\log Z}\,(1+z)^d\,10^{e(\log{\rm sSFR}+10)}$.
  The fit gives $a$ = 0.407, $d$ = 0.584 and $b, c, e \approx 0$. Thus in production **every galaxy at the same redshift has the same dust**: $\tau_V = 0.41\,(1+z)^{0.58}$, or $A_V$ = 0.44 mag at $z$ = 0, 0.66 at $z$ = 1, 1.0 at $z$ = 3.
- There is no scatter between galaxies. The red and blue galaxy colours come from the stars, not from dust.

|||

![dust curve](figs/sed_dust_curve.png)

Caption: The curve shape for several slopes $n$. Production uses $n \approx 0$: the Calzetti curve with the bump.
