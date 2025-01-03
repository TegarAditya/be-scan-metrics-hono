import { Hono } from "hono"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { secureHeaders } from "hono/secure-headers"
import { trimTrailingSlash } from "hono/trailing-slash"
import { serveStatic } from "hono/bun"
import { basicAuth } from "hono/basic-auth"
import api from "./routes/api"
import docs from "./routes/docs"
import healthcheck from "./routes/healthcheck"

const app = new Hono()

app.use(logger()).use(cors()).use(secureHeaders()).use(trimTrailingSlash())

app.use("/*", serveStatic({ root: "./static/" }))
app.use("/docs/*", basicAuth({ username: "admin", password: String(process.env.DOCS_PASSWORD) }))

app.route("/api", api)
app.route("/docs", docs)
app.route("/healthcheck", healthcheck)

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
}
