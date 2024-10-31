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
      class_id: z.string(),
      chapter_id: z.string(),
    })
  ),
  async (c) => {
    try {
      const body = await c.req.parseBody()

      const userId = typeof body.user_id === "string" ? body.user_id : ""
      const scanId = typeof body.scan_id === "string" ? body.scan_id : ""
      const classId = typeof body.class_id === "string" ? body.class_id : ""
      const subjectId = typeof body.subject_id === "string" ? body.subject_id : ""
      const chapterId = typeof body.chapter_id === "string" ? body.chapter_id : ""
      const scanType = scanId.startsWith("VID") ? "VID" : "UJN"

      const scanMetric = await prisma.scanMetric.create({
        data: {
          userId,
          scanId,
          classId,
          subjectId,
          chapterId,
          scanType,
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
