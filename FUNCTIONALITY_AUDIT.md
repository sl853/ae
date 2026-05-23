# Tilth Functionality Audit — pre-backend

Status: working scope check for the local router/backend build.

## What people actually need Tilth to handle

Priority 1:
- Search answers with sources: current facts, prices, weather, public records, citations.
- Email and writing: draft, rewrite, summarize, tone, translate.
- Health navigation: explain terms, prepare doctor questions, find trusted sources. No pretend diagnosis.
- Maps and local logistics: directions, hours, nearby places, weather, appointments.
- Photos, files, and documents: find, group, summarize, and explain private material locally.
- Calendar, reminders, and household admin: lists, forms, recipes, school/admin tasks.
- Privacy plumbing: offline, local device, encryption, VPN, private servers, visible status.
- Offline packs: emergency, repair, civic, health, and small-business reference bundles.

Low priority by design:
- Gossip
- Infinite social feeds
- Roleplay
- Celebrity churn
- Engagement bait

Tilth can answer low-priority queries when asked, but the product should not optimize around them.

## What the prototype can do now

- Route deterministic math to no-AI local tools.
- Route current facts, maps/local, health, and low-priority web topics to search.
- Route email, writing, documents, files, photos, calendar, and lists to local/private handling.
- Route emergency/offline terms to the local offline pack.
- Route strategic/high-reasoning work to cloud with approval.
- Show privacy level and active privacy layers in the Responsible Compute panel.

## Backend challenges before tonight

1. Search needs a real provider.
   - Current fallback works for a prototype, but production should use Brave, Kagi, SearXNG, or another stable search API.

2. Health needs source allowlists.
   - Do not use generic web ranking alone for medical questions.
   - Start with NIH, CDC, MedlinePlus, Mayo/Cleveland-style sources, FDA labels, and official provider pages.

3. Maps needs a separate tool path.
   - Search can fake it, but real maps require Google Maps, Apple Maps, Mapbox, OpenStreetMap/Nominatim, or a local business data provider.

4. Local AI is not connected yet.
   - Tonight's backend can expose the route contract, but true offline answers need Ollama, llama.cpp, WebLLM, or another local model runtime.

5. Photos/files/calendar require permissions.
   - Desktop/mobile app work is required. A static website cannot responsibly access local archives, calendars, or camera rolls.

6. Privacy stack must be factual.
   - Only light up layers that are actually active.
   - Private server and VPN should stay visible but inactive until implemented.

7. Quality needs feedback.
   - Add answer feedback and route correction logs before training any classifier.

## Recommended backend order

1. Keep `/route` as the single source of truth.
2. Add stable `/search` provider config.
3. Add `/health-search` or source filtering for health queries.
4. Add `/local` connector placeholder, then Ollama/llama.cpp.
5. Add `/offline` signed-pack metadata and source display.
6. Add a receipt object to every answer: route, provider, privacy layers, energy estimate, sources, confidence.
7. Add local feedback/correction logs.

## Product rule

The user should get the answer first. The route receipt should exist, but stay quiet unless the user asks to inspect it.
