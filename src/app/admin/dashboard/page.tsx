"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  MessageSquare,
  BarChart3,
  Search,
  Download,
  MoreHorizontal,
  FileText,
  Building2,
  Layers,
  RefreshCw,
  Shield,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminUserDetailsDialog } from "@/components/admin-user-details-dialog"
import { AdminQueryDetailsDialog } from "@/components/admin-query-details-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define types for our data structures
interface UserType {
  _id: string
  username: string
  email: string
  createdAt: string
  lastLogin?: string
  queriesCount?: number
  projectsCount?: number
  recentActivity?: Activity[]
}

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

interface Project {
  _id: string
  name: string
  description?: string
  landArea: string
  budget: string
  state: string
  city: string
  createdAt: string
  status?: string
  userId: string
  username?: string
  userEmail?: string
}

interface Activity {
  _id: string
  userId: string
  type: string
  details: string
  timestamp: string
  projectId?: string
}

interface Stats {
  totalUsers: number
  totalQueries: number
  activeUsers: number
  conversionRate: number
  newUsers: number
  newQueries: number
  totalProjects: number
  totalFloorPlans: number
  conversionRateChange: number
  newProjects?: number
}

// Define props for AdminRealTimeStats
interface AdminRealTimeStatsProps {
  initialStats: Stats
}

// AdminRealTimeStats Component
const AdminRealTimeStats: React.FC<AdminRealTimeStatsProps> = ({ initialStats }) => {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle>Real-Time Statistics</CardTitle>
        <CardDescription>Live platform metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Users</p>
            <p className="text-2xl font-bold">{initialStats.totalUsers}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Queries</p>
            <p className="text-2xl font-bold">{initialStats.totalQueries}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Users</p>
            <p className="text-2xl font-bold">{initialStats.activeUsers}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Projects</p>
            <p className="text-2xl font-bold">{initialStats.totalProjects}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<UserType[]>([])
  const [queries, setQueries] = useState<Query[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [filteredQueries, setFilteredQueries] = useState<Query[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalQueries: 0,
    activeUsers: 0,
    conversionRate: 0,
    newUsers: 0,
    newQueries: 0,
    totalProjects: 0,
    totalFloorPlans: 0,
    conversionRateChange: 0,
  })
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false)
  const [isQueryDetailsOpen, setIsQueryDetailsOpen] = useState(false)
  const [timeFilter, setTimeFilter] = useState("all")
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
        fetchData()
      }
    } catch (err) {
      console.error("Admin check error:", err)
      setAuthError(true)
      router.push("/admin/login")
    }
  }, [router])

  useEffect(() => {
    checkAdmin()
  }, [checkAdmin])

  // Fetch admin dashboard data
  const fetchData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Fetch users
      const usersResponse = await fetch("/api/admin/users")
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users || [])
        setFilteredUsers(usersData.users || [])
      } else if (usersResponse.status === 401) {
        setAuthError(true)
        router.push("/admin/login")
        return
      } else {
        console.error("Failed to fetch users")
      }

      // Fetch queries
      const queriesResponse = await fetch("/api/admin/queries")
      if (queriesResponse.ok) {
        const queriesData = await queriesResponse.json()
        setQueries(queriesData.queries || [])
        setFilteredQueries(queriesData.queries || [])
      } else if (queriesResponse.status === 401) {
        setAuthError(true)
        router.push("/admin/login")
        return
      } else {
        console.error("Failed to fetch queries")
      }

      // Fetch projects
      const projectsResponse = await fetch("/api/admin/projects")
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.projects || [])
        setFilteredProjects(projectsData.projects || [])
      } else if (projectsResponse.status === 401) {
        setAuthError(true)
        router.push("/admin/login")
        return
      } else {
        console.error("Failed to fetch projects")
      }

      // Fetch stats
      const statsResponse = await fetch("/api/admin/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else if (statsResponse.status === 401) {
        setAuthError(true)
        router.push("/admin/login")
        return
      } else {
        console.error("Failed to fetch stats")
      }
    } catch (err) {
      console.error("Error fetching admin data:", err)
      toast.error("Failed to load data", {
        description: "Please try again later.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [router])

  // Filter users, queries, and projects based on search term and time filter
  useEffect(() => {
    let filteredU = users
    let filteredQ = queries
    let filteredP = projects

    if (searchTerm) {
      filteredU = users.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      filteredQ = queries.filter(
        (query) =>
          query.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.query?.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      filteredP = projects.filter(
        (project) =>
          project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.state?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

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

      filteredU = filteredU.filter((user) => new Date(user.createdAt) >= cutoffDate)
      filteredQ = filteredQ.filter((query) => new Date(query.timestamp) >= cutoffDate)
      filteredP = filteredP.filter((project) => new Date(project.createdAt) >= cutoffDate)
    }

    setFilteredUsers(filteredU)
    setFilteredQueries(filteredQ)
    setFilteredProjects(filteredP)
  }, [searchTerm, timeFilter, users, queries, projects])

  const handleViewUserDetails = (user: UserType) => {
    setSelectedUser(user)
    setIsUserDetailsOpen(true)
  }

  const handleViewQueryDetails = (query: Query) => {
    setSelectedQuery(query)
    setIsQueryDetailsOpen(true)
  }

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/admin/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `constructhub-data-${format(new Date(), "yyyy-MM-dd")}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success("Data exported", {
          description: "The data has been exported successfully.",
        })
      } else if (response.status === 401) {
        setAuthError(true)
        router.push("/admin/login")
      } else {
        toast.error("Export failed", {
          description: "Failed to export data. Please try again.",
        })
      }
    } catch (err) {
      console.error("Export error:", err)
      toast.error("Export failed", {
        description: "An error occurred while exporting data.",
      })
    }
  }

  const handleRefreshData = () => {
    fetchData()
    toast.success("Data refreshed", {
      description: "Dashboard data has been updated.",
    })
  }

  if (authError) {
    return null
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Shield className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Authentication</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Verifying your admin credentials...</p>
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
                Admin Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor and manage ConstructHub platform data</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[130px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Filter by time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search users, queries..."
                    className="w-64 pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  onClick={handleExportData}
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>

          <AdminRealTimeStats initialStats={stats} />

          <Tabs defaultValue="users" className="space-y-6 mt-8">
            <TabsList className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-1">
              <TabsTrigger value="users" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                Users
              </TabsTrigger>
              <TabsTrigger value="queries" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                User Queries
              </TabsTrigger>
              <TabsTrigger value="projects" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all registered users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse flex items-center space-x-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/12"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/12"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/12"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-slate-200 dark:border-slate-700">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800">
                          <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Registered On</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Queries</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                              <TableRow key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell className="font-medium">{user._id.toString().substring(0, 6)}...</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                                <TableCell>
                                  {user.lastLogin ? format(new Date(user.lastLogin), "MMM d, yyyy") : "Never"}
                                </TableCell>
                                <TableCell className="text-right">{user.queriesCount || 0}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">Delete User</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-6">
                                No users found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="queries">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>User Queries</CardTitle>
                  <CardDescription>Monitor what users are asking the AI assistant.</CardDescription>
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
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead className="w-[400px]">Query</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredQueries.length > 0 ? (
                            filteredQueries.map((query) => (
                              <TableRow key={query._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <TableCell className="font-medium">{query._id.toString().substring(0, 6)}...</TableCell>
                                <TableCell>{query.username}</TableCell>
                                <TableCell className="max-w-[400px] truncate">{query.query}</TableCell>
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
                                      <DropdownMenuItem className="text-red-600">Delete Query</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6">
                                No queries found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="projects">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>View all construction projects created by users.</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse flex items-center space-x-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/12"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredProjects.length > 0 ? (
                    <div className="rounded-md border border-slate-200 dark:border-slate-700">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800">
                          <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Project Name</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Created On</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProjects.map((project) => (
                            <TableRow key={project._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <TableCell className="font-medium">{project._id.toString().substring(0, 6)}...</TableCell>
                              <TableCell>{project.name}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                    <User className="h-4 w-4 text-slate-500" />
                                  </div>
                                  <div>
                                    <div>{project.username || "Unknown"}</div>
                                    <div className="text-xs text-slate-500">{project.userEmail}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {project.city}, {project.state}
                              </TableCell>
                              <TableCell>₹{project.budget}</TableCell>
                              <TableCell>{format(new Date(project.createdAt), "MMM d, yyyy")}</TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                    <DropdownMenuItem>View User Profile</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">Delete Project</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No projects found</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
                        {searchTerm ? "No projects match your search criteria." : "No projects have been created yet."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>New user registrations over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                          Interactive charts will be displayed here with real-time data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle>Query Analytics</CardTitle>
                    <CardDescription>AI assistant usage patterns</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                          Interactive charts will be displayed here with real-time data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle>Project Distribution</CardTitle>
                    <CardDescription>Projects by location and budget</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <Building2 className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                          Interactive charts will be displayed here with real-time data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle>Feature Usage</CardTitle>
                    <CardDescription>Most used platform features</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <Layers className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">
                          Interactive charts will be displayed here with real-time data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {selectedUser && (
        <AdminUserDetailsDialog user={selectedUser} open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen} />
      )}

      {selectedQuery && (
        <AdminQueryDetailsDialog query={selectedQuery} open={isQueryDetailsOpen} onOpenChange={setIsQueryDetailsOpen} />
      )}
    </div>
  )
}