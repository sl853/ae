const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 4180);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

function classify(text) {
  const t = String(text || '').toLowerCase().trim();
  if (!t) {
    return {
      route: 'local',
      label: 'Ready',
      decision: 'Ready.',
      reason: 'Tilth checks whether the request needs a model, search, cloud reasoning, an offline pack, or no AI at all.',
      next_action: 'Type a request to route it before compute is spent.',
      confidence: 'low',
      requires_approval: false
    };
  }

  if (/^[\d\s.,+\-*/x×÷=()%]+$/.test(t) || /\d+(?:\.\d+)?\s*%\s+of\s+\d+(?:\.\d+)?/.test(t)) {
    return {
      route: 'none',
      label: 'No AI needed',
      decision: 'No AI is the best route.',
      reason: 'The answer is deterministic. A calculator or rule beats a probabilistic model.',
      next_action: 'Run the direct tool locally.',
      confidence: 'high',
      requires_approval: false
    };
  }

  if (/\b(today|tonight|tomorrow|right now|currently|weather|forecast|news|headlines|score|stock|price|exchange rate|open(ing)? hours|when does|when is|address of|directions|near me|menu|showtimes)\b/.test(t) || /\$[\d,]+/.test(t)) {
    return {
      route: 'search',
      label: 'Use search',
      decision: 'Search is the right route.',
      reason: 'This depends on current or source-specific information. A model would be guessing from stale memory.',
      next_action: 'Fetch source pages first, then summarize only after sources are visible.',
      confidence: 'medium-high',
      requires_approval: false
    };
  }

  if (/\b(emergency|first aid|offline|power outage|earthquake|wildfire|hurricane|evacuation|library pack|knowledge pack|manual|stored locally)\b/.test(t)) {
    return {
      route: 'offline',
      label: 'Offline pack',
      decision: 'Offline knowledge should be checked first.',
      reason: 'This looks like durable reference information that can live in a signed bundle.',
      next_action: 'Search the local pack, show bundle date and source, then offer web verification if connected.',
      confidence: 'medium-high',
      requires_approval: false
    };
  }

  if (/\b(strategy|business plan|analyze deeply|long[- ]?term|compare options|trade[- ]?offs?|root cause|architect|design system|legal analysis|tax strategy|financial model|risk assessment|investment|acquisition)\b/.test(t)) {
    return {
      route: 'cloud',
      label: 'Deep reasoning',
      decision: 'Cloud AI may be justified.',
      reason: 'This asks for synthesis, tradeoffs, or planning that may exceed a small local model.',
      next_action: 'Ask for approval, show cost and privacy impact, then route to a cloud model if the user agrees.',
      confidence: 'medium-high',
      requires_approval: true
    };
  }

  return {
    route: 'local',
    label: 'Start local',
    decision: 'Start local, then reassess.',
    reason: 'No strong signal says this needs the web or cloud. The responsible default is local first.',
    next_action: 'Try the local model. If confidence is low, ask before search or cloud escalation.',
    confidence: 'medium',
    requires_approval: false
  };
}

function loadPack() {
  const file = path.join(root, 'data', 'offline-pack.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function searchOffline(query) {
  const pack = loadPack();
  const queryTokens = tokenize(query);
  const results = pack.entries
    .map(entry => {
      const haystack = tokenize([entry.title, entry.tags.join(' '), entry.body].join(' '));
      const score = queryTokens.reduce((sum, token) => sum + haystack.filter(item => item.includes(token)).length, 0);
      return { ...entry, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ score, ...entry }) => entry);

  return {
    pack: {
      id: pack.id,
      title: pack.title,
      version: pack.version,
      signature: pack.signature,
      updated: pack.updated,
      source_note: pack.source_note
    },
    query,
    results
  };
}

function serveStatic(req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  if (urlPath === '/') urlPath = '/index.html';
  const file = path.resolve(root, `.${urlPath}`);
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/route') {
    sendJson(res, 200, classify(url.searchParams.get('q') || ''));
    return;
  }

  if (url.pathname === '/offline') {
    sendJson(res, 200, searchOffline(url.searchParams.get('q') || ''));
    return;
  }

  serveStatic(req, res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Tilth router prototype running at http://127.0.0.1:${port}`);
});
