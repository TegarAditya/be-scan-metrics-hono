import { createFactory } from "hono/factory"
import { prisma } from "../libs/prisma"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"

const factory = createFactory()

// GET /api/season
export const getSeason = factory.createHandlers(async (c) => {
  try {
    const seasons = await prisma.season.findMany({
      select: {
        name: true,
        code: true,
        startAt: true,
        endAt: true,
      },
    })

    return c.json(seasons)
  } catch (error: any) {
    return c.json({ message: error.message }, 500)
  }
})

// GET /api/season/current
export const getCurrentSeason = factory.createHandlers(async (c) => {
  try {
    const season = await prisma.season.findFirst({
      select: {
        name: true,
        code: true,
        startAt: true,
        endAt: true,
      },
      where: {
        startAt: { lte: new Date() },
        endAt: { gte: new Date() },
      },
      orderBy: { id: "desc" },
    })

    if (!season) {
      return c.json({ message: "No active season" }, 404)
    }

    return c.json(season)
  } catch (error: any) {
    return c.json({ message: error.message }, 500)
  }
})

// POST /api/season
export const createSeason = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      code: z.string(),
      name: z.string(),
      startAt: z.date(),
      endAt: z.date(),
    })
  ),
  async (c) => {
    try {
      const body = await c.req.json()
      const season = await prisma.season.create({
        data: {
          code: body.code,
          name: body.name,
          startAt: body.startAt,
          endAt: body.endAt,
        },
      })

      return c.json(season)
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)
