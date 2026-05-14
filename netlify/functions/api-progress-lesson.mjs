import { getStore } from "@netlify/blobs"
import { lessons } from "../../data/dari-content.mjs"

const DEFAULT_PROGRESS = { completedLessons: [], quizAttempts: [], streak: 0 }

export default async (req) => {
  const body = await req.json()

  if (!lessons.some((lesson) => lesson.id === body.lessonId)) {
    return Response.json({ error: "Unknown lesson." }, { status: 400 })
  }

  const store = getStore("progress")
  const current = (await store.get("user", { type: "json" })) ?? DEFAULT_PROGRESS

  const updated = {
    ...current,
    completedLessons: Array.from(new Set([...current.completedLessons, body.lessonId])),
    streak: Math.max(current.streak || 0, 1)
  }

  await store.setJSON("user", updated)
  return Response.json(updated)
}

export const config = {
  path: "/api/progress/lesson",
  method: "POST"
}
