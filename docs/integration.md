# Integration contract

## Inputs

| Field | Requirement |
|---|---|
| `timestampMs` | Non-negative safe integer; non-decreasing within an engine instance |
| `door` | Exactly `open`, `closed`, or `unknown`; already debounced |
| `cat` | Optional/null if camera unavailable |
| `cat.detected` | Boolean |
| `cat.nearExit` | Boolean, computed using a calibrated zone |
| `cat.confidence` | Finite number in [0, 1] |
| `cat.observedAtMs` | Non-negative safe integer on the same clock as timestampMs |

Detection freshness defaults to 2000 ms inclusive; future timestamps are invalid. Invalid or stale camera input is ignored for escalation but cannot suppress a valid door alert. Invalid door or event timestamps throw before state changes. Integration must catch those errors and surface sensor/clock faults rather than silently drop them.

Use one engine per door; serialize inputs. Use a monotonic, shared clock or a well-defined conversion at the adapter boundary. Preserve all debounced door transitions. Missing an entire close/open sequence cannot be reconstructed by this state machine.

## Outputs

Each call returns current door state, risk, camera freshness status, and zero or more alert events. Event IDs are sequential **only within the process instance**. They are not durable or globally unique delivery identifiers. Add a session/door identifier and persistent IDs at the dispatcher boundary.

`REFERENCE_PROTOTYPE` identifies software provenance, not real-world validation. The supplied demo is simulation only. Unknown extra camera properties (including `verified` or `crossing`) cannot enable Critical.

## CiRA adapter work remaining

1. Obtain and review a genuine CiRA project export locally. Do not import an unreviewed archive.
2. Map the real detector output to explicit class, confidence and coordinates. Do not assume the screenshot's QA payload is a real sensor schema.
3. Calibrate the safety-zone polygon for the camera and doorway; compute `nearExit` from documented geometry.
4. Connect a door sensor and debounce transitions separately from video inference.
5. Call the reference logic from every debounced door change and relevant fresh detection update.
6. Translate returned events into the local notification node's verified schema. Store secrets outside the repository.
7. Validate the complete system before deployment.

This ES module targets Node.js. It has not been tested inside the CiRA JavaScript node and is not claimed to be drop-in compatible.

## Delivery and recovery

The engine creates events, not delivered messages. A production adapter needs a durable outbox, bounded retries, idempotency keys, delivery acknowledgment, redacted failure logs and offline health status. Closing/reopening events must not be discarded by a shared notification cooldown. Persist/recover state deliberately; restarting into an open state may emit a duplicate baseline event.

## Critical acceptance gate

A future tracker must demonstrate the same cat track crossing a calibrated door line in the outward direction using ordered, fresh observations. Validate occlusion, track switching, reversals, multiple cats and missed frames against labeled sequences. Record validation evidence and operating limits before adding any Critical output. No such evidence or tracker is provided by this package.
