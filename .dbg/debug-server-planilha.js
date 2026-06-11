const http = require("http");
const fs = require("fs");
const path = require("path");

const session = "planilha-liberar-erro";
const outdir = path.join(process.cwd(), ".dbg");
const logFile = path.join(outdir, `trae-debug-log-${session}.ndjson`);
const envFile = path.join(outdir, `${session}.env`);
const port = 7777;

fs.mkdirSync(outdir, { recursive: true });
fs.writeFileSync(logFile, "");
fs.writeFileSync(
  envFile,
  `DEBUG_SERVER_URL=http://127.0.0.1:${port}/event\nDEBUG_SESSION_ID=${session}\n`,
);

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    return res.end(JSON.stringify({ ok: true, session, port }));
  }

  if (req.method === "GET" && req.url === "/logs") {
    res.writeHead(200, {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    });
    return res.end(fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8") : "");
  }

  if (req.method === "DELETE" && req.url === "/logs") {
    fs.writeFileSync(logFile, "");
    res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
    return res.end();
  }

  if (req.method === "POST" && req.url === "/event") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        const event = JSON.parse(body || "{}");
        if (!event.ts) event.ts = Date.now();
        fs.appendFileSync(logFile, `${JSON.stringify(event)}\n`);
        res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
        res.end();
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        });
        res.end(JSON.stringify({ error: String(error) }));
      }
    });
    return;
  }

  res.writeHead(404, { "Access-Control-Allow-Origin": "*" });
  res.end("not found");
});

server.listen(port, "127.0.0.1", () => {
  console.log(`debug-server ${session} http://127.0.0.1:${port}`);
});
