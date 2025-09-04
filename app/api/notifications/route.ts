import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await connectDB()
    const notifications = await db
      .collection("notifications")
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { type, title, message, fontId } = await request.json()

    const db = await connectDB()
    const notification = {
      userId: user.id,
      type,
      title,
      message,
      fontId: fontId || null,
      read: false,
      createdAt: new Date(),
    }

    const result = await db.collection("notifications").insertOne(notification)

    return NextResponse.json({
      success: true,
      notificationId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
