---
layout: figure-right
part: Part 1 · Simulation
---
# The core lightcone and the sky patches

- Cores are placed where their trajectory crosses the observer's past lightcone between two snapshots; the lightcone stores a pointer (file, row, snapshot) into the core forest.
- **Pairing matters:** the lightcone (Nov 2024 build) only pairs with the forest build it was made from. Every production run re-checks 100k (row, snapshot) → `core_tag` identities per forest file and aborts below 99.9% (measured: 100.00%).
- The sky is divided into **192 equal-area patches** of 4π/192 sr = 214.9 deg² (ring decomposition; RA = φ + 180°, Dec = 90° − θ). One patch holds ~36 M galaxies at $z$ < 5.5.
- **Observed redshift** includes the line-of-sight peculiar velocity:
  $1+z_{\rm obs} = (1+z_{\rm cos})\sqrt{\tfrac{1+v_\parallel/c}{1-v_\parallel/c}}$; positions stay comoving (real space).

|||

![lightcone schematic](figs/lightcone_schematic_korytov19.png)

Caption: A merger-tree branch crossing the lightcone between snapshots $t_j$ and $t_{j+1}$; the object is placed at the interpolated crossing point $\mathbf{h}'$. Schematic from Korytov et al. 2019 (arXiv:1907.06530).
