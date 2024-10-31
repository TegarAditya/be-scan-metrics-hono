import { z } from "zod"
import { kysely } from "../libs/kysely"

export const SubjectEnum = z.enum(["MATEMATIKA", "BAHASA_INDONESIA", "BAHASA_INGGRIS"])

export type SubjectName = z.infer<typeof SubjectEnum>
export type SubjectProperties = { idMapel: number }

let SubjectMap = new Map<SubjectName, SubjectProperties[]>()

const fetchSubjectData = async (subject: SubjectName, likePattern: string) => {
  return await kysely
    .selectFrom("mapel")
    .select("idMapel")
    .where("mapel.namaMapel", "like", likePattern)
    .execute()
}

export const setSubjectMap = async () => {
  const subjects: { name: SubjectName; pattern: string }[] = [
    { name: "MATEMATIKA", pattern: "MATEMATIKA%" },
    { name: "BAHASA_INDONESIA", pattern: "BAHASA INDONESIA" },
    { name: "BAHASA_INGGRIS", pattern: "BAHASA INGGRIS" },
  ]

  for (const { name, pattern } of subjects) {
    const data = await fetchSubjectData(name, pattern)
    SubjectMap.set(name, data)
  }
}

export const getSubjectMap = async (subject: SubjectName) => {
  if (SubjectMap.size === 0) await setSubjectMap()
  return SubjectMap.get(subject)?.map((s: SubjectProperties) => s.idMapel.toString())
}
