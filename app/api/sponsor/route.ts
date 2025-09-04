import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth-utils"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { fontId, amount, duration } = await request.json()
    const userId = new ObjectId(decoded.userId)

    const db = await getDatabase()

    // Check if font exists and user owns it
    const font = await db.collection("fonts").findOne({
      _id: new ObjectId(fontId),
      sellerId: userId,
    })

    if (!font) {
      return NextResponse.json({ error: "Font not found or unauthorized" }, { status: 404 })
    }

    // Create sponsor record
    const sponsor = {
      fontId: new ObjectId(fontId),
      sellerId: userId,
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
    const db = await getDatabase()

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
