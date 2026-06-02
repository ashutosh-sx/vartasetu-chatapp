import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("Please define the DATABASE_URL environment variable inside .env.local")
}

// Create a connectionless SQL query executor
export const sql = neon(process.env.DATABASE_URL)

/**
 * Executes a parameterized SQL query helper.
 * Returns the rows.
 */
export async function query<T = any>(queryString: string, params: any[] = []): Promise<T[]> {
  try {
    const result = await sql.query(queryString, params)
    return result as any as T[]
  } catch (error) {
    console.error("Database query error:", error, "Query:", queryString, "Params:", params)
    throw error
  }
}
