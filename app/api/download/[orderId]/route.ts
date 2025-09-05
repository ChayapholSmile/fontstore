import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const { orderId } = params
    if (!ObjectId.isValid(orderId)) return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(orderId),
      buyerId: userId,
      paymentStatus: "completed",
    })

    if (!order) return NextResponse.json({ error: "Order not found or unauthorized" }, { status: 404 })

    const font = await db.collection("fonts").findOne({ _id: order.fontId })
    if (!font) return NextResponse.json({ error: "Font not found" }, { status: 404 })

    const fontFile = font.fontFiles?.[0]
    if (!fontFile?.fileUrl) return NextResponse.json({ error: "No font file available." }, { status: 404 })

    // Assuming fileUrl is a Base64 data URL
    const base64Data = fontFile.fileUrl.split(",")[1]
    const buffer = Buffer.from(base64Data, "base64")

    const headers = new Headers()
    headers.set("Content-Type", `font/${fontFile.format}`)
    headers.set("Content-Disposition", `attachment; filename="${font.name}.${fontFile.format}"`)

    // Record the download
    await db.collection("downloadHistory").insertOne({
      orderId: new ObjectId(orderId),
      userId,
      downloadedAt: new Date(),
      ipAddress: request.ip,
    })

    return new NextResponse(buffer, { status: 200, headers })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
