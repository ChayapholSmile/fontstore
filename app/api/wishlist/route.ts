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

    const { fontId } = await request.json()

    if (!ObjectId.isValid(fontId)) {
      return NextResponse.json({ error: "Invalid font ID" }, { status: 400 })
    }

    const db = await getDatabase()

    // Add to user's wishlist
    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId) },
      {
        $addToSet: { wishlist: new ObjectId(fontId) },
        $set: { updatedAt: new Date() },
      },
    )

    return NextResponse.json({ message: "Added to wishlist successfully" })
  } catch (error) {
    console.error("Wishlist error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get wishlist fonts
    const wishlistFonts = await db
      .collection("fonts")
      .find({ _id: { $in: user.wishlist } })
      .toArray()

    return NextResponse.json({ wishlist: wishlistFonts })
  } catch (error) {
    console.error("Wishlist fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
