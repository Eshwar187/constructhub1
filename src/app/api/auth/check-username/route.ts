import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ message: "Username is required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Check if username exists
    const existingUser = await db.collection("users").findOne({ username })

    if (existingUser) {
      return NextResponse.json({ message: "Username is already taken" }, { status: 409 })
    }

    return NextResponse.json({ message: "Username is available" }, { status: 200 })
  } catch (error) {
    console.error("Check username error:", error)
    return NextResponse.json({ message: "An error occurred while checking username" }, { status: 500 })
  }
}

