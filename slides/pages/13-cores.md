---
layout: figure-right
part: Part 1 · Simulation
---
# Cores: tracked halo centres in place of subhalos

- A **core** is the set of most-bound particles of a halo. The code follows it after the halo falls into a larger halo. It stands in for the subhalo that holds a satellite galaxy.
- Each core has a state at each output: **central**, **satellite**, or **merged** (inside the merging radius of its host). Merged is the final state. A core never leaves it.
- A core starts when its halo has **80 particles** (2.17 × 10¹¹ $h^{-1}$M$_\odot$). No core in the catalog has a lower peak mass. This sets the mass floor of the galaxy catalog.
- Per patch: 76.9% centrals, 15.4% satellites, 7.7% merged cores.

|||

![core states](figs/cores_state_raster.png)

![peak mass](figs/cores_mass_floor.png)

Caption: Top: state histories of 60 random cores observed at $z$ < 0.5. Bottom: peak mass of each class in patch 3 (36.0 M cores), from the core's own history.
