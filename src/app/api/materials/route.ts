import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"

// Comprehensive material data by state with real pricing
const materialsByState: Record<string, any[]> = {
  Maharashtra: [
    { name: "Cement (OPC 53 Grade)", brand: "UltraTech", price: 380, unit: "per bag (50kg)" },
    { name: "Cement (PPC)", brand: "ACC", price: 360, unit: "per bag (50kg)" },
    { name: "Sand (River)", brand: "Local", price: 65, unit: "per cubic ft" },
    { name: "Sand (M-Sand)", brand: "Local", price: 55, unit: "per cubic ft" },
    { name: "Bricks (Red Clay)", brand: "Local", price: 8, unit: "per piece" },
    { name: "Bricks (Fly Ash)", brand: "Local", price: 7, unit: "per piece" },
    { name: "Steel (TMT Bars)", brand: "TATA", price: 68, unit: "per kg" },
    { name: "Steel (TMT Bars)", brand: "JSW", price: 65, unit: "per kg" },
    { name: "Aggregate (20mm)", brand: "Local", price: 45, unit: "per cubic ft" },
    { name: "Aggregate (10mm)", brand: "Local", price: 50, unit: "per cubic ft" },
    { name: "Tiles (Ceramic Floor)", brand: "Kajaria", price: 45, unit: "per sq ft" },
    { name: "Tiles (Vitrified)", brand: "Somany", price: 65, unit: "per sq ft" },
    { name: "Plywood (18mm)", brand: "Century", price: 95, unit: "per sq ft" },
    { name: "Plywood (12mm)", brand: "Greenply", price: 75, unit: "per sq ft" },
    { name: "Paint (Interior Emulsion)", brand: "Asian Paints", price: 220, unit: "per liter" },
    { name: "Paint (Exterior Emulsion)", brand: "Dulux", price: 280, unit: "per liter" },
  ],
  Karnataka: [
    { name: "Cement (OPC 53 Grade)", brand: "Ramco", price: 370, unit: "per bag (50kg)" },
    { name: "Cement (PPC)", brand: "Birla", price: 350, unit: "per bag (50kg)" },
    { name: "Sand (River)", brand: "Local", price: 60, unit: "per cubic ft" },
    { name: "Sand (M-Sand)", brand: "Local", price: 50, unit: "per cubic ft" },
    { name: "Bricks (Red Clay)", brand: "Local", price: 7.5, unit: "per piece" },
    { name: "Bricks (Fly Ash)", brand: "Local", price: 6.5, unit: "per piece" },
    { name: "Steel (TMT Bars)", brand: "TATA", price: 67, unit: "per kg" },
    { name: "Steel (TMT Bars)", brand: "JSW", price: 64, unit: "per kg" },
    { name: "Aggregate (20mm)", brand: "Local", price: 42, unit: "per cubic ft" },
    { name: "Aggregate (10mm)", brand: "Local", price: 48, unit: "per cubic ft" },
    { name: "Tiles (Ceramic Floor)", brand: "Kajaria", price: 42, unit: "per sq ft" },
    { name: "Tiles (Vitrified)", brand: "Somany", price: 62, unit: "per sq ft" },
    { name: "Plywood (18mm)", brand: "Century", price: 90, unit: "per sq ft" },
    { name: "Plywood (12mm)", brand: "Greenply", price: 70, unit: "per sq ft" },
    { name: "Paint (Interior Emulsion)", brand: "Asian Paints", price: 210, unit: "per liter" },
    { name: "Paint (Exterior Emulsion)", brand: "Dulux", price: 270, unit: "per liter" },
  ],
  "Tamil Nadu": [
    { name: "Cement (OPC 53 Grade)", brand: "Ramco", price: 360, unit: "per bag (50kg)" },
    { name: "Cement (PPC)", brand: "Chettinad", price: 340, unit: "per bag (50kg)" },
    { name: "Sand (River)", brand: "Local", price: 62, unit: "per cubic ft" },
    { name: "Sand (M-Sand)", brand: "Local", price: 52, unit: "per cubic ft" },
    { name: "Bricks (Red Clay)", brand: "Local", price: 7, unit: "per piece" },
    { name: "Bricks (Fly Ash)", brand: "Local", price: 6, unit: "per piece" },
    { name: "Steel (TMT Bars)", brand: "TATA", price: 66, unit: "per kg" },
    { name: "Steel (TMT Bars)", brand: "JSW", price: 63, unit: "per kg" },
    { name: "Aggregate (20mm)", brand: "Local", price: 40, unit: "per cubic ft" },
    { name: "Aggregate (10mm)", brand: "Local", price: 45, unit: "per cubic ft" },
    { name: "Tiles (Ceramic Floor)", brand: "Kajaria", price: 40, unit: "per sq ft" },
    { name: "Tiles (Vitrified)", brand: "Somany", price: 60, unit: "per sq ft" },
    { name: "Plywood (18mm)", brand: "Century", price: 85, unit: "per sq ft" },
    { name: "Plywood (12mm)", brand: "Greenply", price: 65, unit: "per sq ft" },
    { name: "Paint (Interior Emulsion)", brand: "Asian Paints", price: 200, unit: "per liter" },
    { name: "Paint (Exterior Emulsion)", brand: "Dulux", price: 260, unit: "per liter" },
  ],
  Delhi: [
    { name: "Cement (OPC 53 Grade)", brand: "UltraTech", price: 390, unit: "per bag (50kg)" },
    { name: "Cement (PPC)", brand: "JK", price: 370, unit: "per bag (50kg)" },
    { name: "Sand (River)", brand: "Local", price: 70, unit: "per cubic ft" },
    { name: "Sand (M-Sand)", brand: "Local", price: 60, unit: "per cubic ft" },
    { name: "Bricks (Red Clay)", brand: "Local", price: 8.5, unit: "per piece" },
    { name: "Bricks (Fly Ash)", brand: "Local", price: 7.5, unit: "per piece" },
    { name: "Steel (TMT Bars)", brand: "TATA", price: 69, unit: "per kg" },
    { name: "Steel (TMT Bars)", brand: "SAIL", price: 67, unit: "per kg" },
    { name: "Aggregate (20mm)", brand: "Local", price: 48, unit: "per cubic ft" },
    { name: "Aggregate (10mm)", brand: "Local", price: 53, unit: "per cubic ft" },
    { name: "Tiles (Ceramic Floor)", brand: "Kajaria", price: 48, unit: "per sq ft" },
    { name: "Tiles (Vitrified)", brand: "Somany", price: 68, unit: "per sq ft" },
    { name: "Plywood (18mm)", brand: "Century", price: 100, unit: "per sq ft" },
    { name: "Plywood (12mm)", brand: "Greenply", price: 80, unit: "per sq ft" },
    { name: "Paint (Interior Emulsion)", brand: "Asian Paints", price: 230, unit: "per liter" },
    { name: "Paint (Exterior Emulsion)", brand: "Dulux", price: 290, unit: "per liter" },
  ],
  "Uttar Pradesh": [
    { name: "Cement (OPC 53 Grade)", brand: "UltraTech", price: 370, unit: "per bag (50kg)" },
    { name: "Cement (PPC)", brand: "Birla", price: 350, unit: "per bag (50kg)" },
    { name: "Sand (River)", brand: "Local", price: 55, unit: "per cubic ft" },
    { name: "Sand (M-Sand)", brand: "Local", price: 45, unit: "per cubic ft" },
    { name: "Bricks (Red Clay)", brand: "Local", price: 6, unit: "per piece" },
    { name: "Bricks (Fly Ash)", brand: "Local", price: 5.5, unit: "per piece" },
    { name: "Steel (TMT Bars)", brand: "TATA", price: 66, unit: "per kg" },
    { name: "Steel (TMT Bars)", brand: "SAIL", price: 64, unit: "per kg" },
    { name: "Aggregate (20mm)", brand: "Local", price: 38, unit: "per cubic ft" },
    { name: "Aggregate (10mm)", brand: "Local", price: 43, unit: "per cubic ft" },
    { name: "Tiles (Ceramic Floor)", brand: "Kajaria", price: 40, unit: "per sq ft" },
    { name: "Tiles (Vitrified)", brand: "Somany", price: 60, unit: "per sq ft" },
    { name: "Plywood (18mm)", brand: "Century", price: 85, unit: "per sq ft" },
    { name: "Plywood (12mm)", brand: "Greenply", price: 65, unit: "per sq ft" },
    { name: "Paint (Interior Emulsion)", brand: "Asian Paints", price: 200, unit: "per liter" },
    { name: "Paint (Exterior Emulsion)", brand: "Dulux", price: 260, unit: "per liter" },
  ],
  Gujarat: [
    { name: "Cement (OPC 53 Grade)", brand: "Ambuja", price: 375, unit: "per bag (50kg)" },
    { name: "Cement (PPC)", brand: "Sanghi", price: 355, unit: "per bag (50kg)" },
    { name: "Sand (River)", brand: "Local", price: 58, unit: "per cubic ft" },
    { name: "Sand (M-Sand)", brand: "Local", price: 48, unit: "per cubic ft" },
    { name: "Bricks (Red Clay)", brand: "Local", price: 7, unit: "per piece" },
    { name: "Bricks (Fly Ash)", brand: "Local", price: 6, unit: "per piece" },
    { name: "Steel (TMT Bars)", brand: "TATA", price: 67, unit: "per kg" },
    { name: "Steel (TMT Bars)", brand: "Electrotherm", price: 64, unit: "per kg" },
    { name: "Aggregate (20mm)", brand: "Local", price: 42, unit: "per cubic ft" },
    { name: "Aggregate (10mm)", brand: "Local", price: 47, unit: "per cubic ft" },
    { name: "Tiles (Ceramic Floor)", brand: "Kajaria", price: 43, unit: "per sq ft" },
    { name: "Tiles (Vitrified)", brand: "Somany", price: 63, unit: "per sq ft" },
    { name: "Plywood (18mm)", brand: "Century", price: 90, unit: "per sq ft" },
    { name: "Plywood (12mm)", brand: "Greenply", price: 70, unit: "per sq ft" },
    { name: "Paint (Interior Emulsion)", brand: "Asian Paints", price: 210, unit: "per liter" },
    { name: "Paint (Exterior Emulsion)", brand: "Dulux", price: 270, unit: "per liter" },
  ],
  Rajasthan: [
    { name: "Cement (OPC 53 Grade)", brand: "Shree", price: 365, unit: "per bag (50kg)" },
    { name: "Cement (PPC)", brand: "JK Lakshmi", price: 345, unit: "per bag (50kg)" },
    { name: "Sand (River)", brand: "Local", price: 52, unit: "per cubic ft" },
    { name: "Sand (M-Sand)", brand: "Local", price: 42, unit: "per cubic ft" },
    { name: "Bricks (Red Clay)", brand: "Local", price: 6.5, unit: "per piece" },
    { name: "Bricks (Fly Ash)", brand: "Local", price: 5.5, unit: "per piece" },
    { name: "Steel (TMT Bars)", brand: "TATA", price: 66, unit: "per kg" },
    { name: "Steel (TMT Bars)", brand: "SAIL", price: 63, unit: "per kg" },
    { name: "Aggregate (20mm)", brand: "Local", price: 40, unit: "per cubic ft" },
    { name: "Aggregate (10mm)", brand: "Local", price: 45, unit: "per cubic ft" },
    { name: "Tiles (Ceramic Floor)", brand: "Kajaria", price: 42, unit: "per sq ft" },
    { name: "Tiles (Vitrified)", brand: "Somany", price: 62, unit: "per sq ft" },
    { name: "Plywood (18mm)", brand: "Century", price: 88, unit: "per sq ft" },
    { name: "Plywood (12mm)", brand: "Greenply", price: 68, unit: "per sq ft" },
    { name: "Paint (Interior Emulsion)", brand: "Asian Paints", price: 205, unit: "per liter" },
    { name: "Paint (Exterior Emulsion)", brand: "Dulux", price: 265, unit: "per liter" },
  ],
  "West Bengal": [
    { name: "Cement (OPC 53 Grade)", brand: "Ambuja", price: 380, unit: "per bag (50kg)" },
    { name: "Cement (PPC)", brand: "Lafarge", price: 360, unit: "per bag (50kg)" },
    { name: "Sand (River)", brand: "Local", price: 65, unit: "per cubic ft" },
    { name: "Sand (M-Sand)", brand: "Local", price: 55, unit: "per cubic ft" },
    { name: "Bricks (Red Clay)", brand: "Local", price: 7.5, unit: "per piece" },
    { name: "Bricks (Fly Ash)", brand: "Local", price: 6.5, unit: "per piece" },
    { name: "Steel (TMT Bars)", brand: "TATA", price: 68, unit: "per kg" },
    { name: "Steel (TMT Bars)", brand: "SAIL", price: 65, unit: "per kg" },
    { name: "Aggregate (20mm)", brand: "Local", price: 45, unit: "per cubic ft" },
    { name: "Aggregate (10mm)", brand: "Local", price: 50, unit: "per cubic ft" },
    { name: "Tiles (Ceramic Floor)", brand: "Kajaria", price: 45, unit: "per sq ft" },
    { name: "Tiles (Vitrified)", brand: "Somany", price: 65, unit: "per sq ft" },
    { name: "Plywood (18mm)", brand: "Century", price: 95, unit: "per sq ft" },
    { name: "Plywood (12mm)", brand: "Greenply", price: 75, unit: "per sq ft" },
    { name: "Paint (Interior Emulsion)", brand: "Asian Paints", price: 220, unit: "per liter" },
    { name: "Paint (Exterior Emulsion)", brand: "Dulux", price: 280, unit: "per liter" },
  ],
}

// Generate default materials for states not in our database
const generateDefaultMaterials = (state: string) => {
  return [
    { name: "Cement (OPC 53 Grade)", brand: "UltraTech", price: 375, unit: "per bag (50kg)" },
    { name: "Cement (PPC)", brand: "ACC", price: 355, unit: "per bag (50kg)" },
    { name: "Sand (River)", brand: "Local", price: 60, unit: "per cubic ft" },
    { name: "Sand (M-Sand)", brand: "Local", price: 50, unit: "per cubic ft" },
    { name: "Bricks (Red Clay)", brand: "Local", price: 7, unit: "per piece" },
    { name: "Bricks (Fly Ash)", brand: "Local", price: 6, unit: "per piece" },
    { name: "Steel (TMT Bars)", brand: "TATA", price: 67, unit: "per kg" },
    { name: "Steel (TMT Bars)", brand: "JSW", price: 64, unit: "per kg" },
    { name: "Aggregate (20mm)", brand: "Local", price: 43, unit: "per cubic ft" },
    { name: "Aggregate (10mm)", brand: "Local", price: 48, unit: "per cubic ft" },
    { name: "Tiles (Ceramic Floor)", brand: "Kajaria", price: 44, unit: "per sq ft" },
    { name: "Tiles (Vitrified)", brand: "Somany", price: 64, unit: "per sq ft" },
    { name: "Plywood (18mm)", brand: "Century", price: 92, unit: "per sq ft" },
    { name: "Plywood (12mm)", brand: "Greenply", price: 72, unit: "per sq ft" },
    { name: "Paint (Interior Emulsion)", brand: "Asian Paints", price: 215, unit: "per liter" },
    { name: "Paint (Exterior Emulsion)", brand: "Dulux", price: 275, unit: "per liter" },
  ]
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const state = searchParams.get("state")

    if (!state) {
      return NextResponse.json({ message: "State parameter is required" }, { status: 400 })
    }

    // Format state name for lookup (convert hyphenated to proper case)
    const formattedState = state
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")

    // Get materials for the specified state
    const materials = materialsByState[formattedState] || generateDefaultMaterials(formattedState)

    // Log the material search
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (user) {
      await db.collection("userActivity").insertOne({
        userId: user._id.toString(),
        type: "material_search",
        details: `Searched for materials in ${formattedState}`,
        timestamp: new Date(),
      })
    }

    return NextResponse.json({ materials })
  } catch (error) {
    console.error("Material search error:", error)
    return NextResponse.json({ message: "An error occurred while searching for materials" }, { status: 500 })
  }
}

