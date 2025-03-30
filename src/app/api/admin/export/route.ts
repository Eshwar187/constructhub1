import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectToDatabase } from "@/lib/mongodb"
import { format } from "date-fns"

export async function GET(request: Request) {
  try {
    // Check if user is admin
    const session = await getServerSession()
    if (!session || !session.user || session.user.email !== "eshwar@admin.com") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get all users
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } })
      .toArray()

    // Get all queries
    const queries = await db.collection("userQueries").find({}).toArray()

    // Get all projects
    const projects = await db.collection("projects").find({}).toArray()

    // Format data for CSV export

    // Users CSV
    let usersCSV = "ID,Username,Email,Name,Created At,Last Login\n"
    users.forEach((user) => {
      usersCSV += `${user._id},${user.username || ""},${user.email || ""},"${user.name || ""}",${format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss")},${user.lastLogin ? format(new Date(user.lastLogin), "yyyy-MM-dd HH:mm:ss") : ""}\n`
    })

    // Queries CSV
    let queriesCSV = "ID,User ID,Query,Timestamp\n"
    queries.forEach((query) => {
      queriesCSV += `${query._id},${query.userId},"${query.query.replace(/"/g, '""')}",${format(new Date(query.timestamp), "yyyy-MM-dd HH:mm:ss")}\n`
    })

    // Projects CSV
    let projectsCSV = "ID,User ID,Name,Description,Land Area,Budget,State,City,Status,Created At\n"
    projects.forEach((project) => {
      projectsCSV += `${project._id},${project.userId},"${project.name.replace(/"/g, '""')}","${(project.description || "").replace(/"/g, '""')}",${project.landArea},${project.budget},${project.state},${project.city},${project.status || ""},${format(new Date(project.createdAt), "yyyy-MM-dd HH:mm:ss")}\n`
    })

    // Combine all CSVs
    const combinedCSV =
      `# BuildWise AI Data Export - ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}\n\n` +
      "# USERS\n" +
      usersCSV +
      "\n\n" +
      "# QUERIES\n" +
      queriesCSV +
      "\n\n" +
      "# PROJECTS\n" +
      projectsCSV

    // Log export activity
    await db.collection("adminActivity").insertOne({
      email: session.user.email,
      action: "data_export",
      timestamp: new Date(),
    })

    return new Response(combinedCSV, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="buildwise-data-${format(new Date(), "yyyy-MM-dd")}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting data:", error)
    return NextResponse.json({ message: "An error occurred while exporting data" }, { status: 500 })
  }
}

