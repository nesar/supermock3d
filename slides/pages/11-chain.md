---
layout: text
part: Part 1 · Construction
---
# The pipeline at a glance

<div class="flow">
<div class="box"><b>LastJourney</b>gravity-only HACC run, 3.4 $h^{-1}$Gpc, 10752³ particles<br><i>input</i></div>
<div class="box"><b>Cores + forest</b>tracked halo centres, central / satellite / merged state, 101 outputs<br><i>input</i></div>
<div class="box"><b>Core lightcone</b>cores at their lightcone crossing, 192 sky patches, $z$ &lt; 5.5<br><i>input</i></div>
<div class="box"><b>Features</b>$t_{25}$, $t_{50}$, $M_{\rm peak}$, $t_{\rm infall}$ from the core's own mass history<br><i>stage 1</i></div>
<div class="box"><b>Match to UM</b>nearest neighbour in a UniverseMachine pool, class by class → one SFH per galaxy<br><i>stage 1</i></div>
<div class="box"><b>Stars + gas</b>FSPS with the C3K library, Chabrier IMF, nebular lines, $Z(M_*, z)$, SFH cut at $t(z_{\rm obs})$<br><i>stage 2</i></div>
<div class="box cal"><b>Dust</b>rest-frame absorption with a calibrated $\tau_V(z)$; re-emission in the infrared by energy balance<br><i>stage 2</i></div>
<div class="box"><b>Observe</b>$(1+z)$ shift, $D_L$ dimming, intergalactic absorption → $f_\nu$ on 11,149 points<br><i>stage 2</i></div>
<div class="box out"><b>Photometry</b>159 AB bands (LSST, SPHEREx 102, COSMOS 31, WISE, Legacy Surveys, 2MASS)<br><i>stage 3</i></div>
<div class="box out"><b>Luminosities</b>rest-frame SDSS and WISE $M_{\rm AB}$, $L_{\rm bol}$, $L_{8-33\,\mu\rm m}$<br><i>stage 3</i></div>
<div class="box out"><b>Report</b>per-patch comparison with SDSS, DEEP2, WISE, GAMA and published mass and luminosity functions<br><i>stage 4</i></div>
<div class="box out"><b>Compaction</b>spectra to float16 on a 5,161-point grid (4.3× smaller)<br><i>storage</i></div>
</div>

One patch (~36 M galaxies) runs end to end in 4 to 6 hours on 8 to 32 Improv nodes. Each stage saves checkpoints and continues from them when it is run again. All ages, distances and volumes use the SMDPL cosmology: flat ΛCDM, $H_0$ = 67.77, $\Omega_m$ = 0.307.
