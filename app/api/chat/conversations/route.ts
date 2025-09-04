import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
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
            localField: "_id",
            foreignField: "conversationId",
            as: "messages",
          },
        },
        {
          $addFields: {
            lastMessage: { $arrayElemAt: [{ $slice: ["$messages", -1] }, 0] },
            unreadCount: {
              $size: {
                $filter: {
                  input: "$messages",
                  as: "message",
                  cond: {
                    $and: [{ $eq: ["$$message.readAt", null] }, { $ne: ["$$message.senderId", userId] }],
                  },
                },
              },
            },
            participants: "$participantDetails",
          },
        },
        {
          $project: {
            messages: 0,
            participantDetails: 0,
          },
        },
        {
          $sort: { "lastMessage.createdAt": -1 },
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
      participants: { $all: [userId, otherUserId], $size: 2 },
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
