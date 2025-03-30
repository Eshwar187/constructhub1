import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { username, email, password, otp } = await request.json()

    // Validate inputs
    if (!username || !email || !password || !otp) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Verify OTP
    const otpRecord = await db.collection("otps").findOne({
      email,
      code: otp,
      expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return NextResponse.json({ message: "User with this email or username already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user
    const result = await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      lastLogin: new Date(),
      isVerified: true,
    })

    // Delete used OTP
    await db.collection("otps").deleteOne({ _id: otpRecord._id })

    // Create user activity log
    await db.collection("userActivity").insertOne({
      userId: result.insertedId,
      action: "signup",
      timestamp: new Date(),
    })

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "An error occurred during signup" }, { status: 500 })
  }
}

