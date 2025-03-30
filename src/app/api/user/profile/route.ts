import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"

// GET - Fetch user profile
export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get user from database
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { password: 0 } }, // Exclude password
    )

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "An error occurred while fetching user profile" }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const updateData = await request.json()

    // Validate required fields
    if (!updateData.username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if username is already taken by another user
    const existingUser = await db.collection("users").findOne({
      username: updateData.username,
      email: { $ne: session.user.email },
    })

    if (existingUser) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 409 })
    }

    // Update user
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          username: updateData.username,
          name: updateData.name || "",
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Log activity
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    await db.collection("userActivity").insertOne({
      userId: user._id.toString(),
      type: "profile_update",
      details: "Updated profile information",
      timestamp: new Date(),
    })

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        ...user,
        username: updateData.username,
        name: updateData.name || "",
      },
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ message: "An error occurred while updating user profile" }, { status: 500 })
  }
}

