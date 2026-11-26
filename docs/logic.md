# Logic reference

The supplied controller reads Deep Detect data, normalizes class names and confidence values, collects detections from top-level and nested arrays, and applies configurable rules. This public example accepts a simplified flat list of synthetic detections. It does not depend on the CiRA CORE runtime.

| Parameter | Original value | Purpose |
|---|---:|---|
| Minimum confidence | 0.50 | Discard results below 50% |
| Edge gap ratio | 0.08 | Horizontal separation relative to frame width |
| Reference center gap | 0.18 | Approximate closed-door reference |
| Center shift ratio | 0.06 | Additional center separation relative to frame width |
| Boundary padding | 0.15 | Expand door rectangle on each side |
| Cooldown | 15 seconds | Minimum interval between emitted alert decisions |
| Closed-door pet alert | enabled | Notice even when the door is closed |
| Open-door-only alert | disabled | Do not alert on opening alone |

## Decision rules

For complete left/right leaf detections, let `xL`, `wL`, `xR`, `wR` denote the top-left x coordinates and widths. The door is classified as open if either `(xR - (xL + wL))/frameWidth >= 0.08` or `((xR + wR/2) - (xL + wL/2))/frameWidth >= 0.24` (the second expression uses 0.18 + 0.06). These values are configurable heuristics, not validated physical measurements.

A pet or person is near the door when the center of its bounding box falls inside the door rectangle expanded by 15% of its width and height on each side, clipped to the frame. If the main door box is unavailable, a rectangle enclosing the door leaves can be used. This is not a pentagon or physical distance calculation.

| Door state | Pet near | Person near | Default decision |
|---|---|---|---|
| Open | Yes | No | Open-door pet alert |
| Closed | Yes | No | Closed-door pet notice |
| Either | Yes | Yes | Suppress |
| Either | No | No | No alert |
| Unknown | Any | Any | No alert (safer reference behavior) |

An alert decision is emitted only after the cooldown. The controller tracks daily count, first alert, highest pet confidence and latest alert timestamp in memory. These counters are not tracking IDs or unique events.

## Differences from the original runtime script

- Generic labels `pet_a`, `pet_b` replace the private project-specific labels. The source package reports two annotation sets, four general categories and two door-leaf categories, rather than claiming a single six-class model.
- No CiRA-specific global variables or payload format are required. Supply flat records to the example; a real adapter must validate and convert the runtime data.
- Invalid bounding boxes and confidence outside 0–1 after normalization are rejected. Incomplete door-leaf detections produce `unknown` rather than assuming closed.
- Output is an in-memory object only. No actual Telegram API, camera access, image capture, disk writes or raw-image flags are implemented.
- Daily risk tiers are illustrative frequency levels, not evidence of a pet's intent.
