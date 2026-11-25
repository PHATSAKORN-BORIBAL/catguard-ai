# Evaluation and tests

## Executable synthetic tests

Run `npm test`. The suite covers independent door alerts, combined warning events, closed/far/no-cat cases, threshold boundaries, repeated states, rapid reopening, later cat arrival, warning rearming, stale/future/malformed camera data, unknown/recovered door state, fake crossing claims, invalid inputs, event ordering and local identifiers.

All inputs are synthetic. Passing these tests validates the reference state logic only. It does not measure a detector, real sensor, network, Telegram delivery or escape prevention. See `validation.txt` for the captured local run; the GitHub workflow has not been run until this repository is actually published and CI finishes.

## Hardware evaluation plan — not yet performed

| Scenario | Expected observation | Measure |
|---|---|---|
| Door opens without visible cat | Independent Door Open event | Door event recall and latency |
| Door opens with cat near exit | Door Open plus Warning | Event correctness and warning latency |
| Cat far from exit | No unnecessary high-risk alert | False warning rate |
| Cat crosses doorway | Evaluate direction tracking, no current Critical | Labeled crossing precision/recall |
| Low light or occlusion | Characterize detector failures | Detection precision/recall by condition |
| Notification service outage | Observe failures and recovery | Delivery success, retries and delay |

Use labeled, consented data; report sample counts, definitions, hardware, network conditions and confidence intervals. Measure end-to-end latency from the physical event to receipt on the owner's device, not just JavaScript execution time. Split evaluation data from tuning data. Do not treat sample confidence values as accuracy.
