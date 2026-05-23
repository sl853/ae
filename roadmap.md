# Tilth Product Roadmap
### v0.1 → v0.3 — Working document

---

**Status:** Draft · 2026.05  
**Principle:** Ship small, ship honest, ship deliberately.

---

## v0.1 — Foundation
*Current · Web prototype*

The goal of v0.1 is to prove the concept, establish the design language, and validate the core thesis: that people will respond to an AI product built around restraint and honesty.

### Deliverables
- [x] Single-page HTML prototype (index.html)
- [x] Responsible Compute panel with live mode switching
- [x] Intent classifier — routes to local, search, cloud, or offline
- [x] Router spec — documented route schema and connector plan (ROUTER_SPEC.md)
- [x] No AI route — local calculator execution with route receipt
- [x] Slow update settings UI
- [x] Steward device concept illustration
- [x] Multi-page website (index, product, about)
- [x] Project manifesto (manifesto.md)
- [ ] Pitch one-pager for potential collaborators
- [ ] Basic brand identity (wordmark, color system, type system)

### Success criteria
- The prototype clearly communicates the "appropriate use" thesis
- Design language feels calm, trustworthy, and different from conventional AI products
- A reader can articulate the product's position in one sentence after five minutes on the site

---

## v0.2 — Working product
*Target: 3–6 months*

The goal of v0.2 is to build a real working version of the console — with actual local inference, real routing logic, and a genuine responsible compute panel — without relying on cloud AI as the default.

### Deliverables

**Core functionality**
- [ ] Local inference engine — quantized 7B model running on-device
- [ ] Real router API — implements ROUTER_SPEC.md as a backend contract
- [ ] Real intent classifier — upgrades regex prototype with a lightweight classifier when correction data exists
- [ ] Live routing — actual requests routed to local AI, search API, or cloud AI based on classification
- [ ] Real compute metrics — actual energy and time measurement per request (carbon/water remain estimates)
- [ ] Audit log — local JSON log of every request, routing decision, and response

**Knowledge & updates**
- [ ] First knowledge pack — general-purpose local knowledge bundle
- [ ] Signed update system — basic bundle format with cryptographic verification
- [ ] Weekly bundle cadence — first slow-update release

**Interface**
- [ ] Electron or Tauri desktop app (Windows + Mac)
- [ ] Offline mode — full functionality without internet connection
- [ ] Responsible Dashboard — usage, routing history, environmental estimates over time
- [ ] Settings — update cadence, cloud opt-in, audit log viewer

**Content & community**
- [ ] Tilth website — publicly accessible (GitHub Pages or similar)
- [ ] Waitlist for Steward hardware concept
- [ ] First public writing on the "appropriate use" thesis

### Success criteria
- A user can ask a question and receive a real answer routed by the classifier
- The routing decision is always visible and overridable
- Offline mode works without internet for common tasks
- At least one external person calls Tilth "the only AI that tells me when not to use AI"

---

## v0.3 — Steward hardware
*Target: 9–18 months*

The goal of v0.3 is to produce a working Steward hardware prototype — a physical local AI appliance that a household, studio, or small business can set up and use without technical expertise.

### Deliverables

**Hardware**
- [ ] Steward One hardware design — compact, low-power, silent
- [ ] On-device inference — quantized model running on dedicated silicon
- [ ] Internal SSD — encrypted at rest, expandable
- [ ] Ethernet + WiFi — cloud connection optional and announced
- [ ] Low-power idle — ≈ 8 W idle, ≈ 35 W active target
- [ ] USB sideload port — for offline bundle installation

**Software**
- [ ] Steward OS — lightweight Linux-based system with Tilth console built in
- [ ] Local archive — private document store, searchable without cloud
- [ ] Knowledge pack system — swappable domain packs (medical basics, education, civic)
- [ ] OTA update system — signed weekly bundles, verified before install
- [ ] Cloud handoff protocol — explicit user notification before any data leaves the device
- [ ] Web interface — browser-based console accessible from devices on local network

**Distribution**
- [ ] Tilth update network — first version of low-bandwidth signed bundle distribution
- [ ] First hardware batch — limited run for pilot users (families, studios, one school)
- [ ] Education pack — first curriculum-aligned knowledge bundle for schools

**Community & business**
- [ ] Pricing model — hardware purchase, no subscription required for local mode
- [ ] Optional cloud tier — explicit opt-in, visible cost, monthly cap option
- [ ] Pilot program — 10–20 households, studios, or schools as initial users

### Success criteria
- A non-technical user can set up Steward without IT assistance
- The device works offline for common household tasks
- Pilot users report feeling more in control of their AI use
- At least one school or library uses Steward as their primary AI tool
- A pilot user says: "It told me to use Google instead, and that's why I trust it."

---

## Beyond v0.3 — Long-term vision

- **Tilth network** — a one-way distribution network for signed AI bundles, knowledge packs, and civic information; designed for low bandwidth and intermittent connectivity
- **Emergency resilience packs** — offline-first knowledge for natural disaster response, local public safety, and community coordination
- **Steward One Pro** — version for clinics, small businesses, and schools with larger local storage and multi-user audit log
- **Open bundle format** — allow third parties to create and sign knowledge packs for the Tilth network
- **Rural connectivity program** — partnership with libraries, community centers, and municipal networks to distribute Steward at reduced cost

---

## What we are not building

- A general-purpose cloud AI with a privacy badge
- A product that optimizes for engagement or AI usage volume
- A subscription service that requires ongoing cloud payment for basic functionality
- A device that collects telemetry, behavioral data, or usage analytics without explicit consent
- A faster, cheaper version of the products we are critiquing

---

*Tilth · Roadmap v0.1 · 2026*  
*This document is a working draft. All timelines and specifications are estimates.*
