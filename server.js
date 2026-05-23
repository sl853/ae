const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT || 4180);
const startedAt = new Date();

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

function answerPayload({ route, answer, sources = [], receipt = {}, meta = {} }) {
  return {
    route,
    answer,
    sources,
    receipt: {
      route,
      confidence: receipt.confidence || 'medium',
      impact: receipt.impact || 'estimated',
      measured: receipt.measured || false,
      ...receipt
    },
    meta
  };
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

  if (/\b(symptom|symptoms|diagnosis|diagnose|doctor|dentist|medication|medicine|prescription|dose|dosage|side effect|rash|fever|pain|migraine|blood pressure|lab result|test result|urgent care|er|emergency room|therapy|mental health|anxiety|depression)\b/.test(t)) {
    return {
      route: 'search',
      label: 'Health sources',
      decision: 'Health questions need grounded sources.',
      reason: 'Tilth can explain terms and prepare questions, but it should not invent medical guidance from model memory.',
      next_action: 'Fetch trusted medical sources, show them, then summarize with clear limits and escalation language.',
      confidence: 'medium-high',
      requires_approval: false
    };
  }

  if (/\b(map|maps|directions|traffic|route to|near me|nearby|address of|open(ing)? hours|weather|forecast|appointment|pharmacy|restaurant|store|gas station|parking)\b/.test(t)) {
    return {
      route: 'search',
      label: 'Maps/local',
      decision: 'A location tool is the right route.',
      reason: 'Places, hours, routes, traffic, and weather change. A model should not guess.',
      next_action: 'Use search/maps data first, then summarize only what the source returns.',
      confidence: 'medium-high',
      requires_approval: false
    };
  }

  if (/\b(gossip|celebrity|celebrity news|tiktok drama|instagram drama|viral drama|who is dating|breakup rumor|scandal|influencer)\b/.test(t)) {
    return {
      route: 'search',
      label: 'Low-priority web',
      decision: 'Search is enough for entertainment churn.',
      reason: 'This is usually current, low-stakes, and source-dependent. It does not need model reasoning.',
      next_action: 'Return source links plainly without turning it into an engagement surface.',
      confidence: 'medium',
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

  if (/\b(photo|photos|picture|pictures|image library|camera roll|document|documents|pdf|receipt|receipts|file|files|folder|archive|calendar|reminder|reminders|to[- ]?do|todo|shopping list|packing list|school form|form)\b/.test(t)) {
    return {
      route: 'local',
      label: 'Local tools',
      decision: 'Local tools are the right first route.',
      reason: 'This asks Tilth to organize or retrieve private personal material. The archive should not leave the device by default.',
      next_action: 'Use local file, calendar, photo, or document connectors. Escalate only with explicit approval.',
      confidence: 'medium',
      requires_approval: false
    };
  }

  if (/\b(write|draft|rewrite|summari[sz]e|outline|explain|brainstorm|name (ideas|suggestions)|translate|polish|edit|tone|email|letter|plan|recipe|story|poem|caption|help me|how do i)\b/.test(t)) {
    return {
      route: 'local',
      label: 'Local AI',
      decision: 'Local AI is the right first route.',
      reason: 'This is drafting, rewriting, or shaping. It does not need the open web by default.',
      next_action: 'Keep the request on the device. Escalate only if the user asks for stronger reasoning.',
      confidence: 'medium',
      requires_approval: false
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

function flattenDuckTopics(topics, out = []) {
  for (const topic of topics || []) {
    if (topic.Text && topic.FirstURL) out.push({ title: topic.Text.split(' - ')[0], url: topic.FirstURL, snippet: topic.Text });
    if (topic.Topics) flattenDuckTopics(topic.Topics, out);
  }
  return out;
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeDuckUrl(value) {
  const raw = stripHtml(value);
  try {
    const parsed = new URL(raw, 'https://duckduckgo.com');
    const uddg = parsed.searchParams.get('uddg');
    return uddg ? decodeURIComponent(uddg) : parsed.href;
  } catch {
    return raw;
  }
}

async function searchDuckDuckGoHtml(query) {
  const url = new URL('https://html.duckduckgo.com/html/');
  url.searchParams.set('q', query);

  const started = Date.now();
  const response = await fetch(url, {
    headers: {
      'Accept': 'text/html',
      'User-Agent': 'TilthPrototype/0.1 (+https://sl853.github.io/ae/)'
    }
  });
  if (!response.ok) throw new Error(`DuckDuckGo HTML returned ${response.status}`);
  const html = await response.text();
  const blocks = html.match(/<div class="result[\s\S]*?<\/div>\s*<\/div>/g) || [];
  const sources = [];

  for (const block of blocks) {
    const link = block.match(/<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
    if (!link) continue;
    const snippet = block.match(/<a[^>]+class="result__snippet"[\s\S]*?>([\s\S]*?)<\/a>|<div[^>]+class="result__snippet"[\s\S]*?>([\s\S]*?)<\/div>/);
    sources.push({
      title: stripHtml(link[2]),
      url: decodeDuckUrl(link[1]),
      snippet: stripHtml(snippet?.[1] || snippet?.[2] || '')
    });
    if (sources.length >= 5) break;
  }

  return answerPayload({
    route: 'search',
    answer: sources.length ? sources[0].snippet || sources[0].title : 'I found no strong web results for that.',
    sources,
    receipt: {
      confidence: sources.length ? 'medium' : 'low',
      impact: 'web search estimate',
      measured: false,
      provider: 'DuckDuckGo HTML fallback',
      duration_ms: Date.now() - started
    },
    meta: { provider: 'duckduckgo-html-fallback', query, prototype_fallback: true }
  });
}

async function searchWithBrave(query) {
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return null;

  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', query);
  url.searchParams.set('count', '5');
  url.searchParams.set('text_decorations', 'false');
  url.searchParams.set('safesearch', 'moderate');

  const started = Date.now();
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': key
    }
  });
  if (!response.ok) throw new Error(`Brave Search returned ${response.status}`);
  const data = await response.json();
  const results = (data.web?.results || []).slice(0, 5).map(result => ({
    title: result.title,
    url: result.url,
    snippet: result.description || ''
  }));

  return answerPayload({
    route: 'search',
    answer: results.length ? results[0].snippet || results[0].title : 'I found no strong web results for that.',
    sources: results,
    receipt: {
      confidence: results.length ? 'medium-high' : 'low',
      impact: 'web search estimate',
      measured: false,
      provider: 'Brave Search',
      duration_ms: Date.now() - started
    },
    meta: { provider: 'brave', query }
  });
}

async function searchWithDuckDuckGo(query) {
  const url = new URL('https://api.duckduckgo.com/');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('no_html', '1');
  url.searchParams.set('skip_disambig', '1');

  const started = Date.now();
  const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!response.ok) throw new Error(`DuckDuckGo returned ${response.status}`);
  const data = await response.json();
  const related = flattenDuckTopics(data.RelatedTopics).slice(0, 5);
  const sources = [];
  if (data.AbstractURL && data.AbstractText) {
    sources.push({ title: data.Heading || query, url: data.AbstractURL, snippet: data.AbstractText });
  }
  sources.push(...related);

  const answer = data.Answer || data.AbstractText || data.Definition || (sources.length ? sources[0].snippet : 'I could not find a direct instant answer. Add a Brave Search API key for full web results.');

  if (!sources.length && !data.Answer && !data.AbstractText && !data.Definition) {
    return searchDuckDuckGoHtml(query);
  }

  return answerPayload({
    route: 'search',
    answer,
    sources: sources.slice(0, 5),
    receipt: {
      confidence: sources.length || data.Answer ? 'medium' : 'low',
      impact: 'instant-answer estimate',
      measured: false,
      provider: 'DuckDuckGo Instant Answer',
      duration_ms: Date.now() - started
    },
    meta: { provider: 'duckduckgo-instant-answer', query, full_web_search: false }
  });
}

async function searchWeb(query) {
  const trimmed = String(query || '').trim();
  if (!trimmed) {
    return answerPayload({
      route: 'search',
      answer: 'Type a search query first.',
      sources: [],
      receipt: { confidence: 'low', impact: 'none', measured: true },
      meta: { provider: 'none' }
    });
  }

  const brave = await searchWithBrave(trimmed);
  if (brave) return brave;
  return searchWithDuckDuckGo(trimmed);
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

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (url.pathname === '/route') {
      sendJson(res, 200, classify(url.searchParams.get('q') || ''));
      return;
    }

    if (url.pathname === '/health') {
      sendJson(res, 200, {
        ok: true,
        name: 'tilth-router-prototype',
        version: '0.1.0',
        started_at: startedAt.toISOString(),
        uptime_seconds: Math.round(process.uptime()),
        connectors: {
          route: true,
          search: true,
          search_provider: process.env.BRAVE_SEARCH_API_KEY ? 'brave' : 'duckduckgo-fallback',
          offline: true,
          local_ai: false,
          cloud_ai: false
        }
      });
      return;
    }

    if (url.pathname === '/search') {
      sendJson(res, 200, await searchWeb(url.searchParams.get('q') || ''));
      return;
    }

    if (url.pathname === '/offline') {
      sendJson(res, 200, searchOffline(url.searchParams.get('q') || ''));
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, {
      error: error.message,
      route: url.pathname.replace('/', '') || 'static'
    });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Tilth router prototype running at http://127.0.0.1:${port}`);
});
