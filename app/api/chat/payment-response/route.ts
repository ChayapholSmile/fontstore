import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

    const { messageId, action } = await request.json()

    if (!ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    // Get the payment request message
    const message = await db.collection("chatMessages").findOne({ _id: new ObjectId(messageId) })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (message.messageType !== "payment-request") {
      return NextResponse.json({ error: "Not a payment request" }, { status: 400 })
    }

    if (!message.receiverId.equals(userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (action === "accept") {
      // Create order
      const order = {
        buyerId: userId,
        sellerId: message.senderId,
        fontId: new ObjectId(message.paymentRequest.fontId),
        amount: message.paymentRequest.amount,
        paymentMethod: "chat-payment",
        paymentStatus: "completed", // In real app, integrate with payment processor
        licenseGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const orderResult = await db.collection("orders").insertOne(order)

      // Update payment request status
      await db.collection("chatMessages").updateOne(
        { _id: new ObjectId(messageId) },
        {
          $set: {
            "paymentRequest.status": "paid",
            updatedAt: new Date(),
          },
        },
      )

      // Generate license
      await generateLicense(orderResult.insertedId, db)

      return NextResponse.json({ message: "Payment accepted and processed" })
    } else if (action === "decline") {
      // Update payment request status
      await db.collection("chatMessages").updateOne(
        { _id: new ObjectId(messageId) },
        {
          $set: {
            "paymentRequest.status": "cancelled",
            updatedAt: new Date(),
          },
        },
      )

      return NextResponse.json({ message: "Payment declined" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Payment response error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function generateLicense(orderId: ObjectId, db: any) {
  try {
    const order = await db.collection("orders").findOne({ _id: orderId })
    if (!order) return

    const [buyer, font] = await Promise.all([
      db.collection("users").findOne({ _id: order.buyerId }),
      db.collection("fonts").findOne({ _id: order.fontId }),
    ])

    const currentYear = new Date().getFullYear()
    const licenseText = `Copyright © ${currentYear} ${font.sellerName}, Buy by ${buyer.displayName} - Unique License`

    // Update order with license
    await db.collection("orders").updateOne(
      { _id: orderId },
      {
        $set: {
          licenseGenerated: true,
          licenseText,
          downloadUrl: `/api/download/${orderId}`,
          downloadExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          updatedAt: new Date(),
        },
      },
    )

    // Add to buyer's purchased fonts
    await db.collection("users").updateOne(
      { _id: order.buyerId },
      {
        $addToSet: { purchasedFonts: order.fontId },
        $set: { updatedAt: new Date() },
      },
    )
  } catch (error) {
    console.error("License generation error:", error)
  }
}
