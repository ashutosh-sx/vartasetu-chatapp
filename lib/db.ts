import { neon } from "@neondatabase/serverless"

const dbUrl = process.env.DATABASE_URL || ""

// Create a connectionless SQL query executor safely
export const sql = dbUrl ? neon(dbUrl) : null as any

/**
 * Executes a parameterized SQL query helper.
 * Returns the rows.
 */
export async function query<T = any>(queryString: string, params: any[] = []): Promise<T[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error("Please define the DATABASE_URL environment variable.")
  }
  try {
    const result = await sql.query(queryString, params)
    return result as any as T[]
  } catch (error) {
    console.error("Database query error:", error, "Query:", queryString, "Params:", params)
    throw error
  }
}
