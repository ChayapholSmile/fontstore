import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { fontId, amount, duration } = await request.json()

    const db = await connectDB()

    // Check if font exists and user owns it
    const font = await db.collection("fonts").findOne({
      _id: new ObjectId(fontId),
      sellerId: user.id,
    })

    if (!font) {
      return NextResponse.json({ error: "Font not found or unauthorized" }, { status: 404 })
    }

    // Create sponsor record
    const sponsor = {
      fontId: new ObjectId(fontId),
      sellerId: user.id,
      amount: Number.parseFloat(amount),
      duration: Number.parseInt(duration), // days
      startDate: new Date(),
      endDate: new Date(Date.now() + Number.parseInt(duration) * 24 * 60 * 60 * 1000),
      active: true,
      createdAt: new Date(),
    }

    const result = await db.collection("sponsors").insertOne(sponsor)

    // Update font with sponsor status
    await db.collection("fonts").updateOne(
      { _id: new ObjectId(fontId) },
      {
        $set: {
          sponsored: true,
          sponsorEndDate: sponsor.endDate,
        },
      },
    )

    return NextResponse.json({
      success: true,
      sponsorId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating sponsor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await connectDB()

    // Get active sponsored fonts
    const sponsoredFonts = await db
      .collection("fonts")
      .aggregate([
        {
          $match: {
            sponsored: true,
            sponsorEndDate: { $gt: new Date() },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "sellerId",
            foreignField: "_id",
            as: "seller",
          },
        },
        {
          $unwind: "$seller",
        },
        {
          $project: {
            name: 1,
            description: 1,
            price: 1,
            category: 1,
            tags: 1,
            previewImage: 1,
            "seller.firstName": 1,
            "seller.lastName": 1,
            sponsorEndDate: 1,
          },
        },
        {
          $sort: { sponsorEndDate: -1 },
        },
      ])
      .toArray()

    return NextResponse.json({ sponsoredFonts })
  } catch (error) {
    console.error("Error fetching sponsored fonts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
