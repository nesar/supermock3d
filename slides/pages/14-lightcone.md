---
layout: figure-right
part: Part 1 · Simulation
---
# The core lightcone and the sky patches

- A core is placed where its path crosses the past lightcone of the observer, between two outputs. The lightcone file stores a pointer (file, row, output) into the forest.
- **The pairing matters.** The lightcone (built in November 2024) pairs only with the forest it was built from (`coretrees_bak`, December 2024). Every production run checks 100,000 pointers per forest file against the core identity and stops if fewer than 99.9% agree. Measured: 100.00%.
- The sky is cut into **192 equal-area patches** of 4π/192 sr = 214.9 deg². One patch holds about 36 M galaxies at $z$ < 5.5.
- The **observed redshift** includes the velocity along the line of sight: $1+z_{\rm obs} = (1+z_{\rm cos})\sqrt{(1+v_\parallel/c)/(1-v_\parallel/c)}$. Positions stay in real (comoving) space.

|||

![lightcone schematic](figs/lightcone_schematic_korytov19.png)

Caption: A merger-tree branch crosses the lightcone between outputs $t_j$ and $t_{j+1}$. The object is placed at the crossing point $\mathbf{h}'$. Schematic from Korytov et al. 2019.
