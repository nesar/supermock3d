---
layout: text
part: Part 1 · Construction
---
# What changed between the early mocks and v3

| issue in earlier versions | effect | v3 treatment |
|---|---|---|
| attenuation package fed linear SFR and observed-frame wavelengths | $\tau_2 \approx 8$, $A_i$ up to 12–20 mag | own rest-frame dust model, calibrated |
| spectra rescaled by formed / surviving mass | all galaxies ~0.55 mag too bright | FSPS absolute normalisation |
| band flux as a plain dot product | %-level, band-dependent offsets | photon-counting AB integral |
| H$_0$ = 70 for ages, SMDPL elsewhere | inconsistent ages and distances | SMDPL cosmology throughout the painting |
| SED neural-net emulator trained on the broken spectra | inherited every error above | direct FSPS painting (~580 gal/s/node) |
| BaSeL library | no CO features; W1−W2 too red | C3K library |
| no dust emission | W3/W4 unusable | DL07 by energy balance |
| no IGM | $u/g/r$ too bright at $z$ > 2.5 | Madau 1995 (FSPS-exact) |
| parent-FOF, unnormalised matching | massive-end GSMF +2 dex | own history, standardised features |
| luminosities from Mpc/$h$ distances, observed window | 2.2× low, not K-corrected | rest-grid luminosities |
