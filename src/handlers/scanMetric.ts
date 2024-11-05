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
      const { user_id, scan_id, subject, scan_xp } = await c.req.json()

      const scanType = scan_id.startsWith("VID") ? "VID" : scan_id.startsWith("BNK") ? "BNK" : "UJN"

      const scanMetric = await prisma.scanMetric.create({
        data: {
          userId: user_id,
          scanId: scan_id,
          subject,
          scanType,
          scanXP: scan_xp,
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
