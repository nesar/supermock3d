---
layout: wide-figure
part: Part 1 · Galaxy–halo connection
---
# From the matched history to a galaxy at $z_{\rm obs}$

<div class="small">

- The galaxy observed at $z_{\rm obs}$ is the matched UM history **cut at the cosmic time $t(z_{\rm obs})$**. Only stars formed before that time are in the spectrum.
- Stellar mass at the time of observation: $M_*(z_{\rm obs}) = f_{\rm surv}\int_0^{t(z_{\rm obs})}{\rm SFR}\,dt$. The factor $f_{\rm surv}$ = 0.572 is the median ratio of the UM stellar mass to the formed mass. It is the same in all 19 patches. The spectrum itself uses the surviving mass that FSPS computes.
- The catalog keeps both masses: `stellar_mass` (UM, today; correct only at low $z$) and `stellar_mass_zobs`.

</div>

![matched SFHs](figs/matching_sfhs.png)

Caption: Left: one matched history per redshift bin, solid up to $t(z_{\rm obs})$ (vertical lines), dotted after it. Right: mass at $z_{\rm obs}$ against the UM mass today. At $z \approx 4$ a galaxy that ends at log M$_*$ = 11.5 has formed only about 10¹⁰·⁷ M$_\odot$.
