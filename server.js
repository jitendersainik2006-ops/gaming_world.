const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const SCORE_FILE = path.join(DATA_DIR, "scores.json");
const PASSWORD = "222000";
const ONLINE_GAME_COUNT = 1252;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SCORE_FILE)) fs.writeFileSync(SCORE_FILE, "[]");
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on("end", () => resolve(body));
  });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const safePath = path.normalize(urlPath === "/" ? "/index.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      send(res, 404, "Not found");
      return;
    }
    send(res, 200, content, mime[path.extname(filePath)] || "application/octet-stream");
  });
}

const server = http.createServer(async (req, res) => {
  ensureDataFile();

  if (req.url === "/api/login" && req.method === "POST") {
    try {
      const payload = JSON.parse(await readBody(req));
      send(res, 200, JSON.stringify({ ok: String(payload.password || "") === PASSWORD }), "application/json; charset=utf-8");
    } catch {
      send(res, 400, JSON.stringify({ ok: false }), "application/json; charset=utf-8");
    }
    return;
  }

  if (req.url === "/api/games" && req.method === "GET") {
    send(res, 200, JSON.stringify({ localGames: 120, onlineGames: ONLINE_GAME_COUNT, passwordProtected: true }), "application/json; charset=utf-8");
    return;
  }

  if (req.url === "/api/online-games" && req.method === "GET") {
    const platforms = ["CrazyGames", "Poki", "Y8", "Itch.io", "Kongregate"];
    send(res, 200, JSON.stringify({ total: ONLINE_GAME_COUNT, platforms }), "application/json; charset=utf-8");
    return;
  }

  if (req.url === "/api/stats" && req.method === "GET") {
    const scores = JSON.parse(fs.readFileSync(SCORE_FILE, "utf8"));
    const best = scores.reduce((max, item) => Math.max(max, Number(item.score || 0)), 0);
    send(res, 200, JSON.stringify({ localGames: 120, onlineGames: ONLINE_GAME_COUNT, savedScores: scores.length, bestScore: best }), "application/json; charset=utf-8");
    return;
  }

  if (req.url === "/api/scores" && req.method === "GET") {
    send(res, 200, fs.readFileSync(SCORE_FILE, "utf8"), "application/json; charset=utf-8");
    return;
  }

  if (req.url === "/api/score" && req.method === "POST") {
    try {
      const payload = JSON.parse(await readBody(req));
      const scores = JSON.parse(fs.readFileSync(SCORE_FILE, "utf8"));
      scores.unshift({ title: String(payload.title || "Unknown Game").slice(0, 80), score: Number(payload.score || 0), date: new Date().toISOString() });
      fs.writeFileSync(SCORE_FILE, JSON.stringify(scores.slice(0, 100), null, 2));
      send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
    } catch {
      send(res, 400, JSON.stringify({ ok: false }), "application/json; charset=utf-8");
    }
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Jitender World running at http://localhost:${PORT}`);
});
