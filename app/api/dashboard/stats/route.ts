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

    // Get seller's fonts
    const fonts = await db.collection("fonts").find({ sellerId: userId }).toArray()
    const fontIds = fonts.map((f) => f._id)

    // Get orders for seller's fonts
    const orders = await db
      .collection("orders")
      .find({
        sellerId: userId,
        paymentStatus: "completed",
      })
      .toArray()

    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0)
    const totalSales = orders.length
    const totalFonts = fonts.length
    const avgRating = fonts.length > 0 ? fonts.reduce((sum, font) => sum + font.rating, 0) / fonts.length : 0

    // Monthly revenue (last 6 months)
    const monthlyRevenue = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const monthOrders = orders.filter(
        (order) => new Date(order.createdAt) >= monthStart && new Date(order.createdAt) <= monthEnd,
      )
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.amount, 0)

      monthlyRevenue.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        revenue: monthRevenue,
      })
    }

    // Top fonts
    const fontSales = new Map()
    orders.forEach((order) => {
      const fontId = order.fontId.toString()
      if (!fontSales.has(fontId)) {
        fontSales.set(fontId, { sales: 0, revenue: 0, font: null })
      }
      const current = fontSales.get(fontId)
      current.sales += 1
      current.revenue += order.amount
    })

    const topFonts = Array.from(fontSales.entries())
      .map(([fontId, data]) => {
        const font = fonts.find((f) => f._id.toString() === fontId)
        return {
          name: font?.name || "Unknown",
          sales: data.sales,
          revenue: data.revenue,
        }
      })
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    // Recent orders
    const recentOrders = await db
      .collection("orders")
      .aggregate([
        { $match: { sellerId: userId, paymentStatus: "completed" } },
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
          $addFields: {
            font: { $arrayElemAt: ["$font", 0] },
            buyer: { $arrayElemAt: ["$buyer", 0] },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    const stats = {
      totalRevenue,
      totalSales,
      totalFonts,
      avgRating,
      monthlyRevenue,
      topFonts,
      recentOrders,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
