---
layout: figure-right
part: Part 1 · Spectra
---
# Dust re-emission by energy balance

- The luminosity removed by attenuation, $L_{\rm abs} = \int (L_\lambda - L^{\rm att}_\lambda)\,d\lambda$, is re-emitted as $L_{\rm abs}\,T(\lambda)$.
- $T$ is the Draine & Li (2007) emission spectrum **per unit absorbed luminosity**, extracted once from FSPS by differencing spectra with emission on and off; $\int T\,d\lambda$ = 1.0000 at every grid node.
- Shape parameters are tied to the galaxy, not fitted: $q_{\rm PAH} = 3.5 + 2.5\log Z$, $U_{\rm min} = 10^{0.4+0.8(\log{\rm sSFR}+10)}$, $\gamma = 0.02\cdot10^{0.7(\log{\rm sSFR}+10)}$ (clipped); $T$ is interpolated bilinearly on a 6 × 11 grid in $(\log Z, \log{\rm sSFR})$.
- Checks: against FSPS's internal DL07 calculation with the same attenuation, worst error **0.013 mag** in W1–W4 over 8 test galaxies; WISE W2−W3 moves from ~1 (no IR) to a median 2.9.
- No AGN torus is painted.

|||

![DL07 templates](figs/sed_dl07_templates.png)

Caption: Templates at solar metallicity. Higher sSFR means a stronger radiation field: warmer dust and a peak moving from ~150 µm to ~35 µm.
