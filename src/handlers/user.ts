import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { createFactory } from "hono/factory"
import {
  getUserRankWithXp,
  getUserRankWithXpById,
  getUserSubjectRankWithXp,
  getUserSubjectRankWithXpById,
} from "@prisma/client/sql"
import { prisma } from "../libs/prisma"
import { getCurrentSeason } from "../utils/season"
import { SubjectEnum, SubjectName } from "../utils/subject"
import { getSubjectEnumPattern } from "../enums/subject-enum"

const factory = createFactory()

const parseUserData = (body: any, isUpdate = false) => ({
  googleId: typeof body.googleId === "string" ? body.googleId : isUpdate ? undefined : null,
  email: typeof body.email === "string" ? body.email : isUpdate ? undefined : "",
  password: typeof body.password === "string" ? body.password : isUpdate ? undefined : null,
  name: typeof body.name === "string" ? body.name : isUpdate ? undefined : null,
  avatar: typeof body.avatar === "string" ? body.avatar : isUpdate ? undefined : null,
  school: typeof body.school === "string" ? body.school : isUpdate ? undefined : null,
  class: typeof body.class === "number" ? body.class : isUpdate ? undefined : 1,
  provinceId: typeof body.province_id === "number" ? body.province_id : isUpdate ? undefined : 0,
  cityId: typeof body.city_id === "number" ? body.city_id : isUpdate ? undefined : 0,
})

// POST /api/user
export const createUser = factory.createHandlers(
  zValidator(
    "json",
    z.object({
      googleId: z.string(),
      email: z.string().email(),
      password: z.string().optional(),
      name: z.string(),
      class: z.coerce.number().min(1).max(12).default(1),
      avatar: z.string().optional(),
      school: z.string(),
      province_id: z.coerce.number(),
      city_id: z.coerce.number(),
    })
  ),
  async (c) => {
    try {
      const body = await c.req.json()

      const userData = parseUserData(body)

      const user = await prisma.user.create({ data: userData })

      if (!user) {
        return c.json({ message: "Failed to create user" }, 400)
      }

      return c.json(user, 201)
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)

// PUT /api/user/:id
export const updateUser = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  zValidator(
    "json",
    z.object({
      googleId: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().optional(),
      name: z.string().optional(),
      class: z.coerce.number().min(1).max(12).optional(),
      avatar: z.string().optional(),
      school: z.string().optional(),
      province_id: z.coerce.number().optional(),
      city_id: z.coerce.number().optional(),
    })
  ),
  async (c) => {
    try {
      const { id } = c.req.param()
      const body = await c.req.json()
      const userData = parseUserData(body, true)

      const updateUser = await prisma.user.updateMany({
        where: {
          OR: [{ id }, { googleId: id }],
        },
        data: userData,
      })

      if (!updateUser) {
        return c.json({ message: "Failed to update user" }, 400)
      }

      const updatedUser = await prisma.user.findMany({
        where: {
          OR: [{ id }, { googleId: id }],
        },
      })

      return c.json(updatedUser, 200)
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)

// GET /api/user/:id
export const getUserById = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    try {
      const id = c.req.param("id")

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ id }, { googleId: id }],
        },
      })

      if (!user) {
        return c.json({ message: "User not found" }, 404)
      }

      return c.json(user)
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)

// GET /api/user/:id/xp
/** @deprecated */
export const getUserScanXPByID = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  zValidator("query", z.object({ subject: SubjectEnum.optional() })),
  async (c) => {
    try {
      const id = c.req.param("id")
      const subject = c.req.query("subject") as SubjectName

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ id }, { googleId: id }],
        },
        select: { id: true },
      })

      if (!user) {
        return c.json({ message: "User not found" }, 404)
      }

      const scanXP = await prisma.scanMetric.aggregate({
        _sum: {
          scanXP: true,
        },
        where: {
          userId: user?.id,
          subject,
          createdAt: {
            gte: await getCurrentSeason().then((s) => s?.startAt),
            lte: await getCurrentSeason().then((s) => s?.endAt),
          },
        },
      })

      if (!scanXP._sum.scanXP) {
        return c.json({ scanXP: 0 }, 200)
      }

      return c.json(scanXP._sum, 200)
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)

// GET /api/user/rank
export const getAllUserRankWithXP = factory.createHandlers(
  zValidator(
    "query",
    z.object({
      subject: SubjectEnum.optional(),
      limit: z.coerce.number().optional(),
    })
  ),
  async (c) => {
    try {
      const subject = c.req.query("subject") as SubjectName

      const subjectPattern = (): string => {
        switch (subject) {
          case "MATEMATIKA":
            return getSubjectEnumPattern("Matematika")
          case "BAHASA_INDONESIA":
            return getSubjectEnumPattern("BahasaIndonesia")
          case "BAHASA_INGGRIS":
            return getSubjectEnumPattern("BahasaInggris")
          default:
            return ".*"
        }
      }

      const limit = Number(c.req.query("limit") || 100)

      const startDate = "2024-07-01"
      const endDate = "2024-11-30"

      const resolver = subject
        ? getUserSubjectRankWithXp(subjectPattern(), startDate, endDate, limit)
        : getUserRankWithXp(startDate, endDate, limit)

      const userRank = await prisma.$queryRawTyped(resolver)

      if (!userRank) {
        return c.json({ message: "No user found" }, 404)
      }

      const result = userRank.map(({ id, avatar, name, scan_xp_total, rank }) => ({
        id: String(id),
        avatar: avatar ? String(avatar) : null,
        name: String(name),
        xp: Math.floor(Number(scan_xp_total)),
        rank: scan_xp_total ? Number(rank) : null,
      }))

      return c.json(result, 200)
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)

// GET /api/user/:id/rank
export const getUserScanRankByID = factory.createHandlers(
  zValidator("param", z.object({ id: z.string() })),
  zValidator("query", z.object({ subject: SubjectEnum.optional() })),
  async (c) => {
    try {
      const id = c.req.param("id")

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ id }, { googleId: id }],
        },
        select: {
          id: true,
        },
      })

      if (!user) {
        return c.json({ message: "User not found" }, 404)
      }

      const subject = c.req.query("subject") as SubjectName

      const subjectPattern = (): string => {
        switch (subject) {
          case "MATEMATIKA":
            return getSubjectEnumPattern("Matematika")
          case "BAHASA_INDONESIA":
            return getSubjectEnumPattern("BahasaIndonesia")
          case "BAHASA_INGGRIS":
            return getSubjectEnumPattern("BahasaInggris")
          default:
            return ".*"
        }
      }

      const currentSeason = await getCurrentSeason()

      const startDate = currentSeason ? currentSeason.startAt.toISOString() : "2024-07-01"
      const endDate = currentSeason ? currentSeason.endAt.toISOString() : "2024-11-30"

      const resolver = subject
        ? getUserSubjectRankWithXpById(subjectPattern(), startDate, endDate, user.id)
        : getUserRankWithXpById(startDate, endDate, user.id)

      const rank = await prisma.$queryRawTyped(resolver)

      const result = rank.map(({ id, name, scan_xp_total, rank }) => ({
        id: String(id),
        name: String(name),
        xp: Math.floor(Number(scan_xp_total)),
        rank: scan_xp_total ? Number(rank) : null,
      }))

      return c.json(result[0], 200)
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)
