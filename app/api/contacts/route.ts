import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId parameter." }, { status: 400 })
    }

    // Get all contacts of the user and join the peer user details
    const contactsList = await query(
      `SELECT c.id, c.user_id as "userId", c.contact_id as "contactId", c.status,
              u.name, u.email, u.avatar, u.online, u.status as "userStatus", u.last_seen as "lastSeen", u.typing
       FROM contacts c
       JOIN users u ON c.contact_id = u.id
       WHERE c.user_id = $1`,
      [userId]
    )

    const mappedContacts = contactsList.map((c: any) => {
      let isTyping = false
      if (c.typing) {
        const typingObj = typeof c.typing === "string" ? JSON.parse(c.typing) : c.typing
        isTyping = !!typingObj[userId]
      }
      return {
        id: c.id,
        userId: c.userId,
        contactId: c.contactId,
        status: c.status,
        name: c.name,
        email: c.email,
        avatar: c.avatar,
        online: c.online,
        userStatus: c.userStatus,
        lastSeen: c.lastSeen,
        typing: isTyping
      }
    })

    // Parse the lists into their corresponding statuses for the frontend
    // Frontend expects structured Contact arrays
    const contacts = mappedContacts.filter((c: any) => c.status === "accepted")
    const sentRequests = mappedContacts.filter((c: any) => c.status === "sent")
    const receivedRequests = mappedContacts.filter((c: any) => c.status === "pending")
    const blockedContacts = mappedContacts.filter((c: any) => c.status === "blocked")

    return NextResponse.json({
      success: true,
      contacts,
      sentRequests,
      receivedRequests,
      blockedContacts,
    })
  } catch (error: any) {
    console.error("Contacts GET error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, userId, email, contactId } = await request.json()

    if (!action || !userId) {
      return NextResponse.json({ success: false, error: "Missing action or userId parameter." }, { status: 400 })
    }

    // 1. Add contact / Send request
    if (action === "add") {
      if (!email) {
        return NextResponse.json({ success: false, error: "Missing email parameter." }, { status: 400 })
      }

      // Check if target user exists
      const targetUsers = await query("SELECT id, name, email, avatar FROM users WHERE email = $1", [email.toLowerCase()])
      if (targetUsers.length === 0) {
        return NextResponse.json({ success: false, error: "User not found with this email." }, { status: 404 })
      }

      const targetUser = targetUsers[0]

      if (targetUser.id === userId) {
        return NextResponse.json({ success: false, error: "You cannot add yourself as a contact." }, { status: 400 })
      }

      // Check if contact already exists
      const existing = await query(
        "SELECT * FROM contacts WHERE user_id = $1 AND contact_id = $2",
        [userId, targetUser.id]
      )

      if (existing.length > 0) {
        return NextResponse.json({ success: false, error: "Contact relationship already exists." }, { status: 400 })
      }

      // Insert sent record for sender
      const sentId = `contact_sent_${Date.now()}`
      await query(
        "INSERT INTO contacts (id, user_id, contact_id, status) VALUES ($1, $2, $3, 'sent')",
        [sentId, userId, targetUser.id]
      )

      // Insert pending record for receiver
      const pendingId = `contact_pending_${Date.now()}`
      await query(
        "INSERT INTO contacts (id, user_id, contact_id, status) VALUES ($1, $2, $3, 'pending')",
        [pendingId, targetUser.id, userId]
      )

      return NextResponse.json({ success: true, message: "Contact request sent successfully." })
    }

    // 2. Accept contact request
    if (action === "accept") {
      if (!contactId) {
        return NextResponse.json({ success: false, error: "Missing contactId parameter." }, { status: 400 })
      }

      // Update both records to accepted
      await query(
        "UPDATE contacts SET status = 'accepted' WHERE user_id = $1 AND contact_id = $2",
        [userId, contactId]
      )

      await query(
        "UPDATE contacts SET status = 'accepted' WHERE user_id = $1 AND contact_id = $2",
        [contactId, userId]
      )

      return NextResponse.json({ success: true, message: "Contact request accepted." })
    }

    // 3. Reject / Delete / Cancel contact
    if (action === "delete" || action === "reject") {
      if (!contactId) {
        return NextResponse.json({ success: false, error: "Missing contactId parameter." }, { status: 400 })
      }

      // Delete both records
      await query(
        "DELETE FROM contacts WHERE (user_id = $1 AND contact_id = $2) OR (user_id = $2 AND contact_id = $1)",
        [userId, contactId]
      )

      return NextResponse.json({ success: true, message: "Contact deleted/rejected successfully." })
    }

    // 4. Block contact
    if (action === "block") {
      if (!contactId) {
        return NextResponse.json({ success: false, error: "Missing contactId parameter." }, { status: 400 })
      }

      // Set A's record to blocked, delete B's record (or also set to blocked)
      // Standard: User A blocks B. B cannot see A. A sees B as blocked.
      await query(
        "UPDATE contacts SET status = 'blocked' WHERE user_id = $1 AND contact_id = $2",
        [userId, contactId]
      )
      
      // Remove B's record so they can't message A anymore
      await query(
        "DELETE FROM contacts WHERE user_id = $1 AND contact_id = $2",
        [contactId, userId]
      )

      return NextResponse.json({ success: true, message: "Contact blocked." })
    }

    // 5. Unblock contact
    if (action === "unblock") {
      if (!contactId) {
        return NextResponse.json({ success: false, error: "Missing contactId parameter." }, { status: 400 })
      }

      // Restore to accepted (or re-establish link)
      await query(
        "UPDATE contacts SET status = 'accepted' WHERE user_id = $1 AND contact_id = $2",
        [userId, contactId]
      )

      // Recreate B's record as accepted
      const restoredId = `contact_restored_${Date.now()}`
      await query(
        "INSERT INTO contacts (id, user_id, contact_id, status) VALUES ($1, $2, $3, 'accepted')",
        [restoredId, contactId, userId]
      )

      return NextResponse.json({ success: true, message: "Contact unblocked." })
    }

    // 6. Update status / presence / dark mode
    if (action === "updateSettings") {
      const { status, darkMode, notifications, typing, online } = await request.json()
      
      if (status !== undefined) {
        await query("UPDATE users SET status = $1, last_seen = $2 WHERE id = $3", [status, Date.now(), userId])
      }
      
      if (darkMode !== undefined) {
        await query("UPDATE users SET dark_mode = $1 WHERE id = $2", [darkMode, userId])
      }
      
      if (notifications !== undefined) {
        await query("UPDATE users SET notifications = $1 WHERE id = $2", [notifications, userId])
      }

      if (typing !== undefined) {
        await query("UPDATE users SET typing = $1 WHERE id = $2", [JSON.stringify(typing), userId])
      }

      if (online !== undefined) {
        await query("UPDATE users SET online = $1, last_seen = $2 WHERE id = $3", [online, Date.now(), userId])
      } else {
        // Also mark as online since they are actively updating settings
        await query("UPDATE users SET online = true, last_seen = $1 WHERE id = $2", [Date.now(), userId])
      }

      return NextResponse.json({ success: true, message: "Settings updated." })
    }

    return NextResponse.json({ success: false, error: "Invalid action parameter." }, { status: 400 })
  } catch (error: any) {
    console.error("Contacts POST error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}
