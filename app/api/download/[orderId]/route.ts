import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { orderId } = params

    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    // Get order and verify ownership
    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId),
      buyerId: userId,
      paymentStatus: "completed",
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 })
    }

    // Check if download is still valid
    if (order.downloadExpiry && new Date() > new Date(order.downloadExpiry)) {
      return NextResponse.json({ error: "Download link has expired" }, { status: 410 })
    }

    // Get font details
    const font = await db.collection("fonts").findOne({ _id: order.fontId })

    if (!font) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 })
    }

    // In a real implementation, you would generate a ZIP.
    // For now, we'll return the URL of the first font file.
    const downloadUrl = font.fontFiles?.[0]?.fileUrl

    if (!downloadUrl) {
      return NextResponse.json({ error: "No font file available for download." }, { status: 404 })
    }

    return NextResponse.json({
      message: "Download ready",
      downloadUrl: downloadUrl,
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
