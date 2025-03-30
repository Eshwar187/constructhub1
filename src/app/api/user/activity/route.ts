import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user from database
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Get user activity
    const activities = await db
      .collection("userActivity")
      .find({ userId: user._id.toString() })
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray()

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Error fetching user activity:", error)
    return NextResponse.json({ message: "An error occurred while fetching user activity" }, { status: 500 })
  }
}

