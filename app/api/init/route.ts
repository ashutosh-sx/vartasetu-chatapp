import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  try {
    // 1. Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar TEXT,
        status VARCHAR(50) DEFAULT 'available',
        online BOOLEAN DEFAULT false,
        last_seen BIGINT DEFAULT 0,
        dark_mode BOOLEAN DEFAULT false,
        notifications BOOLEAN DEFAULT true,
        typing JSONB DEFAULT '{}'
      );
    `)

    // Ensure typing column exists if users table was already created
    try {
      await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS typing JSONB DEFAULT '{}';`)
    } catch (e) {
      console.log("Could not alter users table (might already have typing column):", e)
    }

    // 2. Create contacts table
    await query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        contact_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL
      );
    `)

    // 3. Create messages table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(255) PRIMARY KEY,
        sender_id VARCHAR(255) NOT NULL,
        receiver_id VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        edited BOOLEAN DEFAULT false,
        read BOOLEAN DEFAULT false,
        delivered BOOLEAN DEFAULT false,
        conversation_id VARCHAR(255) NOT NULL,
        reactions JSONB DEFAULT '{}',
        type VARCHAR(50) DEFAULT 'text',
        file_url TEXT,
        file_name VARCHAR(255),
        file_size BIGINT,
        file_mime_type VARCHAR(100)
      );
    `)

    // 4. Create calls table
    await query(`
      CREATE TABLE IF NOT EXISTS calls (
        id VARCHAR(255) PRIMARY KEY,
        caller_id VARCHAR(255) NOT NULL,
        receiver_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        start_time BIGINT NOT NULL,
        end_time BIGINT,
        offer JSONB,
        answer JSONB,
        ice_candidates JSONB DEFAULT '[]'
      );
    `)

    return NextResponse.json({ success: true, message: "Database schema initialized successfully." })
  } catch (error: any) {
    console.error("Failed to initialize database schema:", error)
    return NextResponse.json({ success: false, error: error.message || error }, { status: 500 })
  }
}
