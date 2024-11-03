import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { createFactory } from "hono/factory"
import { prisma } from "../libs/prisma"
import { getCurrentSeason } from "../utils/season"
import { SubjectEnum, SubjectName } from "../utils/subject"

const factory = createFactory()

const parseUserData = (body: any, isUpdate = false) => ({
  googleId: typeof body.googleId === "string" ? body.googleId : isUpdate ? undefined : null,
  email: typeof body.email === "string" ? body.email : isUpdate ? undefined : "",
  password: typeof body.password === "string" ? body.password : isUpdate ? undefined : null,
  name: typeof body.name === "string" ? body.name : isUpdate ? undefined : null,
  avatar: typeof body.avatar === "string" ? body.avatar : isUpdate ? undefined : null,
  school: typeof body.school === "string" ? body.school : isUpdate ? undefined : null,
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
      class: z.coerce.number().min(1).max(12),
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
  zValidator("param", z.object({ id: z.coerce.number() })),
  zValidator(
    "json",
    z.object({
      googleId: z.string().optional(),
      email: z.string().email().optional(),
      password: z.string().optional(),
      name: z.string().optional(),
      class: z.coerce.number().min(1).max(12),
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

      const user = await prisma.user.update({
        where: { id },
        data: userData,
      })

      if (!user) {
        return c.json({ message: "Failed to update user" }, 400)
      }

      return c.json(user, 200)
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
export const getUserScanXP = factory.createHandlers(
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
        select: {
          id: true,
        },
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

export const getUserScanRank = factory.createHandlers(
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
        select: {
          id: true,
        },
      })

      if (!user) {
        return c.json({ message: "User not found" }, 404)
      }

      const rank = await prisma.scanMetric.count({
        where: {
          subject,
          createdAt: {
            gte: await getCurrentSeason().then((s) => s?.startAt),
            lte: await getCurrentSeason().then((s) => s?.endAt),
          },
        },
      })

      return c.json(rank, 200)
    } catch (error: any) {
      return c.json({ message: error.message }, 500)
    }
  }
)
