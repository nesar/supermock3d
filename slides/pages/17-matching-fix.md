---
layout: figure-right
part: Part 1 · Galaxy–halo connection
---
# The matching as built in v1, and what was changed

Two defects in the legacy matching (diagnosed on the patch-25 report, July 2026):

1. Satellites were matched on the **parent FOF** history, so a satellite in a 10¹⁴ cluster carried the cluster's $M_{\rm peak}$.
2. Raw masses (10¹¹–10¹⁵) sat next to step numbers (~10²) in a Euclidean metric, so only $M_{\rm peak}$ mattered.

Result: cluster satellites received BCG-like stellar masses; the massive end of the $z$ < 0.3 GSMF exceeded GAMA by ~2 dex.

| $z$ < 0.35, one low-$z$ forest file | legacy | production |
|---|---|---|
| median log M$_*$, satellites of hosts > 10$^{13.5}$ | 11.22 | 10.12 |
| satellites with log M$_*$ > 11 | 57.0% | 2.7% |
| centrals with log M$_*$ > 11 | 13.0% | 5.7% |

|||

![own vs host](figs/cores_own_vs_host.png)

Caption: Peak of the own history vs the parent-FOF history for satellites and merged cores at $z$ < 0.5. For 76% the host peak is more than 10× the core's own peak.
