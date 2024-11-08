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

      const scanType = scan_id.startsWith("VID") ? "VID" : scan_id.startsWith("UJN") ? "UJN" : "BNK"

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ id: user_id }, { googleId: user_id }],
        },
      })

      if (!user) {
        return c.json({ message: "User not found" }, 404)
      }

      const previousScan = await prisma.scanMetric.findFirst({
        where: {
          userId: user.id,
          scanId: scan_id,
        },
        select: {
          scanXP: true,
        },
      })

      const scanMetric = await prisma.scanMetric.create({
        data: {
          userId: user.id,
          scanId: scan_id,
          subject,
          scanType,
          scanXP: Number(scan_xp),
        },
      })

      if (!scanMetric) {
        return c.json({ message: "Failed to create scan metric" }, 400)
      }

      if (previousScan && (previousScan.scanXP ?? 0) >= scan_xp) {
        return c.json(
          {
            status: "duplicate",
            message: "Duplicate scan metric",
            data: scanMetric,
          },
          201
        )
      } else {
        return c.json(
          {
            status: "success",
            message: "Scan metric created/updated",
            data: scanMetric,
          },
          201
        )
      }
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)
