import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, displayName, role, language } = await request.json()

    // Validate required fields
    if (!email || !password || !username || !displayName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    const db = await getDatabase()
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Create new user
    const user = await createUser({
      email,
      password,
      username,
      displayName,
      role: role || "buyer",
      language: language || "en",
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "User created successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
