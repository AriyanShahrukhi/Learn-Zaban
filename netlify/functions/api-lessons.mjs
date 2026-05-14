import { lessons } from "../../data/dari-content.mjs"

export default async () => {
  return Response.json(lessons)
}

export const config = {
  path: "/api/lessons",
  method: "GET"
}
