# Tilth Router Prototype

Tilth is a local-first AI routing prototype. The static site works on GitHub Pages, but real search and offline-pack answers require the local Node server.

## Run locally

```powershell
cd C:\Users\rlewi\OneDrive\Desktop\aethernet\ae
npm start
```

Open:

```text
http://127.0.0.1:4180/
```

## What works now

- No-AI calculator route
- Search route through `/search`
- Offline knowledge-pack lookup through `/offline`
- Route explanations hidden behind Advanced
- Quiet answer receipts
- Local feedback stored in `localStorage`

## Search

The server checks `BRAVE_SEARCH_API_KEY`.

- If present, `/search` uses Brave Search API.
- If absent, `/search` uses DuckDuckGo Instant Answer.
- If Instant Answer is thin, it falls back to a prototype DuckDuckGo HTML parser.

The DuckDuckGo HTML fallback is for local prototype work only. Production should use Brave, Kagi, SearXNG, or a dedicated search service.

## Endpoints

```text
GET /health
GET /route?q=...
GET /search?q=...
GET /offline?q=...
```

## Files

- `index.html` — answer-first prototype UI
- `server.js` — local router/search/offline server
- `data/offline-pack.json` — demo offline knowledge pack
- `ROUTER_SPEC.md` — route contract and roadmap
- `METHODOLOGY.md` — impact measurement notes

## Production notes

GitHub Pages cannot run the Node endpoints. To make the public site fully functional, deploy `server.js` or equivalent API routes on a backend host, then point the frontend at that API.

