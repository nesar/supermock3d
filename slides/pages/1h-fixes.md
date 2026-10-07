---
layout: text
part: Part 1 · Construction
---
# What changed between the early mocks and v3

| problem in earlier versions | effect | v3 |
|---|---|---|
| the dust package received a linear star-formation rate and observed-frame wavelengths | $A_i$ up to 12–20 mag | own rest-frame dust model, calibrated |
| spectra rescaled by formed / surviving mass | all galaxies about 0.55 mag too bright | FSPS absolute scale |
| band flux as a plain dot product | percent-level, band-dependent offsets | photon-counting AB integral |
| $H_0$ = 70 for ages, SMDPL elsewhere | inconsistent ages and distances | SMDPL cosmology throughout |
| a neural-network emulator trained on the broken spectra | inherited every error above | direct FSPS painting (about 580 galaxies/s per node) |
| BaSeL stellar library | no CO features; W1−W2 too red | C3K library |
| no dust emission | W3 and W4 unusable | re-emission by energy balance |
| no intergalactic absorption | $u$, $g$, $r$ too bright at $z$ > 2.5 | Madau (1995) |
| match on the host history, unscaled features | massive-end stellar-mass function 100× too high | own history, scaled features |
| luminosities from Mpc/$h$ distances in an observed window | 2.2× too low, not K-corrected | rest-grid luminosities |
