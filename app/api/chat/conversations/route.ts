import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    // Get conversations where user is a participant
    const conversations = await db
      .collection("conversations")
      .aggregate([
        {
          $match: {
            participants: userId,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "participants",
            foreignField: "_id",
            as: "participantDetails",
          },
        },
        {
          $lookup: {
            from: "chatMessages",
            let: { conversationId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$conversationId", "$$conversationId"] } } },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: "lastMessage",
          },
        },
        {
          $addFields: {
            lastMessage: { $arrayElemAt: ["$lastMessage", 0] },
            unreadCount: {
              $size: {
                $filter: {
                  input: "$messages",
                  cond: {
                    $and: [{ $ne: ["$$this.senderId", userId] }, { $eq: ["$$this.readAt", null] }],
                  },
                },
              },
            },
          },
        },
        {
          $sort: { updatedAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Conversations fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { participantId } = await request.json()

    if (!ObjectId.isValid(participantId)) {
      return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)
    const otherUserId = new ObjectId(participantId)

    // Check if conversation already exists
    const existingConversation = await db.collection("conversations").findOne({
      participants: { $all: [userId, otherUserId] },
    })

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation._id })
    }

    // Create new conversation
    const conversation = {
      participants: [userId, otherUserId],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("conversations").insertOne(conversation)

    return NextResponse.json({ conversationId: result.insertedId })
  } catch (error) {
    console.error("Conversation creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
