import { getConnection } from "typeorm"

export type DbContextType = { db: typeof getConnection }
