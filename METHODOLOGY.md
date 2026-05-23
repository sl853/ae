# Tilth Measurement Methodology

Version: v0.1  
Status: prototype methodology

Tilth shows impact estimates so people can understand what happened after an answer. The numbers should be useful, not fake-precise.

## Measurement rule

Tilth labels values in two buckets:

- **Measured**: directly observed by the software or hardware.
- **Estimated**: calculated from route, runtime, token count, device class, provider, or published coefficients.

If Tilth cannot defend a number, it should not show the number as exact.

## What is measured now

In the current local prototype:

- Route selected
- Search provider used
- Search request duration on the server
- Whether the answer came from no-AI, search, offline pack, local placeholder, or cloud placeholder
- Offline pack version/date/signature field
- User feedback in localStorage

## What is estimated now

The current UI impact values are placeholders by route:

- No AI: near zero model compute
- Offline: near zero network/cloud compute
- Search: web-connected estimate
- Local: local model estimate
- Cloud: cloud model estimate

These should be treated as directional labels, not audited measurements.

## Near-term production estimates

For v0.2/v0.3, Tilth can estimate:

- **Latency** with `performance.now()` and server timestamps
- **Cloud tokens** from model provider responses
- **Cloud cost** from provider pricing tables
- **Local runtime** from request duration
- **Network transfer** from server response sizes and browser Performance API where available

Energy and carbon estimates should use:

```text
energy = runtime_or_tokens × model_or_device_coefficient
carbon = energy × regional_grid_factor
water = energy × water_intensity_factor
```

The coefficient source should be shown on a methodology page before public claims become specific.

## Steward hardware measurement

The Steward device can eventually move local inference from estimated to measured by reading power draw from a hardware monitor IC.

That would allow:

- measured watts during inference
- measured watt-hours per local request
- measured idle versus active draw

Water and carbon would still be estimated from electricity source unless Tilth controls the full power supply chain.

## Search route

Search impact is not currently measured. The prototype records provider and duration. Production should estimate network and provider impact conservatively and label it as an estimate.

## Cloud route

Cloud impact should never be shown as measured unless the provider returns auditable per-request energy/water/carbon data.

Production cloud receipts should include:

- provider
- model
- input tokens
- output tokens
- money cost
- estimated energy
- estimated carbon
- estimated water

## Quality measurement

Impact is only useful if the answer is good enough. Tilth should track:

- thumbs up/down
- route correction
- whether the user escalated from local to cloud
- whether search results were opened

This data should be local by default and opt-in before aggregation.

