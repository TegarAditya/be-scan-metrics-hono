import { createFactory } from "hono/factory"
import { prisma } from "../libs/prisma"

const factory = createFactory()

// GET /api/season
export const getSeason = factory.createHandlers(async (c) => {
  try {
    const seasons = await prisma.season.findMany()

    return c.json(seasons)
  } catch (error: any) {
    return c.json({ message: error.message }, 500)
  }
})

// GET /api/season/current
export const getCurrentSeason = factory.createHandlers(async (c) => {
  try {
    const season = await prisma.season.findFirst({
      orderBy: { id: "desc" },
      where: {
        startAt: { lte: new Date() },
        endAt: { gte: new Date() },
      },
    })

    if (!season) {
      return c.json({ message: "No active season" }, 404)
    }

    return c.json(season)
  } catch (error: any) {
    return c.json({ message: error.message }, 500)
  }
})