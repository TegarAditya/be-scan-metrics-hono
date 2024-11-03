import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { createFactory } from "hono/factory"
import { prisma } from "../libs/prisma"

const factory = createFactory()

// POST /api/metric
export const createScanMetric = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      user_id: z.string(),
      scan_id: z.string(),
      subject: z.string(),
      scan_type: z.enum(["VID", "BNK", "UJN"]),
      scan_xp: z.coerce.number(),
    })
  ),
  async (c) => {
    try { 
      const body = await c.req.json()

      const userId = typeof body.user_id === "string" ? body.user_id : ""
      const scanId = typeof body.scan_id === "string" ? body.scan_id : ""
      const subject = typeof body.subject === "string" ? body.subject : ""
      const scanType = scanId.startsWith("VID") ? "VID" : scanId.startsWith("BNK") ? "BNK" : "UJN"
      const scanXP = typeof body.scan_xp === "number" ? body.scan_xp : 0

      const scanMetric = await prisma.scanMetric.create({
        data: {
          userId,
          scanId,
          subject,
          scanType,
          scanXP,
        },
      })

      if (!scanMetric) {
        return c.json({ message: "Failed to create scan metric" }, 400)
      }

      return c.json(scanMetric, 201)
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)
