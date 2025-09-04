import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth-utils"
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

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    const cartItems = await db
      .collection("cart")
      .aggregate([
        { $match: { userId } },
        {
          $lookup: {
            from: "fonts",
            localField: "fontId",
            foreignField: "_id",
            as: "font",
          },
        },
        {
          $addFields: {
            font: { $arrayElemAt: ["$font", 0] },
          },
        },
        { $sort: { addedAt: -1 } },
      ])
      .toArray()

    return NextResponse.json({ items: cartItems })
  } catch (error) {
    console.error("Cart fetch error:", error)
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

    const { fontId, quantity = 1 } = await request.json()

    if (!ObjectId.isValid(fontId)) {
      return NextResponse.json({ error: "Invalid font ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    // Check if item already in cart
    const existingItem = await db.collection("cart").findOne({
      userId,
      fontId: new ObjectId(fontId),
    })

    if (existingItem) {
      // Update quantity
      await db.collection("cart").updateOne(
        { _id: existingItem._id },
        {
          $inc: { quantity },
          $set: { updatedAt: new Date() },
        },
      )
    } else {
      // Add new item
      await db.collection("cart").insertOne({
        userId,
        fontId: new ObjectId(fontId),
        quantity,
        addedAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ message: "Item added to cart" })
  } catch (error) {
    console.error("Cart add error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { itemId, quantity } = await request.json()

    if (!ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    await db.collection("cart").updateOne(
      { _id: new ObjectId(itemId), userId },
      {
        $set: { quantity, updatedAt: new Date() },
      },
    )

    return NextResponse.json({ message: "Cart updated" })
  } catch (error) {
    console.error("Cart update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { itemId } = await request.json()

    if (!ObjectId.isValid(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(decoded.userId)

    await db.collection("cart").deleteOne({
      _id: new ObjectId(itemId),
      userId,
    })

    return NextResponse.json({ message: "Item removed from cart" })
  } catch (error) {
    console.error("Cart remove error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
