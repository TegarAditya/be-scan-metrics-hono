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

      const previousScan = await prisma.scanMetric.aggregate({
        where: {
          userId: user.id,
          scanId: scan_id,
        },
        _max: {
          scanXP: true,
        },
      })

      const newScanMetric = await prisma.scanMetric.create({
        data: {
          userId: user.id,
          scanId: scan_id,
          subject,
          scanType,
          scanXP: Number(scan_xp),
        },
      })

      if (!newScanMetric) {
        return c.json({ message: "Failed to create scan metric" }, 400)
      }

      const previousScanXP = previousScan?._max?.scanXP ?? 0
      const pointsAdded = scan_xp - previousScanXP

      const responseStatus = previousScanXP >= scan_xp ? "duplicate" : "success"
      const responseMessage =
        previousScanXP >= scan_xp ? "Duplicate scan metric" : "Scan metric created/updated"

      return c.json(
        {
          status: responseStatus,
          message: responseMessage,
          data: {
            ...newScanMetric,
            pointsAdded: pointsAdded < 0 ? 0 : Math.floor(pointsAdded),
          },
        },
        201
      )
    } catch (error) {
      console.error("Error creating scan metric:", error)
      return c.json({ message: "Internal Server Error" }, 500)
    }
  }
)
