import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"
import { compare, hash } from "bcryptjs"

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Get user from database
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )

    // Log activity
    await db.collection("userActivity").insertOne({
      userId: user._id.toString(),
      type: "password_change",
      details: "Changed account password",
      timestamp: new Date(),
    })

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    return NextResponse.json({ message: "An error occurred while changing password" }, { status: 500 })
  }
}

