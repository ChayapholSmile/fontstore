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
    const userId = new ObjectId(decoded.userId)

    const { fontId } = await request.json()

    const db = await getDatabase()

    // Check if font exists
    const font = await db.collection("fonts").findOne({
      _id: new ObjectId(fontId),
    })

    if (!font) {
      return NextResponse.json({ error: "Font not found" }, { status: 404 })
    }

    // Check if user already has a trial key for this font
    const existingTrial = await db.collection("trialKeys").findOne({
      fontId: new ObjectId(fontId),
      userId: userId,
    })

    if (existingTrial) {
      return NextResponse.json({ error: "Trial key already exists" }, { status: 400 })
    }

    // Generate trial key
    const trialKey = {
      fontId: new ObjectId(fontId),
      userId: userId,
      key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      usageCount: 0,
      maxUsage: 100, // 100 uses
      createdAt: new Date(),
    }

    const result = await db.collection("trialKeys").insertOne(trialKey)

    return NextResponse.json({
      success: true,
      trialKey: trialKey.key,
      expiresAt: trialKey.expiresAt,
    })
  } catch (error) {
    console.error("Error creating trial key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    const userId = new ObjectId(decoded.userId)

    const db = await getDatabase()

    const trialKeys = await db
      .collection("trialKeys")
      .aggregate([
        {
          $match: { userId: userId },
        },
        {
          $lookup: {
            from: "fonts",
            localField: "fontId",
            foreignField: "_id",
            as: "font",
          },
        },
        {
          $unwind: "$font",
        },
        {
          $project: {
            key: 1,
            expiresAt: 1,
            usageCount: 1,
            maxUsage: 1,
            "font.name": 1,
            "font.previewImage": 1,
          },
        },
      ])
      .toArray()

    return NextResponse.json({ trialKeys })
  } catch (error) {
    console.error("Error fetching trial keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
