import { Database } from "./types"
import { createPool } from "mysql2"
import { Kysely, MysqlDialect } from "kysely"

const dialect = new MysqlDialect({
  pool: createPool({
    uri: process.env.KYSELY_DATABASE_URL,
    connectionLimit: 10,
  }),
})

export const kysely = new Kysely<Database>({
  dialect,
})
