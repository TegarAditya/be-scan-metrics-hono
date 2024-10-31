import { Hono } from "hono";
import { createUser, getUserScanXP, getUserById, updateUser } from "../handlers/user";
import { createScanMetric } from "../handlers/scanMetric";

const api = new Hono()

api.post("/user", ...createUser)
api.put("/user/:id", ...updateUser)
api.get("/user/:id", ...getUserById)
api.get("/user/:id/xp", ...getUserScanXP)

api.post("/metric", ...createScanMetric)

export default api