const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || `http://localhost:${PORT}`;
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function telegram(method, payload) {
  if (!BOT_TOKEN) return null;

  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return response.json();
}

async function handleTelegramWebhook(req, res) {
  const rawBody = await readBody(req);
  const update = JSON.parse(rawBody || "{}");
  const message = update.message;

  if (!message?.chat?.id) {
    return sendJson(res, 200, { ok: true });
  }

  const text = message.text || "";
  const chatId = message.chat.id;

  if (text === "/start" || text === "/app") {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: "Life Game OS готов. Открой приложение и управляй целями, финансами, привычками и XP прямо внутри Telegram.",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open Life Game OS",
              web_app: { url: WEBAPP_URL },
            },
          ],
        ],
      },
    });
  } else {
    await telegram("sendMessage", {
      chat_id: chatId,
      text: "Нажми /app, чтобы открыть Life Game OS как Mini App.",
    });
  }

  return sendJson(res, 200, { ok: true });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, WEBAPP_URL).pathname);
  const safePath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(ROOT, safePath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      return res.end("Not found");
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/health") {
      return sendJson(res, 200, {
        ok: true,
        mode: "telegram-mini-app",
        webAppUrl: WEBAPP_URL,
      });
    }

    if (req.method === "POST" && req.url === "/api/telegram/webhook") {
      return handleTelegramWebhook(req, res);
    }

    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { ok: false, error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Life Game OS running on ${WEBAPP_URL}`);
});
