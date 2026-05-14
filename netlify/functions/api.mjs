import { lessons, quiz } from "../../data/dari-content.mjs";

let progress = { completedLessons: [], quizAttempts: [], streak: 0 };

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)
  };
}

function parseBody(event) {
  if (!event.body) return {};

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  return JSON.parse(rawBody || "{}");
}

function apiPath(event) {
  const splat = event.pathParameters?.splat;
  if (splat) return `/api/${splat.replace(/^\/+/, "")}`;

  return event.path
    .replace(/^\/\.netlify\/functions\/api\/?/, "/api/")
    .replace(/\/$/, "");
}

export async function handler(event) {
  try {
    const path = apiPath(event);

    if (event.httpMethod === "GET" && path === "/api/lessons") {
      return json(200, lessons);
    }

    if (event.httpMethod === "GET" && path === "/api/quiz") {
      return json(200, quiz);
    }

    if (event.httpMethod === "GET" && path === "/api/progress") {
      return json(200, progress);
    }

    if (event.httpMethod === "POST" && path === "/api/progress/lesson") {
      const body = parseBody(event);
      if (!lessons.some((lesson) => lesson.id === body.lessonId)) {
        return json(400, { error: "Unknown lesson." });
      }

      progress = {
        ...progress,
        completedLessons: Array.from(new Set([...progress.completedLessons, body.lessonId])),
        streak: Math.max(progress.streak || 0, 1)
      };

      return json(200, progress);
    }

    if (event.httpMethod === "POST" && path === "/api/progress/quiz") {
      const body = parseBody(event);
      progress = {
        ...progress,
        quizAttempts: [
          {
            score: Number(body.score || 0),
            total: Number(body.total || 0),
            date: new Date().toISOString()
          },
          ...progress.quizAttempts
        ].slice(0, 10),
        streak: Math.max(progress.streak || 0, 1)
      };

      return json(200, progress);
    }

    return json(404, { error: "API route not found." });
  } catch (error) {
    return json(500, { error: error.message });
  }
}
