import { Hono } from "hono"
import {
  createUser,
  getUserById,
  updateUser,
  getAllUserRankWithXP,
  getUserScanRankByID,
} from "../handlers/user"
import { createScanMetric } from "../handlers/scan-metric"
import { createSeason, getCurrentSeason, getSeason } from "../handlers/season"

const api = new Hono()

api.post("/user", ...createUser)
api.get("/user/rank", ...getAllUserRankWithXP)
api.put("/user/:id", ...updateUser)
api.get("/user/:id", ...getUserById)
api.get("/user/:id/rank", ...getUserScanRankByID)

api.post("/metric", ...createScanMetric)

api.get("/season", ...getSeason)
api.get("/season/current", ...getCurrentSeason)
api.post("/season", ...createSeason)

export default api
