"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  MessageSquare,
  Search,
  Download,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  RefreshCw,
  User,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminQueryDetailsDialog } from "@/components/admin-query-details-dialog"

interface Query {
  _id: string
  userId: string
  username: string
  userEmail?: string
  query: string
  timestamp: string
  response?: string
  projectId?: string
  projectName?: string
  type?: string
  processingTime?: number
  ipAddress?: string
}

export default function AdminQueriesPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [queries, setQueries] = useState<Query[]>([])
  const [filteredQueries, setFilteredQueries] = useState<Query[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [isQueryDetailsOpen, setIsQueryDetailsOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("timestamp")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [authError, setAuthError] = useState(false)

  // Check if user is admin
  const checkAdmin = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/check-admin")
      if (!response.ok) {
        setAuthError(true)
        router.push("/admin/login")
      } else {
        setIsAdmin(true)
        fetchQueries()
      }
    } catch (error) {
      setAuthError(true)
      router.push("/admin/login")
    }
  }, [router])

  useEffect(() => {
    checkAdmin()
  }, [checkAdmin])

  // Fetch queries
  const fetchQueries = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/admin/queries")
      if (response.ok) {
        const data = await response.json()
        setQueries(data.queries || [])
        setFilteredQueries(data.queries || [])
      } else if (response.status === 401) {
        setAuthError(true)
        router.push("/admin/login")
        return
      } else {
        console.error("Failed to fetch queries")
        toast.error("Failed to load queries", {
          description: "Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error fetching queries:", error)
      toast.error("Error loading queries", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [router])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...queries]

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(
        (query) =>
          query.query.toLowerCase().includes(search) ||
          query.username.toLowerCase().includes(search) ||
          (query.userEmail && query.userEmail.toLowerCase().includes(search)),
      )
    }

    // Apply time filter
    if (timeFilter !== "all") {
      const now = new Date()
      const cutoffDate = new Date()

      switch (timeFilter) {
        case "today":
          cutoffDate.setHours(0, 0, 0, 0)
          break
        case "week":
          cutoffDate.setDate(now.getDate() - 7)
          break
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        default:
          break
      }

      result = result.filter((query) => new Date(query.timestamp) >= cutoffDate)
    }

    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter((query) => query.type === typeFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "timestamp":
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          break
        case "username":
          comparison = a.username.localeCompare(b.username)
          break
        case "query":
          comparison = a.query.localeCompare(b.query)
          break
        default:
          comparison = 0
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredQueries(result)
  }, [queries, searchTerm, timeFilter, typeFilter, sortBy, sortOrder])

  const handleViewQueryDetails = (query: Query) => {
    setSelectedQuery(query)
    setIsQueryDetailsOpen(true)
  }

  const handleRefresh = () => {
    fetchQueries()
    toast.success("Queries refreshed", {
      description: "The query list has been updated.",
    })
  }

  const handleExport = () => {
    // In a real app, this would export the queries to CSV
    toast.success("Queries exported", {
      description: "The query data has been exported to CSV.",
    })
  }

  const handleDelete = (queryId: string) => {
    // In a real app, this would delete the query
    setQueries(queries.filter((q) => q._id !== queryId))
    setFilteredQueries(filteredQueries.filter((q) => q._id !== queryId))
    toast.success("Query deleted", {
      description: "The query has been deleted successfully.",
    })
  }

  if (authError) {
    return null // Don't render anything if there's an auth error, we'll redirect
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-amber-500 mx-auto mb-4" />
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
                User Queries
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Monitor and analyze user interactions with the AI assistant
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
              <Button
                variant="outline"
                className="gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                onClick={handleExport}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Query Analytics</CardTitle>
              <CardDescription>Overview of AI assistant usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Queries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{queries.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Today's Queries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {
                        queries.filter((q) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return new Date(q.timestamp) >= today
                        }).length
                      }
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Unique Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{new Set(queries.map((q) => q.userId)).size}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Avg. Response Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {queries.length > 0
                        ? `${Math.round(queries.reduce((acc, q) => acc + (q.processingTime || 0), 0) / queries.length)} ms`
                        : "N/A"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Query List</CardTitle>
                  <CardDescription>All user interactions with the AI assistant</CardDescription>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search queries or users..."
                      className="pl-9 w-full md:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-[130px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <Calendar className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Time period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[130px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Query type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="floor_plan">Floor Plan</SelectItem>
                        <SelectItem value="material">Materials</SelectItem>
                        <SelectItem value="designer">Designers</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/12"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/12"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-slate-200 dark:border-slate-700">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800">
                      <TableRow>
                        <TableHead className="w-[100px]">
                          <div className="flex items-center gap-1">
                            ID
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                if (sortBy === "id") {
                                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                                } else {
                                  setSortBy("id")
                                  setSortOrder("asc")
                                }
                              }}
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            User
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                if (sortBy === "username") {
                                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                                } else {
                                  setSortBy("username")
                                  setSortOrder("asc")
                                }
                              }}
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="w-[400px]">
                          <div className="flex items-center gap-1">
                            Query
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                if (sortBy === "query") {
                                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                                } else {
                                  setSortBy("query")
                                  setSortOrder("asc")
                                }
                              }}
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1">
                            Timestamp
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                if (sortBy === "timestamp") {
                                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                                } else {
                                  setSortBy("timestamp")
                                  setSortOrder("asc")
                                }
                              }}
                            >
                              <ArrowUpDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQueries.length > 0 ? (
                        filteredQueries.map((query) => (
                          <TableRow key={query._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <TableCell className="font-medium">{query._id.toString().substring(0, 6)}...</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                  <User className="h-4 w-4 text-slate-500" />
                                </div>
                                <div>
                                  <div>{query.username}</div>
                                  <div className="text-xs text-slate-500">{query.userEmail}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[400px] truncate">{query.query}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  query.type === "floor_plan"
                                    ? "default"
                                    : query.type === "material"
                                      ? "secondary"
                                      : query.type === "designer"
                                        ? "outline"
                                        : "default"
                                }
                              >
                                {query.type || "General"}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(query.timestamp), "MMM d, yyyy HH:mm")}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewQueryDetails(query)}>
                                    View Full Query
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>View User Profile</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(query._id)}>
                                    Delete Query
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center">
                              <MessageSquare className="h-8 w-8 text-slate-400 mb-2" />
                              <p className="text-slate-500 dark:text-slate-400">No queries found</p>
                              <p className="text-sm text-slate-400 dark:text-slate-500">
                                {searchTerm ? "Try adjusting your search or filters" : "No queries have been made yet"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {selectedQuery && (
        <AdminQueryDetailsDialog query={selectedQuery} open={isQueryDetailsOpen} onOpenChange={setIsQueryDetailsOpen} />
      )}
    </div>
  )
}

