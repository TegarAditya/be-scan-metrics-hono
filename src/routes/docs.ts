import { apiReference } from "@scalar/hono-api-reference"
import { Hono } from "hono"

const docs = new Hono()

docs.get(
  "/",
  apiReference({
    theme: "kepler",
    spec: {
      url: "/openapi.json",
    },
  })
)

export default docs
