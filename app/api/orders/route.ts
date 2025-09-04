import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'purchases' or 'sales'

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    let query: any = {}
    if (type === "purchases") {
      query.buyerId = userId
    } else if (type === "sales") {
      query.sellerId = userId
    } else {
      query = { $or: [{ buyerId: userId }, { sellerId: userId }] }
    }

    const orders = await db
      .collection("orders")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "fonts",
            localField: "fontId",
            foreignField: "_id",
            as: "font",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "buyerId",
            foreignField: "_id",
            as: "buyer",
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
          $addFields: {
            font: { $arrayElemAt: ["$font", 0] },
            buyer: { $arrayElemAt: ["$buyer", 0] },
            seller: { $arrayElemAt: ["$seller", 0] },
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
