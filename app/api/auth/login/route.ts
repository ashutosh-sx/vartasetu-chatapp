import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 })
    }

    // Check if user exists
    const users = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()])
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 })
    }

    const userRecord = users[0]
    const hashedPassword = hashPassword(password)

    if (userRecord.password !== hashedPassword) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 })
    }

    // Update user status to online
    await query(
      "UPDATE users SET online = true, last_seen = $1 WHERE id = $2",
      [Date.now(), userRecord.id]
    )

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      avatar: userRecord.avatar,
      online: true,
      lastSeen: Date.now(),
      status: userRecord.status,
      darkMode: userRecord.dark_mode,
      notifications: userRecord.notifications,
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error("Login API error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}
