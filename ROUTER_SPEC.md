# Tilth Router Spec

Version: v0.1  
Status: prototype contract  
Purpose: decide when to use no AI, local AI, search, cloud AI, or offline knowledge before compute is spent.

## Product thesis

Tilth is not a model company. Tilth is the judgment layer in front of models, search, local tools, and signed knowledge packs.

The router should answer four questions before every request:

1. Is AI needed at all?
2. If AI is useful, can it stay local?
3. If the web is needed, should search happen before AI?
4. If cloud AI is justified, what will it cost in privacy, money, energy, water, and carbon?

## Routes

### none

Use for deterministic tasks where a direct tool is better than a model.

Examples:
- calculator math
- unit conversion
- timers
- date differences
- simple formatting

Connector:
- local JavaScript / native utility function

User promise:
- no model
- no network
- zero cloud cost

### local

Use for private shape work that does not require current facts.

Examples:
- rewrite an email
- summarize pasted text
- brainstorm names
- draft an outline
- explain a stable concept

Connector:
- v0 mock receipt
- later Ollama, llama.cpp, or local system model

User promise:
- data stays on device by default
- cloud escalation requires visible approval

### search

Use when facts need to be current, sourced, or exact.

Examples:
- weather
- prices
- news
- people and company facts
- opening hours
- citations
- public records

Connector:
- v0 source-first handoff receipt
- later Brave Search, SerpAPI, Kagi, SearXNG, or a self-hosted search layer

User promise:
- source pages first
- AI summarizes only after sources are visible

### cloud

Use when stronger reasoning, larger context, or specialist capability is worth the cost.

Examples:
- strategy tradeoffs
- legal or financial analysis drafts
- architecture decisions
- complex comparisons
- long-context synthesis

Connector:
- v0 approval receipt
- later OpenAI, Anthropic, Gemini, or LiteLLM broker

User promise:
- cloud is opt-in and visible
- provider, estimated cost, and impact are shown first

### offline

Use when the answer should come from a signed local bundle.

Examples:
- emergency reference
- civic information
- school/library packs
- medical basics
- local manuals

Connector:
- v0 bundle lookup receipt
- later local SQLite/Fuse index over signed knowledge packs

User promise:
- bundle date and signature are visible
- no network required
- web verification offered only if connected

## Response schema

```json
{
  "route": "none | local | search | cloud | offline",
  "label": "No AI needed",
  "decision": "No AI is the best route.",
  "reason": "The answer is deterministic. A calculator beats a probabilistic model.",
  "next_action": "Run the direct tool locally.",
  "confidence": "high",
  "impact": {
    "privacy": "No sharing",
    "energy": "None",
    "water": "None",
    "carbon": "0.0 g CO2e",
    "money": "$0.00"
  },
  "fallback": "local AI if the direct tool fails",
  "requires_approval": false,
  "receipt_id": "local-only"
}
```

## Rule order

Rules should run from least expensive to most expensive:

1. Empty or unclear request -> ready state
2. Deterministic utility -> none
3. Current/source-specific fact -> search
4. Offline reference pattern -> offline
5. Private shape work -> local
6. Complex reasoning or high-stakes analysis -> cloud approval
7. Unknown -> local first, then reassess

This order matters. Search should not catch a calculator expression just because it contains a percent sign. Cloud should not catch a private rewrite just because it sounds important.

## Classifier plan

Tilth does not need a custom LLM for v0.

The first router can be:
- keyword and pattern rules
- direct utility detectors
- confidence scores
- user correction buttons

Later, Tilth can add a small classifier trained on routing corrections:

```text
input: user request + selected route + correction
output: route probability distribution
```

This would be a small classifier, not a full language model.

## User correction loop

Every routed request should eventually allow:

- "This should have been search"
- "This should have stayed local"
- "This did not need AI"
- "Cloud was worth it"
- "Cloud was not worth it"

Corrections improve the router without training on private content. Store only:

- route selected
- correction selected
- coarse request category
- optional user-approved example

## Current prototype

The live `index.html` prototype currently includes:

- live route classification
- No AI local calculator execution
- search handoff receipt
- cloud approval receipt
- offline bundle receipt
- local model placeholder receipt
- compute impact display

## Next build steps

1. Expand No AI tools:
   - date math
   - unit conversion
   - simple percentages
   - word and character count

2. Add real search:
   - create `/route`
   - create `/search`
   - return source titles, URLs, snippets, and timestamps

3. Add cloud approval:
   - provider selection
   - estimated token cost
   - visible handoff modal

4. Add local model connector:
   - Ollama first
   - small default model
   - local-only logging

5. Add signed bundle prototype:
   - static JSON bundle
   - signature placeholder
   - source/date display

