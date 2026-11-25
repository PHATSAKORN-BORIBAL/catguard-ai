# Architecture and data flow

## Two independent input paths

The presentation's door-event path is authoritative for behavior: a door opening must not wait for cat detection. The photographed CiRA graph describes the existing visual workflow, but does not demonstrate an independent physical door sensor.

### Observed CiRA screenshot

```mermaid
flowchart LR
  AR[Auto Run] --> VF[VideoFile]
  VF --> GC[GstCam]
  GC --> DD[Deep Detect]
  DD --> JS[JavaScript]
  JS --> IF{If Else}
  IF --> IC[Image Capture]
  IF --> TG[TGNotify]
  GC --> V[Debug live view]
  JS --> P[Debug payload]
```

The screenshot shows CiRA CORE 1.9.4, a TEST notification message and `mode: SIMULATE`. Its confidence display is not an accuracy measurement. The diagram is a transcription of visible nodes, not a runnable export.

### Proposed data flow

```mermaid
flowchart TD
  S[Door sample] --> B[Debounce and timestamp]
  B --> E[Detect transition into open]
  E --> O[Door Open notification event]
  F[Video frame] --> I[Inference]
  I --> Z[Safety-zone membership]
  Z --> C[Fresh cat observation]
  B --> R[Reference risk engine]
  C --> R
  R --> W[Cat Near Exit warning event]
  O --> Q[Future durable dispatcher]
  W --> Q
  Q --> T[Notification service]
  Q --> H[Redacted event history]
  R --> UI[Future dashboard]
```

The reference engine combines transition detection and risk evaluation in a small synchronous API. Integrators must invoke it from door changes even when there is no fresh camera observation; `cat: null` is valid. Never put this call solely behind a successful inference node.

## State semantics

- An engine instance represents one door and one serialized stream.
- `unknown -> open` is a conservative baseline alert, not proof of a newly observed opening.
- Duplicate open samples are suppressed. `open -> closed -> open` always rearms.
- A warning rearms after the qualifying condition clears. No temporal hysteresis is included; flickering detections may cause repeated warnings.
- Closed means no current open-exit warning, not a claim of animal safety.
- Unknown door state remains visibly unknown and must be treated as a device-health concern.
- Critical is reserved for a future validated tracker, not a confidence threshold or a caller-supplied boolean.
