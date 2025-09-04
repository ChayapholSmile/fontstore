import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"
import type { Font } from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const isFree = searchParams.get("free") === "true"
    const featured = searchParams.get("featured") === "true"

    const db = await getDatabase()
    const query: any = { status: "approved" }

    if (category) query.category = category
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }
    if (isFree !== undefined) query.isFree = isFree
    if (featured) query.featured = true

    const skip = (page - 1) * limit

    const fonts = await db.collection("fonts").find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    const total = await db.collection("fonts").countDocuments(query)

    return NextResponse.json({
      fonts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Fonts fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const db = await getDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) })

    if (!user || user.role !== "seller") {
      return NextResponse.json({ error: "Seller access required" }, { status: 403 })
    }

    const fontData = await request.json()

    const font: Font = {
      ...fontData,
      sellerId: new ObjectId(decoded.userId),
      sellerName: user.displayName,
      downloads: 0,
      rating: 0,
      reviews: [],
      status: "pending",
      featured: false,
      sponsored: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("fonts").insertOne(font)

    return NextResponse.json({
      message: "Font uploaded successfully",
      fontId: result.insertedId,
    })
  } catch (error) {
    console.error("Font upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
