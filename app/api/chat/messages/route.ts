import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { ChatMessage } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { conversationId, message, messageType, paymentRequest } = await request.json()

    if (!ObjectId.isValid(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    // Get conversation to find receiver
    const conversation = await db.collection("conversations").findOne({ _id: new ObjectId(conversationId) })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const receiverId = conversation.participants.find((p: ObjectId) => !p.equals(userId))

    const chatMessage: ChatMessage = {
      conversationId: new ObjectId(conversationId),
      senderId: userId,
      receiverId,
      message,
      messageType: messageType || "text",
      paymentRequest,
      createdAt: new Date(),
    }

    const result = await db.collection("chatMessages").insertOne(chatMessage)

    // Update conversation's last activity
    await db
      .collection("conversations")
      .updateOne({ _id: new ObjectId(conversationId) }, { $set: { updatedAt: new Date() } })

    return NextResponse.json({
      message: "Message sent successfully",
      messageId: result.insertedId,
    })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
