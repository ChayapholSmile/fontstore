import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import type { ChatMessage } from "@/lib/models/User"

async function generateLicense(orderId: ObjectId, db: any) {
  try {
    const order = await db.collection("orders").findOne({ _id: orderId })
    if (!order) return

    const [buyer, font] = await Promise.all([
      db.collection("users").findOne({ _id: order.buyerId }),
      db.collection("fonts").findOne({ _id: order.fontId }),
    ])

    if (!buyer || !font) return

    const currentYear = new Date().getFullYear()
    const licenseText = `Copyright © ${currentYear} ${font.sellerName}, Licensed to: ${buyer.displayName} (License ID: ${orderId.toString()})`

    await db.collection("orders").updateOne(
      { _id: orderId },
      {
        $set: {
          licenseGenerated: true,
          licenseText,
          downloadUrl: `/api/download/${orderId.toString()}`,
          downloadExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      },
    )
  } catch (error) {
    console.error("License generation error:", error)
  }
}

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    const sellerId = new ObjectId(decoded.userId)
    const { orderId } = params

    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }
    const db = await getDatabase()

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId),
      sellerId: sellerId,
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found or you are not the seller." }, { status: 404 })
    }

    if (order.paymentStatus === "completed") {
      return NextResponse.json({ message: "Order is already completed." }, { status: 200 })
    }

    await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(orderId) }, { $set: { paymentStatus: "completed", updatedAt: new Date() } })

    await generateLicense(new ObjectId(orderId), db)
    await db.collection("users").updateOne({ _id: order.buyerId }, { $addToSet: { purchasedFonts: order.fontId } })

    const conversation = await db.collection("conversations").findOne({
      participants: { $all: [order.buyerId, order.sellerId] },
    })

    if (conversation) {
      await db
        .collection("chatMessages")
        .updateOne({ "paymentRequest.orderId": new ObjectId(orderId) }, { $set: { "paymentRequest.status": "paid" } })

      const confirmationMessage: Omit<ChatMessage, "_id"> = {
        conversationId: conversation._id,
        senderId: sellerId,
        receiverId: order.buyerId,
        message: `Payment confirmed for your order. You can now download your font.`,
        messageType: "text",
        createdAt: new Date(),
      }
      await db.collection("chatMessages").insertOne(confirmationMessage)
      await db
        .collection("conversations")
        .updateOne({ _id: conversation._id }, { $set: { updatedAt: new Date() } })
    }

    return NextResponse.json({ message: "Payment approved successfully." })
  } catch (error) {
    console.error("Approve payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
