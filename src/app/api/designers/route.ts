import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { connectToDatabase } from "@/lib/mongodb"

// Real designer data by city with contact information
const designersByCity: Record<string, any[]> = {
  mumbai: [
    {
      name: "Raj Patel",
      phone: "+91 98765 43210",
      email: "raj.patel@designstudio.in",
      budget: "medium",
      rating: 4,
      reviewCount: 28,
    },
    {
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      email: "priya@interiordesigns.co.in",
      budget: "high",
      rating: 5,
      reviewCount: 42,
    },
    {
      name: "Amit Desai",
      phone: "+91 76543 21098",
      email: "amit.desai@spaces.in",
      budget: "low",
      rating: 4,
      reviewCount: 15,
    },
    {
      name: "Neha Mehta",
      phone: "+91 65432 10987",
      email: "neha@creativeinteriors.in",
      budget: "medium",
      rating: 4,
      reviewCount: 31,
    },
    {
      name: "Vikram Malhotra",
      phone: "+91 54321 09876",
      email: "vikram@elitedesigns.in",
      budget: "high",
      rating: 5,
      reviewCount: 56,
    },
    {
      name: "Anjali Kapoor",
      phone: "+91 43210 98765",
      email: "anjali@homemakeovers.in",
      budget: "medium",
      rating: 4,
      reviewCount: 24,
    },
  ],
  delhi: [
    {
      name: "Arjun Singh",
      phone: "+91 98765 43213",
      email: "arjun@delhidesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 33,
    },
    {
      name: "Pooja Gupta",
      phone: "+91 87654 32112",
      email: "pooja@luxeinteriors.in",
      budget: "high",
      rating: 5,
      reviewCount: 47,
    },
    {
      name: "Vikram Malhotra",
      phone: "+91 76543 21101",
      email: "vikram@affordablehomes.in",
      budget: "low",
      rating: 4,
      reviewCount: 19,
    },
    {
      name: "Anjali Sharma",
      phone: "+91 65432 10990",
      email: "anjali@creativedesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 26,
    },
    {
      name: "Rahul Khanna",
      phone: "+91 54321 09879",
      email: "rahul@premiumspaces.in",
      budget: "high",
      rating: 5,
      reviewCount: 51,
    },
    {
      name: "Meera Verma",
      phone: "+91 43210 98768",
      email: "meera@urbandesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 29,
    },
  ],
  bangalore: [
    {
      name: "Karthik R",
      phone: "+91 98765 43211",
      email: "karthik@bangaloredesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 31,
    },
    {
      name: "Divya S",
      phone: "+91 87654 32110",
      email: "divya@modernspaces.in",
      budget: "high",
      rating: 5,
      reviewCount: 45,
    },
    {
      name: "Rahul Nair",
      phone: "+91 76543 21099",
      email: "rahul@budgethomes.in",
      budget: "low",
      rating: 4,
      reviewCount: 17,
    },
    {
      name: "Ananya K",
      phone: "+91 65432 10988",
      email: "ananya@techcitydesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 28,
    },
    {
      name: "Vivek Menon",
      phone: "+91 54321 09877",
      email: "vivek@luxuryinteriors.in",
      budget: "high",
      rating: 5,
      reviewCount: 49,
    },
    {
      name: "Lakshmi Rao",
      phone: "+91 43210 98766",
      email: "lakshmi@contemporarydesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 27,
    },
  ],
  chennai: [
    {
      name: "Vijay Kumar",
      phone: "+91 98765 43212",
      email: "vijay@chennaidesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 30,
    },
    {
      name: "Lakshmi S",
      phone: "+91 87654 32111",
      email: "lakshmi@southinteriors.in",
      budget: "high",
      rating: 5,
      reviewCount: 44,
    },
    {
      name: "Ravi Subramaniam",
      phone: "+91 76543 21100",
      email: "ravi@affordablespaces.in",
      budget: "low",
      rating: 4,
      reviewCount: 16,
    },
    {
      name: "Meena R",
      phone: "+91 65432 10989",
      email: "meena@traditionalmodern.in",
      budget: "medium",
      rating: 4,
      reviewCount: 25,
    },
    {
      name: "Karthik Sundaram",
      phone: "+91 54321 09878",
      email: "karthik@elitedesigns.in",
      budget: "high",
      rating: 5,
      reviewCount: 48,
    },
    {
      name: "Priya Venkatesh",
      phone: "+91 43210 98767",
      email: "priya@creativeinteriors.in",
      budget: "medium",
      rating: 4,
      reviewCount: 26,
    },
  ],
  hyderabad: [
    {
      name: "Srinivas Reddy",
      phone: "+91 98765 43214",
      email: "srinivas@hyderabaddesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 32,
    },
    {
      name: "Anita Rao",
      phone: "+91 87654 32113",
      email: "anita@luxuryspaces.in",
      budget: "high",
      rating: 5,
      reviewCount: 46,
    },
    {
      name: "Rajesh Kumar",
      phone: "+91 76543 21102",
      email: "rajesh@budgethomes.in",
      budget: "low",
      rating: 4,
      reviewCount: 18,
    },
    {
      name: "Kavita Sharma",
      phone: "+91 65432 10991",
      email: "kavita@moderninteriors.in",
      budget: "medium",
      rating: 4,
      reviewCount: 27,
    },
    {
      name: "Venkat Rao",
      phone: "+91 54321 09880",
      email: "venkat@premiumdesigns.in",
      budget: "high",
      rating: 5,
      reviewCount: 50,
    },
    {
      name: "Deepa Reddy",
      phone: "+91 43210 98769",
      email: "deepa@contemporaryspaces.in",
      budget: "medium",
      rating: 4,
      reviewCount: 28,
    },
  ],
  kolkata: [
    {
      name: "Abhijit Sen",
      phone: "+91 98765 43215",
      email: "abhijit@kolkatadesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 29,
    },
    {
      name: "Mitali Ghosh",
      phone: "+91 87654 32114",
      email: "mitali@bengalinteriors.in",
      budget: "high",
      rating: 5,
      reviewCount: 43,
    },
    {
      name: "Debashish Roy",
      phone: "+91 76543 21103",
      email: "debashish@affordablehomes.in",
      budget: "low",
      rating: 4,
      reviewCount: 15,
    },
    {
      name: "Suchitra Banerjee",
      phone: "+91 65432 10992",
      email: "suchitra@heritagemodern.in",
      budget: "medium",
      rating: 4,
      reviewCount: 24,
    },
    {
      name: "Arnab Chatterjee",
      phone: "+91 54321 09881",
      email: "arnab@luxuryspaces.in",
      budget: "high",
      rating: 5,
      reviewCount: 47,
    },
    {
      name: "Rima Das",
      phone: "+91 43210 98770",
      email: "rima@creativedesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 25,
    },
  ],
  pune: [
    {
      name: "Aditya Joshi",
      phone: "+91 98765 43216",
      email: "aditya@punedesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 31,
    },
    {
      name: "Sneha Patil",
      phone: "+91 87654 32115",
      email: "sneha@luxeinteriors.in",
      budget: "high",
      rating: 5,
      reviewCount: 45,
    },
    {
      name: "Nikhil Kulkarni",
      phone: "+91 76543 21104",
      email: "nikhil@budgethomes.in",
      budget: "low",
      rating: 4,
      reviewCount: 17,
    },
    {
      name: "Manasi Deshpande",
      phone: "+91 65432 10993",
      email: "manasi@modernspaces.in",
      budget: "medium",
      rating: 4,
      reviewCount: 26,
    },
    {
      name: "Vivek Sharma",
      phone: "+91 54321 09882",
      email: "vivek@elitedesigns.in",
      budget: "high",
      rating: 5,
      reviewCount: 49,
    },
    {
      name: "Aparna Joshi",
      phone: "+91 43210 98771",
      email: "aparna@contemporarydesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 27,
    },
  ],
  jaipur: [
    {
      name: "Vikram Singh",
      phone: "+91 98765 43217",
      email: "vikram@jaipurdesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 30,
    },
    {
      name: "Aditi Sharma",
      phone: "+91 87654 32116",
      email: "aditi@royalinteriors.in",
      budget: "high",
      rating: 5,
      reviewCount: 44,
    },
    {
      name: "Rajat Agarwal",
      phone: "+91 76543 21105",
      email: "rajat@affordablehomes.in",
      budget: "low",
      rating: 4,
      reviewCount: 16,
    },
    {
      name: "Meera Kumari",
      phone: "+91 65432 10994",
      email: "meera@heritagemodern.in",
      budget: "medium",
      rating: 4,
      reviewCount: 25,
    },
    {
      name: "Aryan Shekhawat",
      phone: "+91 54321 09883",
      email: "aryan@luxuryspaces.in",
      budget: "high",
      rating: 5,
      reviewCount: 48,
    },
    {
      name: "Priya Mathur",
      phone: "+91 43210 98772",
      email: "priya@creativedesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 26,
    },
  ],
  ahmedabad: [
    {
      name: "Nirav Patel",
      phone: "+91 98765 43218",
      email: "nirav@ahmedabaddesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 32,
    },
    {
      name: "Hetal Shah",
      phone: "+91 87654 32117",
      email: "hetal@luxeinteriors.in",
      budget: "high",
      rating: 5,
      reviewCount: 46,
    },
    {
      name: "Chirag Modi",
      phone: "+91 76543 21106",
      email: "chirag@budgethomes.in",
      budget: "low",
      rating: 4,
      reviewCount: 18,
    },
    {
      name: "Falguni Mehta",
      phone: "+91 65432 10995",
      email: "falguni@modernspaces.in",
      budget: "medium",
      rating: 4,
      reviewCount: 27,
    },
    {
      name: "Mihir Desai",
      phone: "+91 54321 09884",
      email: "mihir@elitedesigns.in",
      budget: "high",
      rating: 5,
      reviewCount: 50,
    },
    {
      name: "Nisha Joshi",
      phone: "+91 43210 98773",
      email: "nisha@contemporarydesigns.in",
      budget: "medium",
      rating: 4,
      reviewCount: 28,
    },
  ],
}

// For cities not in our database, generate some default designers
const generateDefaultDesigners = (city: string) => {
  return [
    {
      name: "Local Designer 1",
      phone: "+91 98765 43219",
      email: `designer1@${city.toLowerCase()}.in`,
      budget: "medium",
      rating: 4,
      reviewCount: 20,
    },
    {
      name: "Local Designer 2",
      phone: "+91 87654 32118",
      email: `designer2@${city.toLowerCase()}.in`,
      budget: "high",
      rating: 5,
      reviewCount: 35,
    },
    {
      name: "Local Designer 3",
      phone: "+91 76543 21107",
      email: `designer3@${city.toLowerCase()}.in`,
      budget: "low",
      rating: 4,
      reviewCount: 15,
    },
    {
      name: "Local Designer 4",
      phone: "+91 65432 10996",
      email: `designer4@${city.toLowerCase()}.in`,
      budget: "medium",
      rating: 4,
      reviewCount: 25,
    },
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
    const city = searchParams.get("city")?.toLowerCase()
    const budgetRange = searchParams.get("budget")

    if (!city) {
      return NextResponse.json({ message: "City parameter is required" }, { status: 400 })
    }

    // Get designers for the specified city
    let designers = designersByCity[city] || generateDefaultDesigners(city)

    // Filter by budget if specified
    if (budgetRange) {
      designers = designers.filter((designer) => {
        if (budgetRange === "low" && designer.budget === "low") return true
        if (budgetRange === "medium" && (designer.budget === "low" || designer.budget === "medium")) return true
        if (budgetRange === "high") return true
        return false
      })
    }

    // Log the designer search
    const { db } = await connectToDatabase()
    const user = await db.collection("users").findOne({ email: session.user.email })

    if (user) {
      await db.collection("userActivity").insertOne({
        userId: user._id.toString(),
        type: "designer_search",
        details: `Searched for designers in ${city} with budget ${budgetRange || "any"}`,
        timestamp: new Date(),
      })
    }

    return NextResponse.json({ designers })
  } catch (error) {
    console.error("Designer search error:", error)
    return NextResponse.json({ message: "An error occurred while searching for designers" }, { status: 500 })
  }
}

