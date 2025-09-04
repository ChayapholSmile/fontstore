import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const db = await getDatabase()

    // Get count of fonts by category
    const pipeline = [{ $match: { status: "approved" } }, { $group: { _id: "$category", count: { $sum: 1 } } }]

    const results = await db.collection("fonts").aggregate(pipeline).toArray()

    const counts: Record<string, number> = {}
    results.forEach((result) => {
      counts[result._id] = result.count
    })

    return NextResponse.json({ counts })
  } catch (error) {
    console.error("Category counts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
