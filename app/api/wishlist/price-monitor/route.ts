import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"

// Background job to check price changes and send notifications
export async function POST(request: NextRequest) {
  try {
    const db = await connectDB()

    // Get all wishlist items with their current font prices
    const wishlistItems = await db
      .collection("wishlists")
      .aggregate([
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
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
      ])
      .toArray()

    const notifications = []

    for (const item of wishlistItems) {
      const currentPrice = item.font.price
      const lastKnownPrice = item.lastKnownPrice || currentPrice

      // Check if price has changed
      if (currentPrice !== lastKnownPrice) {
        const priceChange = currentPrice - lastKnownPrice
        const isDecrease = priceChange < 0

        // Create notification
        const notification = {
          userId: item.userId,
          type: "price_change",
          title: isDecrease ? "Price Drop Alert!" : "Price Increase Notice",
          message: `${item.font.name} price changed from $${lastKnownPrice} to $${currentPrice}`,
          fontId: item.fontId,
          read: false,
          createdAt: new Date(),
        }

        notifications.push(notification)

        // Update wishlist item with new price
        await db.collection("wishlists").updateOne({ _id: item._id }, { $set: { lastKnownPrice: currentPrice } })
      }
    }

    // Insert all notifications
    if (notifications.length > 0) {
      await db.collection("notifications").insertMany(notifications)
    }

    return NextResponse.json({
      success: true,
      notificationsCreated: notifications.length,
    })
  } catch (error) {
    console.error("Error monitoring wishlist prices:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
