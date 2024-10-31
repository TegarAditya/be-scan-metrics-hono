import { Selectable } from "kysely"

export interface Database {
  mapel: MapelTable
}

export interface MapelTable {
  idMapel: number
  idJenjang: number
  idKelas: number
  namaMapel: string
}

export type Mapel = Selectable<MapelTable>
