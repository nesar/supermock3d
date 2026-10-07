---
layout: figure-right
part: Part 2 · Dataset
---
# What is in the dataset

<div class="stats">
<div><b>4,082</b><span>deg² (19 × 214.9)</span></div>
<div><b>683 M</b><span>galaxies, $z$ < 5.5</span></div>
<div><b>303 M</b><span>with $i$ < 25.5 or W1$_{\rm AB}$ < 20.5</span></div>
<div><b>159</b><span>AB bands per galaxy</span></div>
</div>

Per galaxy: RA, Dec, $z_{\rm obs}$ (with peculiar velocity), comoving position and velocity, central / satellite / merged flag, own and host mass histories (101 outputs), matched SFH (117 bins), $M_*$ today and at $z_{\rm obs}$, the full spectrum, 159 magnitudes, rest-frame SDSS and WISE absolute magnitudes, $L_{\rm bol}$.

| galaxies per deg² (mean of 19 patches) | deg⁻² | patch rms |
|---|---|---|
| LSST $i$ < 25.3 | 70,200 | 0.4% |
| SDSS-like $i$ < 22.2 | 16,600 | 0.9% |
| SPHEREx, any channel < 19.5 AB | 7,950 | 0.9% |
| SPHEREx, any channel < 18.5 AB | 2,030 | 1.5% |
| WISE W1 < 19.6 AB | 6,120 | 0.8% |

|||

![n(z)](figs/val_nz.png)

Caption: Left: galaxies per deg² and unit redshift, for all galaxies and for the cut sample used in all validation plots. Right: class fractions in the cut sample. Satellites and merged cores are gone above $z \approx 3.8$.
