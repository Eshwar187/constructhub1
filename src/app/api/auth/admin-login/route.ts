import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Check if credentials match the hardcoded admin credentials
    if (email !== "eshwar@admin.com" || password !== "Eshwar@0000") {
      return NextResponse.json({ message: "Invalid admin credentials" }, { status: 401 })
    }

    // Set admin session cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })

    // Log admin login
    const { db } = await connectToDatabase()
    await db.collection("adminActivity").insertOne({
      email,
      action: "login",
      timestamp: new Date(),
    })

    return NextResponse.json({ message: "Admin login successful" }, { status: 200 })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ message: "An error occurred during admin login" }, { status: 500 })
  }
}

