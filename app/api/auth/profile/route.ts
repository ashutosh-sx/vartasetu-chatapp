import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: Request) {
  try {
    const { action, userId, name, email, currentPassword, newPassword } = await request.json()

    if (!action || !userId) {
      return NextResponse.json({ success: false, error: "Missing action or userId parameter." }, { status: 400 })
    }

    if (action === "updateProfile") {
      if (!name || !email) {
        return NextResponse.json({ success: false, error: "Name and email are required." }, { status: 400 })
      }

      // Check if email is already taken by someone else
      const existing = await query("SELECT id FROM users WHERE email = $1 AND id != $2", [email.toLowerCase(), userId])
      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: "Email is already taken." }, { status: 400 })
      }

      await query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [name, email, userId])
      
      return NextResponse.json({ success: true, message: "Profile updated successfully." })
    }

    if (action === "changePassword") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ success: false, error: "Current password and new password are required." }, { status: 400 })
      }

      // Fetch current password
      const users = await query("SELECT password FROM users WHERE id = $1", [userId])
      if (users.length === 0) {
        return NextResponse.json({ success: false, error: "User not found." }, { status: 404 })
      }

      const currentHashed = hashPassword(currentPassword)
      if (users[0].password !== currentHashed) {
        return NextResponse.json({ success: false, error: "Current password is incorrect." }, { status: 400 })
      }

      const newHashed = hashPassword(newPassword)
      await query("UPDATE users SET password = $1 WHERE id = $2", [newHashed, userId])

      return NextResponse.json({ success: true, message: "Password updated successfully." })
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 })
  } catch (error: any) {
    console.error("Profile API error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}
