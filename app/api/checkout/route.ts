import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { Order, ChatMessage } from "@/lib/models/User"

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
    const userId = new ObjectId(decoded.userId)

    const { items } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const db = await getDatabase()
    const conversationsMap = new Map<string, string>() // sellerId -> conversationId

    for (const item of items) {
      const font = await db.collection("fonts").findOne({ _id: new ObjectId(item.font._id) })
      if (!font) {
        console.warn(`Font with ID ${item.font._id} not found during checkout.`)
        continue
      }

      const sellerId = font.sellerId
      let conversationId

      // Find or create a conversation with the seller
      let conversation = await db.collection("conversations").findOne({
        participants: { $all: [userId, sellerId] },
      })

      if (conversation) {
        conversationId = conversation._id
      } else {
        const newConversationResult = await db.collection("conversations").insertOne({
          participants: [userId, sellerId],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        conversationId = newConversationResult.insertedId
      }
      conversationsMap.set(sellerId.toString(), conversationId.toString())

      // Create a pending order
      const order: Omit<Order, "_id"> = {
        buyerId: userId,
        sellerId: sellerId,
        fontId: font._id,
        amount: font.price * item.quantity,
        paymentMethod: "chat",
        paymentStatus: "pending", // Set status to pending
        licenseGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const orderResult = await db.collection("orders").insertOne(order)
      const newOrderId = orderResult.insertedId

      // Send a payment request message to the chat
      const chatMessage: Omit<ChatMessage, "_id"> = {
        conversationId: conversationId,
        senderId: userId,
        receiverId: sellerId,
        message: `I would like to purchase the font "${font.name}" for $${order.amount}. Please provide payment instructions.`,
        messageType: "payment-request",
        paymentRequest: {
          fontId: font._id,
          orderId: newOrderId,
          amount: order.amount,
          status: "pending",
        },
        createdAt: new Date(),
      }
      await db.collection("chatMessages").insertOne(chatMessage)
      await db.collection("conversations").updateOne({ _id: conversationId }, { $set: { updatedAt: new Date() } })
    }

    // Clear the user's cart
    await db.collection("cart").deleteMany({ userId: userId })

    const conversationIds = Array.from(conversationsMap.values())

    return NextResponse.json({
      message: "Checkout initiated. Please proceed to chat with the seller(s) to complete payment.",
      redirectUrl: `/chat?conversationId=${conversationIds[0]}`, // Redirect to the first new/updated conversation
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

