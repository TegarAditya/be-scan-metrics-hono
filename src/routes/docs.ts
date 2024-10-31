import { apiReference } from "@scalar/hono-api-reference"
import { Hono } from "hono"

const docs = new Hono()

docs.get(
  "/",
  apiReference({
    theme: "purple",
    spec: {
      url: "/openapi.json",
    },
  })
)

export default docs
