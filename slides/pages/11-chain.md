---
layout: text
part: Part 1 · Construction
---
# The pipeline at a glance

<div class="flow">
<div class="box"><b>LastJourney</b>gravity-only HACC run, 3.4 $h^{-1}$Gpc, 10752³ particles<br><i>input</i></div>
<div class="box"><b>Cores + forest</b>tracked halo centres, central / satellite / merged states, 101 outputs<br><i>input</i></div>
<div class="box"><b>Core lightcone</b>cores at their lightcone crossing, 192 sky patches, $z$ &lt; 5.5 (cut)<br><i>input</i></div>
<div class="box"><b>Features</b>$t_{25}$, $t_{50}$, $M_{\rm peak}$, $t_{\rm infall}$ from the core's own mass history<br><i>stage 1</i></div>
<div class="box"><b>Match to UM</b>standardised KD-tree in SMDPL UniverseMachine pools, class by class → SFH<br><i>stage 1</i></div>
<div class="box"><b>Stars + gas</b>FSPS-C3K, Chabrier IMF, nebular lines, $Z(M_*, z)$, SFH cut at $t(z_{\rm obs})$<br><i>stage 2</i></div>
<div class="box cal"><b>Dust</b>rest-frame Noll+09 attenuation, $\tau_V(z)$ calibrated; DL07 re-emission by energy balance<br><i>stage 2</i></div>
<div class="box"><b>Observe</b>$(1+z)$ shift, $D_L$ dimming, Madau IGM → $f_\nu$ on 11,149 points<br><i>stage 2</i></div>
<div class="box out"><b>Photometry</b>159 AB bands (LSST, SPHEREx 102, COSMOS 31, WISE, LS, 2MASS)<br><i>stage 3</i></div>
<div class="box out"><b>Luminosities</b>rest-frame SDSS / WISE $M_{\rm AB}$, $L_{\rm bol}$, $L_{8-33\,\mu\rm m}$<br><i>stage 3</i></div>
<div class="box out"><b>Reports</b>per-patch validation against SDSS, DEEP2, WISE, GAMA, published GSMF/LF<br><i>stage 4</i></div>
<div class="box out"><b>Compaction</b>SEDs to float16 on a 5,159-point grid (4.3× smaller)<br><i>storage</i></div>
</div>

One sky patch (~36 M galaxies) runs end to end in 3.5–4.5 h on 8–16 Improv nodes; each stage checkpoints and resumes. Cosmology for ages, distances and volumes in the painting: SMDPL flat ΛCDM, $H_0$ = 67.77, $\Omega_m$ = 0.307.
