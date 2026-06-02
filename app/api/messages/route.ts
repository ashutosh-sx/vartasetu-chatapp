import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId parameter." }, { status: 400 })
    }

    // Get all messages involving the user
    const messages = await query(
      `SELECT id, sender_id as "senderId", receiver_id as "receiverId", text, timestamp, edited, read, delivered,
              conversation_id as "conversationId", reactions, type,
              file_url as "fileUrl", file_name as "fileName", file_size as "fileSize", file_mime_type as "fileMimeType"
       FROM messages
       WHERE sender_id = $1 OR receiver_id = $1
       ORDER BY timestamp ASC`,
      [userId]
    )

    // Mark user as active/online
    await query("UPDATE users SET online = true, last_seen = $1 WHERE id = $2", [Date.now(), userId])

    return NextResponse.json({ success: true, messages })
  } catch (error: any) {
    console.error("Messages GET error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, messageId, senderId, receiverId, text, conversationId, type, fileUrl, fileName, fileSize, fileMimeType, reaction, userId } = await request.json()

    if (!action) {
      return NextResponse.json({ success: false, error: "Missing action parameter." }, { status: 400 })
    }

    // 1. Send Message
    if (action === "send") {
      if (!senderId || !receiverId || !conversationId) {
        return NextResponse.json({ success: false, error: "Missing message parameters." }, { status: 400 })
      }

      const id = messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      const timestamp = Date.now()
      const msgText = text || ""
      const msgType = type || "text"
      const reactions = {}

      await query(
        `INSERT INTO messages (id, sender_id, receiver_id, text, timestamp, edited, read, delivered, conversation_id, reactions, type, file_url, file_name, file_size, file_mime_type)
         VALUES ($1, $2, $3, $4, $5, false, false, true, $6, $7, $8, $9, $10, $11, $12)`,
        [id, senderId, receiverId, msgText, timestamp, conversationId, JSON.stringify(reactions), msgType, fileUrl || null, fileName || null, fileSize || null, fileMimeType || null]
      )

      const newMessage = {
        id,
        senderId,
        receiverId,
        text: msgText,
        timestamp,
        edited: false,
        read: false,
        delivered: true,
        conversationId,
        reactions,
        type: msgType,
        fileUrl,
        fileName,
        fileSize,
        fileMimeType
      }

      return NextResponse.json({ success: true, message: newMessage })
    }

    // 2. Edit Message
    if (action === "edit") {
      if (!messageId || text === undefined) {
        return NextResponse.json({ success: false, error: "Missing edit parameters." }, { status: 400 })
      }

      await query(
        "UPDATE messages SET text = $1, edited = true WHERE id = $2",
        [text, messageId]
      )

      return NextResponse.json({ success: true })
    }

    // 3. Delete Message
    if (action === "delete") {
      if (!messageId) {
        return NextResponse.json({ success: false, error: "Missing messageId parameter." }, { status: 400 })
      }

      await query("DELETE FROM messages WHERE id = $1", [messageId])
      return NextResponse.json({ success: true })
    }

    // 4. React to Message
    if (action === "react") {
      if (!messageId || !userId || !reaction) {
        return NextResponse.json({ success: false, error: "Missing reaction parameters." }, { status: 400 })
      }

      // Fetch existing reactions
      const records = await query("SELECT reactions FROM messages WHERE id = $1", [messageId])
      if (records.length === 0) {
        return NextResponse.json({ success: false, error: "Message not found." }, { status: 404 })
      }

      let reactions = records[0].reactions || {}
      if (typeof reactions === "string") {
        reactions = JSON.parse(reactions)
      }

      // Toggle or set reaction
      if (reactions[userId] === reaction) {
        delete reactions[userId]
      } else {
        reactions[userId] = reaction
      }

      await query("UPDATE messages SET reactions = $1 WHERE id = $2", [JSON.stringify(reactions), messageId])
      return NextResponse.json({ success: true, reactions })
    }

    // 5. Mark messages as read
    if (action === "markRead") {
      if (!senderId || !receiverId) {
        return NextResponse.json({ success: false, error: "Missing senderId or receiverId parameters." }, { status: 400 })
      }

      // Mark messages sent by senderId to receiverId as read
      await query(
        "UPDATE messages SET read = true WHERE sender_id = $1 AND receiver_id = $2 AND read = false",
        [senderId, receiverId] // senderId is contactId, receiverId is user.id
      )

      return NextResponse.json({ success: true })
    }

    // 6. Delete entire chat history
    if (action === "clearHistory") {
      if (!conversationId) {
        return NextResponse.json({ success: false, error: "Missing conversationId parameter." }, { status: 400 })
      }

      await query("DELETE FROM messages WHERE conversation_id = $1", [conversationId])
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 })
  } catch (error: any) {
    console.error("Messages POST error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}
