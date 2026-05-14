import { quiz } from "../../data/dari-content.mjs"

export default async () => {
  return Response.json(quiz)
}

export const config = {
  path: "/api/quiz",
  method: "GET"
}
