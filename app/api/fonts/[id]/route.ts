import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid font ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const font = await db.collection("fonts").findOne({ _id: new ObjectId(id) })

    if (!font) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 })
    }

    // Get reviews for this font
    const reviews = await db
      .collection("reviews")
      .find({ fontId: new ObjectId(id) })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    // Get similar fonts (same category, different seller)
    const similarFonts = await db
      .collection("fonts")
      .find({
        category: font.category,
        _id: { $ne: new ObjectId(id) },
        status: "approved",
      })
      .limit(6)
      .toArray()

    return NextResponse.json({
      font,
      reviews,
      similarFonts,
    })
  } catch (error) {
    console.error("Font detail fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
