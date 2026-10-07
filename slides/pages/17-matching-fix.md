---
layout: figure-right
part: Part 1 · Galaxy–halo connection
---
# The match in the first version, and what we changed

The first version (v1) had two problems. We found them in the patch-25 report in July 2026.

1. Satellites were matched on the history of their **host halo**, not their own. A satellite in a 10¹⁴ M$_\odot$ cluster got the cluster's $M_{\rm peak}$.
2. Raw masses (10¹¹ to 10¹⁵) were used next to output numbers (about 100). Only the mass had an effect on the distance.

Result: cluster satellites got the stellar mass of a central cluster galaxy. The massive end of the $z$ < 0.3 stellar-mass function was about 100× above GAMA.

| $z$ < 0.35, one low-$z$ forest file | v1 | production |
|---|---|---|
| median log M$_*$, satellites in hosts > 10$^{13.5}$ M$_\odot$ | 11.22 | 10.12 |
| satellites with log M$_*$ > 11 | 57.0% | 2.7% |
| centrals with log M$_*$ > 11 | 13.0% | 5.7% |

|||

![own vs host](figs/cores_own_vs_host.png)

Caption: Peak of the own history against the peak of the host history, for satellites and merged cores at $z$ < 0.5. For 76% of them the host peak is more than 10× the own peak.
