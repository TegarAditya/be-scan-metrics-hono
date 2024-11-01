import { Hono } from "hono";
import { createUser, getUserScanXP, getUserById, updateUser } from "../handlers/user";
import { createScanMetric } from "../handlers/scanMetric";
import { getCurrentSeason, getSeason } from "../handlers/season";

const api = new Hono()

api.post("/user", ...createUser)
api.put("/user/:id", ...updateUser)
api.get("/user/:id", ...getUserById)
api.get("/user/:id/xp", ...getUserScanXP)

api.post("/metric", ...createScanMetric)

api.get("/season", ...getSeason)
api.get("/season/current", ...getCurrentSeason)

export default api