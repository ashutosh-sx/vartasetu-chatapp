import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { id, name, email, avatar } = await request.json()

    if (!id || !name || !email) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 })
    }

    const userId = id.startsWith("google_") ? id : `google_${id}`
    const userAvatar = avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`

    // Check if user already exists
    const users = await query("SELECT * FROM users WHERE id = $1", [userId])

    if (users.length > 0) {
      // User exists - update online presence and last_seen
      await query(
        "UPDATE users SET online = true, last_seen = $1 WHERE id = $2",
        [Date.now(), userId]
      )
      
      const existingUser = users[0]
      const user = {
        id: userId,
        name: existingUser.name,
        email: existingUser.email,
        avatar: existingUser.avatar || userAvatar,
        online: true,
        lastSeen: Date.now(),
        status: existingUser.status || "available",
        darkMode: existingUser.dark_mode || false,
        notifications: existingUser.notifications !== false,
      }
      return NextResponse.json({ success: true, user })
    }

    // New Google User - create record in database
    await query(
      `INSERT INTO users (id, name, email, password, avatar, online, last_seen, status, dark_mode, notifications) 
       VALUES ($1, $2, $3, 'google_authenticated_oauth', $4, true, $5, 'available', false, true)`,
      [userId, name, email.toLowerCase(), userAvatar, Date.now()]
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
    console.error("Google Auth API error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}
