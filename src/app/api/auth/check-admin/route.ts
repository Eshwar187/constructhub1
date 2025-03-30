import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get("admin-session")

    if (!adminSession || adminSession.value !== "true") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ message: "Admin authenticated" }, { status: 200 })
  } catch (error) {
    console.error("Check admin error:", error)
    return NextResponse.json({ message: "An error occurred while checking admin status" }, { status: 500 })
  }
}

