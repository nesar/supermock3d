---
layout: wide-figure
part: Part 1 · Observables
---
# Photometry and rest-frame luminosities

<div class="small">

- **AB magnitudes** with the photon-counting definition $\langle f_\nu\rangle = \int f_\nu T\,d\lambda/\lambda \big/ \int T\,d\lambda/\lambda$ and $m = -2.5\log_{10}(\langle f_\nu\rangle/3631\,{\rm Jy})$. All bands of all galaxies are one matrix product on a fixed grid with $R$ = 8000. The error against direct integration is below 1.5 mmag.
- **Rest-frame luminosities** without K-corrections: $L_\nu = 4\pi D_L^2 f_\nu/(1+z)$ on the rest grid, projected through the SDSS and WISE filters. Also $L_{\rm bol}$ and $L_{8-33\,\mu{\rm m}}$ (rest 8 to 33 µm only; not the total 8 to 1000 µm infrared luminosity).
- **Filter files are part of Mocks_v3** (`pipeline/data/filters/`). They are copies of the files used for every production patch, so a new patch gets the same 159 columns.

</div>

![filters](figs/filters_all.png)

Caption: SPHEREx: 102 channels, 0.75 to 5.0 µm. W3 and W4 are not in the photometry files; the validation reports compute them from the spectra.
