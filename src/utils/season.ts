import { prisma } from "../libs/prisma"

export const getSeasonId = async () => {
  const date = new Date()
  const season = await prisma.season.findFirst({
    where: {
      startAt: { lte: date },
      endAt: { gte: date },
    },
  })

  return season?.id
}

export const getCurrentSeason = async () => {
  const date = new Date()
  const season = await prisma.season.findFirst({
    where: {
      startAt: { lte: date },
      endAt: { gte: date },
    },
  })

  return season
}
