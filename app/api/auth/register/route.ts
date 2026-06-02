import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: Request) {
  try {
    const { name, email, password, avatar } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()])
    if (existingUsers.length > 0) {
      return NextResponse.json({ success: false, error: "User already exists." }, { status: 400 })
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const hashedPassword = hashPassword(password)
    const userAvatar = avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`

    // Insert user into database
    await query(
      `INSERT INTO users (id, name, email, password, avatar, online, last_seen) 
       VALUES ($1, $2, $3, $4, $5, true, $6)`,
      [userId, name, email.toLowerCase(), hashedPassword, userAvatar, Date.now()]
    )

    const user = {
      id: userId,
      name,
      email: email.toLowerCase(),
      avatar: userAvatar,
      online: true,
      lastSeen: Date.now(),
      status: "available",
      darkMode: false,
      notifications: true,
    }

    return NextResponse.json({ success: true, user })
  } catch (error: any) {
    console.error("Registration API error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}
