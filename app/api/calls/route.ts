import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId parameter." }, { status: 400 })
    }

    // Get any active/ringing calls involving the user
    const calls = await query(
      `SELECT id, caller_id as "callerId", receiver_id as "receiverId", type, status,
              start_time as "startTime", end_time as "endTime", offer, answer, ice_candidates as "iceCandidates"
       FROM calls
       WHERE (caller_id = $1 OR receiver_id = $1) AND status IN ('ringing', 'ongoing')
       ORDER BY start_time DESC`,
      [userId]
    )

    return NextResponse.json({ success: true, calls })
  } catch (error: any) {
    console.error("Calls GET error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, callId, callerId, receiverId, type, offer, answer, candidate } = await request.json()

    if (!action) {
      return NextResponse.json({ success: false, error: "Missing action parameter." }, { status: 400 })
    }

    // 1. Start Call
    if (action === "start") {
      if (!callerId || !receiverId || !type || !offer) {
        return NextResponse.json({ success: false, error: "Missing start call parameters." }, { status: 400 })
      }

      const id = callId || `call_${Date.now()}`
      await query(
        `INSERT INTO calls (id, caller_id, receiver_id, type, status, start_time, offer, ice_candidates)
         VALUES ($1, $2, $3, $4, 'ringing', $5, $6, '[]'::jsonb)`,
        [id, callerId, receiverId, type, Date.now(), JSON.stringify(offer)]
      )

      return NextResponse.json({ success: true, callId: id })
    }

    // 2. Answer Call
    if (action === "answer") {
      if (!callId || !answer) {
        return NextResponse.json({ success: false, error: "Missing answer call parameters." }, { status: 400 })
      }

      await query(
        "UPDATE calls SET answer = $1, status = 'ongoing' WHERE id = $2",
        [JSON.stringify(answer), callId]
      )

      return NextResponse.json({ success: true })
    }

    // 3. Submit ICE Candidate
    if (action === "submitIce") {
      if (!callId || !candidate) {
        return NextResponse.json({ success: false, error: "Missing ICE candidate parameters." }, { status: 400 })
      }

      const records = await query("SELECT ice_candidates FROM calls WHERE id = $1", [callId])
      if (records.length === 0) {
        return NextResponse.json({ success: false, error: "Call not found." }, { status: 404 })
      }

      let candidates = records[0].ice_candidates || []
      if (typeof candidates === "string") {
        candidates = JSON.parse(candidates)
      }

      candidates.push(candidate)

      await query(
        "UPDATE calls SET ice_candidates = $1 WHERE id = $2",
        [JSON.stringify(candidates), callId]
      )

      return NextResponse.json({ success: true })
    }

    // 4. End Call
    if (action === "end") {
      if (!callId) {
        return NextResponse.json({ success: false, error: "Missing callId parameter." }, { status: 400 })
      }

      await query(
        "UPDATE calls SET status = 'ended', end_time = $1 WHERE id = $2",
        [Date.now(), callId]
      )

      return NextResponse.json({ success: true })
    }

    // 5. Reject Call
    if (action === "reject") {
      if (!callId) {
        return NextResponse.json({ success: false, error: "Missing callId parameter." }, { status: 400 })
      }

      await query(
        "UPDATE calls SET status = 'rejected', end_time = $1 WHERE id = $2",
        [Date.now(), callId]
      )

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 })
  } catch (error: any) {
    console.error("Calls POST error:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}
