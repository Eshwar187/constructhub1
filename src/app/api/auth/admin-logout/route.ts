import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Clear admin session cookie
    const cookieStore = await cookies()
    cookieStore.delete("admin-session")

    return NextResponse.json({ message: "Admin logout successful" }, { status: 200 })
  } catch (error) {
    console.error("Admin logout error:", error)
    return NextResponse.json({ message: "An error occurred during admin logout" }, { status: 500 })
  }
}

