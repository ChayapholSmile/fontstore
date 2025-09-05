import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const { id } = params
    const { status } = await request.json()

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const db = await getDatabase()
    const adminUser = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const result = await db
      .collection("fonts")
      .updateOne({ _id: new ObjectId(id), status: "pending" }, { $set: { status: status, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Font not found or already reviewed" }, { status: 404 })
    }

    // You might want to send a notification to the seller here

    return NextResponse.json({ message: `Font status updated to ${status}` })
  } catch (error) {
    console.error("Font approval error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
