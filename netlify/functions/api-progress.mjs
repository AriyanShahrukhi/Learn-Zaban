import { getStore } from "@netlify/blobs"

const DEFAULT_PROGRESS = { completedLessons: [], quizAttempts: [], streak: 0 }

export default async () => {
  const store = getStore("progress")
  const progress = await store.get("user", { type: "json" })
  return Response.json(progress ?? DEFAULT_PROGRESS)
}

export const config = {
  path: "/api/progress",
  method: "GET"
}
