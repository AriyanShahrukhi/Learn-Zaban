import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { lessons, quiz } from "./data/dari-content.mjs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const progressFile = path.join(dataDir, "progress.json");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

async function readProgress() {
  if (!existsSync(progressFile)) {
    return { completedLessons: [], quizAttempts: [], streak: 0 };
  }

  return JSON.parse(await readFile(progressFile, "utf8"));
}

async function saveProgress(progress) {
  await writeFile(progressFile, JSON.stringify(progress, null, 2));
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString() || "{}");
}

async function handleApi(request, response) {
  if (request.method === "GET" && request.url === "/api/lessons") {
    return sendJson(response, 200, lessons);
  }

  if (request.method === "GET" && request.url === "/api/quiz") {
    return sendJson(response, 200, quiz);
  }

  if (request.method === "GET" && request.url === "/api/progress") {
    return sendJson(response, 200, await readProgress());
  }

  if (request.method === "POST" && request.url === "/api/progress/lesson") {
    const body = await readRequestBody(request);
    const progress = await readProgress();
    if (!lessons.some((lesson) => lesson.id === body.lessonId)) {
      return sendJson(response, 400, { error: "Unknown lesson." });
    }
    progress.completedLessons = Array.from(new Set([...progress.completedLessons, body.lessonId]));
    progress.streak = Math.max(progress.streak || 0, 1);
    await saveProgress(progress);
    return sendJson(response, 200, progress);
  }

  if (request.method === "POST" && request.url === "/api/progress/quiz") {
    const body = await readRequestBody(request);
    const progress = await readProgress();
    progress.quizAttempts = [
      {
        score: Number(body.score || 0),
        total: Number(body.total || 0),
        date: new Date().toISOString()
      },
      ...progress.quizAttempts
    ].slice(0, 10);
    progress.streak = Math.max(progress.streak || 0, 1);
    await saveProgress(progress);
    return sendJson(response, 200, progress);
  }

  sendJson(response, 404, { error: "API route not found." });
}

async function serveStatic(request, response) {
  const requestedUrl = new URL(request.url, `http://${request.headers.host}`);
  const normalized = path.normalize(decodeURIComponent(requestedUrl.pathname));
  const relativePath = normalized === "/" ? "index.html" : normalized.replace(/^\/+/, "");
  const filePath = path.join(publicDir, relativePath);

  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(content);
  } catch {
    const fallback = await readFile(path.join(publicDir, "index.html"));
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(fallback);
  }
}

const server = createServer(async (request, response) => {
  try {
    if (request.url.startsWith("/api/")) {
      await handleApi(request, response);
      return;
    }
    await serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Learn Dari is running at http://${host}:${port}`);
});
