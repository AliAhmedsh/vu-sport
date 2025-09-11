// Event-sourced log/DB server writing to: C:\\Users\\afzaa\\vu-sports-society\\db\\db.log

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.LOG_SERVER_PORT ? Number(process.env.LOG_SERVER_PORT) : 5555;
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DB_DIR = path.join(PROJECT_ROOT, 'db');
const DB_FILE = path.join(DB_DIR, 'db.log');

function ensureFiles() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '', 'utf8');
}

function appendLine(line) {
  fs.appendFileSync(DB_FILE, line.endsWith('\n') ? line : line + '\n', 'utf8');
}

function readLines() {
  try {
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return content.split(/\n/).filter(Boolean);
  } catch {
    return [];
  }
}

function rebuildState() {
  const lines = readLines();
  let users = [];
  let teams = [];
  for (const l of lines) {
    try {
      const ev = JSON.parse(l);
      if (ev.type === 'saveUsers' && Array.isArray(ev.payload?.users)) {
        users = ev.payload.users;
      }
      if (ev.type === 'saveTeams' && Array.isArray(ev.payload?.teams)) {
        teams = ev.payload.teams;
      }
    } catch {}
  }
  return { users, teams };
}

const server = http.createServer((req, res) => {
  // CORS for convenience
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204; return res.end();
  }

  // POST /event -> append { time, type, payload }
  if (req.method === 'POST' && req.url === '/event') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const entry = { time: new Date().toISOString(), type: data.type, payload: data.payload };
        appendLine(JSON.stringify(entry));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // GET /db -> reconstruct state and return { users, teams }
  if (req.method === 'GET' && req.url === '/db') {
    const state = rebuildState();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, ...state }));
  }

  // Backwards-compat raw logger: POST /log { line }
  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const line = payload.line || JSON.stringify(payload);
        appendLine(line);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Not found' }));
});

ensureFiles();
server.listen(PORT, () => {
  console.log(`[log-server] Listening on http://127.0.0.1:${PORT}`);
  console.log(`[log-server] Writing to ${DB_FILE}`);
});
