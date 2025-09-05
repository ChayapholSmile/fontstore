import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const db = await getDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const fonts = await db.collection("fonts").find({ status: "pending" }).sort({ createdAt: 1 }).toArray()

    return NextResponse.json({ fonts })
  } catch (error) {
    console.error("Admin fetch fonts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
