import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { isQuoteRequest, quote } from "./pricing.js";

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const PORT = Number(process.env.PORT) || 3000;
const MAX_BODY = 10_000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const waitlist = new Set<string>();

function send(res: ServerResponse, status: number, body: unknown): void {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
  });
  res.end(data);
}

function readJson(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    let failed = false;

    req.on("data", (chunk: Buffer) => {
      if (failed) return;
      size += chunk.length;
      if (size > MAX_BODY) {
        failed = true;
        reject(new HttpError(413, "Request body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (failed) return;
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(new HttpError(400, "Body must be valid JSON"));
      }
    });
    req.on("error", reject);
  });
}

async function serveIndex(res: ServerResponse): Promise<void> {
  let html: Buffer;
  try {
    html = await readFile(join(process.cwd(), "web", "index.html"));
  } catch {
    throw new HttpError(404, "web/index.html not found. Run from the repo root.");
  }
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": html.length,
  });
  res.end(html);
}

const server = createServer(async (req, res) => {
  try {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;
    const method = req.method ?? "GET";

    if (method === "GET" && (path === "/" || path === "/index.html")) {
      return await serveIndex(res);
    }

    if (method === "GET" && path === "/health") {
      return send(res, 200, { status: "ok", waitlist: waitlist.size });
    }

    if (method === "POST" && path === "/quote") {
      const body = await readJson(req);
      if (!isQuoteRequest(body)) {
        throw new HttpError(422, "Expected { material, strap, engraving? }");
      }
      return send(res, 200, quote(body));
    }

    if (method === "POST" && path === "/waitlist") {
      const body = await readJson(req);
      const raw = (body as { email?: unknown } | null)?.email;
      const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";
      if (!EMAIL.test(email)) throw new HttpError(422, "A valid email is required");

      const alreadyListed = waitlist.has(email);
      waitlist.add(email);
      const position = [...waitlist].indexOf(email) + 1;
      return send(res, alreadyListed ? 200 : 201, { position, alreadyListed });
    }

    throw new HttpError(404, "Not found");
  } catch (err) {
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    console.error(err);
    return send(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, () => console.log(`AURUM listening on http://localhost:${PORT}`));
