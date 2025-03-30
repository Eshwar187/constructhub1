"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Download, RefreshCw, Layers, Search, Filter, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminFloorPlansPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [floorPlans, setFloorPlans] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [authError, setAuthError] = useState(false)

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/auth/check-admin")
        if (!response.ok) {
          setAuthError(true)
          router.push("/admin/login")
        } else {
          setIsAdmin(true)
          fetchFloorPlans()
        }
      } catch (error) {
        setAuthError(true)
        router.push("/admin/login")
      }
    }

    checkAdmin()
  }, [router])

  // Fetch floor plans
  const fetchFloorPlans = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/admin/floor-plans")
      if (response.ok) {
        const data = await response.json()
        setFloorPlans(data.floorPlans || [])
      } else {
        toast.error("Failed to load floor plans", {
          description: "Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error fetching floor plans:", error)
      toast.error("Error loading floor plans", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    fetchFloorPlans()
  }

  const handleDeleteFloorPlan = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/floor-plans/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setFloorPlans(floorPlans.filter((plan) => plan._id !== id))
        toast.success("Floor plan deleted", {
          description: "The floor plan has been deleted successfully.",
        })
      } else {
        const error = await response.json()
        toast.error("Failed to delete floor plan", {
          description: error.message || "Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error deleting floor plan:", error)
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  // Filter floor plans based on search query and filter type
  const filteredFloorPlans = floorPlans.filter((plan) => {
    const matchesSearch =
      plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.style?.toLowerCase().includes(searchQuery.toLowerCase())

    if (filterType === "all") return matchesSearch
    return matchesSearch && plan.status === filterType
  })

  if (authError) {
    return null // Don't render anything if there's an auth error, we'll redirect
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <Layers className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Checking permissions...</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Verifying your admin access</p>
          <div className="h-2 w-48 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                Floor Plans Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage and monitor all floor plans generated by users
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search floor plans..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floor Plans</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="grid" className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-1">
              <TabsTrigger value="grid" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                Grid View
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                List View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="pb-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </CardContent>
                      <CardFooter>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : filteredFloorPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Sample floor plans - in a real app, these would come from the API */}
                  <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Modern 2-Bedroom House</CardTitle>
                      <CardDescription>User: john.doe@example.com • Created: 2 days ago</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-video bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="/placeholder.svg?height=300&width=500"
                            alt="Floor plan"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm text-slate-500 dark:text-slate-400">1,200 sqft • 2 bed • 2 bath</div>
                        <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteFloorPlan("1")}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Contemporary 3-Bedroom Villa</CardTitle>
                      <CardDescription>User: sarah.smith@example.com • Created: 5 days ago</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative aspect-video bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img
                            src="/placeholder.svg?height=300&width=500"
                            alt="Floor plan"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-sm text-slate-500 dark:text-slate-400">2,000 sqft • 3 bed • 2.5 bath</div>
                        <div className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteFloorPlan("2")}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ) : (
                <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                      <Layers className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No floor plans found</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">
                      {searchQuery
                        ? `No floor plans match your search for "${searchQuery}"`
                        : "There are no floor plans available at the moment."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="list">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>All Floor Plans</CardTitle>
                  <CardDescription>Detailed list of all floor plans in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Name</th>
                          <th className="text-left py-3 px-4">User</th>
                          <th className="text-left py-3 px-4">Dimensions</th>
                          <th className="text-left py-3 px-4">Created</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          [1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="border-b animate-pulse">
                              <td className="py-3 px-4">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-40"></div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28"></div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                              </td>
                            </tr>
                          ))
                        ) : filteredFloorPlans.length > 0 ? (
                          <>
                            <tr className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-3 px-4">Modern 2-Bedroom House</td>
                              <td className="py-3 px-4">john.doe@example.com</td>
                              <td className="py-3 px-4">1,200 sqft • 2 bed • 2 bath</td>
                              <td className="py-3 px-4">2 days ago</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Active
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteFloorPlan("1")}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-3 px-4">Contemporary 3-Bedroom Villa</td>
                              <td className="py-3 px-4">sarah.smith@example.com</td>
                              <td className="py-3 px-4">2,000 sqft • 3 bed • 2.5 bath</td>
                              <td className="py-3 px-4">5 days ago</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  Active
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteFloorPlan("2")}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                              No floor plans found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

