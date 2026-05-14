import { getStore } from "@netlify/blobs"

const DEFAULT_PROGRESS = { completedLessons: [], quizAttempts: [], streak: 0 }

export default async (req) => {
  const body = await req.json()

  const store = getStore("progress")
  const current = (await store.get("user", { type: "json" })) ?? DEFAULT_PROGRESS

  const updated = {
    ...current,
    quizAttempts: [
      {
        score: Number(body.score || 0),
        total: Number(body.total || 0),
        date: new Date().toISOString()
      },
      ...current.quizAttempts
    ].slice(0, 10),
    streak: Math.max(current.streak || 0, 1)
  }

  await store.setJSON("user", updated)
  return Response.json(updated)
}

export const config = {
  path: "/api/progress/quiz",
  method: "POST"
}
