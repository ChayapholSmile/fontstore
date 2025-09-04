import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { conversationId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { conversationId } = params

    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    // Verify user is part of this conversation
    const conversation = await db.collection("conversations").findOne({
      _id: new ObjectId(conversationId),
      participants: userId,
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Get messages
    const messages = await db
      .collection("chatMessages")
      .find({ conversationId: new ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .toArray()

    // Mark messages as read
    await db.collection("chatMessages").updateMany(
      {
        conversationId: new ObjectId(conversationId),
        receiverId: userId,
        readAt: null,
      },
      {
        $set: { readAt: new Date() },
      },
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
