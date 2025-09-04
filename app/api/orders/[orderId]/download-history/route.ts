import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
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

    // Get order and verify ownership
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(params.orderId),
      buyerId: user.id,
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get download history for this order
    const downloadHistory = await db
      .collection("downloadHistory")
      .find({ orderId: new ObjectId(params.orderId) })
      .sort({ downloadedAt: -1 })
      .toArray()

    // Get font details
    const font = await db.collection("fonts").findOne({
      _id: new ObjectId(order.fontId),
    })

    return NextResponse.json({
      order: {
        _id: order._id,
        fontName: font?.name,
        purchaseDate: order.createdAt,
        amount: order.amount,
        status: order.status,
      },
      downloadHistory,
      canDownload: order.status === "completed",
    })
  } catch (error) {
    console.error("Error fetching download history:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
