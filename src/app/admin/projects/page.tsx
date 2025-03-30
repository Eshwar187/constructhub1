"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Building2, Search, Download, MoreHorizontal, Filter, ArrowUpDown, RefreshCw, User, MapPin } from "lucide-react"
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

export default function AdminProjectsPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [stateFilter, setStateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
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
        fetchProjects()
      }
    } catch (error) {
      setAuthError(true)
      router.push("/admin/login")
    }
  }, [router])

  useEffect(() => {
    checkAdmin()
  }, [checkAdmin])

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/admin/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
        setFilteredProjects(data.projects || [])
      } else if (response.status === 401) {
        setAuthError(true)
        router.push("/admin/login")
        return
      } else {
        console.error("Failed to fetch projects")
        toast.error("Failed to load projects", {
          description: "Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Error loading projects", {
        description: "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [router])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...projects]

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(
        (project) =>
          project.name.toLowerCase().includes(search) ||
          project.city.toLowerCase().includes(search) ||
          project.state.toLowerCase().includes(search) ||
          (project.username && project.username.toLowerCase().includes(search)) ||
          (project.userEmail && project.userEmail.toLowerCase().includes(search)),
      )
    }

    // Apply state filter
    if (stateFilter !== "all") {
      result = result.filter((project) => project.state === stateFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((project) => project.status === statusFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "budget":
          comparison =
            Number.parseFloat(a.budget.replace(/[^0-9]/g, "")) - Number.parseFloat(b.budget.replace(/[^0-9]/g, ""))
          break
        case "landArea":
          comparison = Number.parseFloat(a.landArea) - Number.parseFloat(b.landArea)
          break
        case "username":
          comparison = (a.username || "").localeCompare(b.username || "")
          break
        default:
          comparison = 0
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredProjects(result)
  }, [projects, searchTerm, stateFilter, statusFilter, sortBy, sortOrder])

  const handleRefresh = () => {
    fetchProjects()
    toast.success("Projects refreshed", {
      description: "The project list has been updated.",
    })
  }

  const handleExport = () => {
    // In a real app, this would export the projects to CSV
    toast.success("Projects exported", {
      description: "The project data has been exported to CSV.",
    })
  }

  const handleDelete = (projectId: string) => {
    // In a real app, this would delete the project
    setProjects(projects.filter((p) => p._id !== projectId))
    setFilteredProjects(filteredProjects.filter((p) => p._id !== projectId))
    toast.success("Project deleted", {
      description: "The project has been deleted successfully.",
    })
  }

  // Get unique states for filter
  const uniqueStates = [...new Set(projects.map((project) => project.state))].sort()

  if (authError) {
    return null // Don't render anything if there's an auth error, we'll redirect
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-amber-500 mx-auto mb-4" />
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
                Projects Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Monitor and manage all construction projects on the platform
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
              <CardTitle>Project Analytics</CardTitle>
              <CardDescription>Overview of construction projects on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{projects.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Active Users
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{new Set(projects.map((p) => p.userId)).size}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Avg. Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projects.length > 0
                        ? `₹${Math.round(projects.reduce((acc, p) => acc + Number.parseFloat(p.budget.replace(/[^0-9]/g, "")), 0) / projects.length).toLocaleString("en-IN")}`
                        : "₹0"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Top State</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projects.length > 0
                        ? Object.entries(
                            projects.reduce(
                              (acc, p) => {
                                acc[p.state] = (acc[p.state] || 0) + 1
                                return acc
                              },
                              {} as Record<string, number>,
                            ),
                          ).sort((a, b) => b[1] - a[1])[0][0]
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
                  <CardTitle>Project List</CardTitle>
                  <CardDescription>All construction projects created by users</CardDescription>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search projects or users..."
                      className="pl-9 w-full md:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Select value={stateFilter} onValueChange={setStateFilter}>
                      <SelectTrigger className="w-[130px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <MapPin className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {uniqueStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="planning">Planning</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[130px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Date Created</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="landArea">Land Area</SelectItem>
                        <SelectItem value="username">User</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    >
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </Button>
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
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/12"></div>
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
                        <TableHead>Project Name</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Budget</TableHead>
                        <TableHead>Land Area</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created On</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => (
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
                            <TableCell>{project.landArea} acres</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  project.status === "completed"
                                    ? "success"
                                    : project.status === "in_progress"
                                      ? "default"
                                      : project.status === "planning"
                                        ? "secondary"
                                        : "default"
                                }
                              >
                                {project.status === "completed"
                                  ? "Completed"
                                  : project.status === "in_progress"
                                    ? "In Progress"
                                    : project.status === "planning"
                                      ? "Planning"
                                      : "In Progress"}
                              </Badge>
                            </TableCell>
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
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(project._id)}>
                                    Delete Project
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6">
                            <div className="flex flex-col items-center justify-center">
                              <Building2 className="h-8 w-8 text-slate-400 mb-2" />
                              <p className="text-slate-500 dark:text-slate-400">No projects found</p>
                              <p className="text-sm text-slate-400 dark:text-slate-500">
                                {searchTerm || stateFilter !== "all" || statusFilter !== "all"
                                  ? "Try adjusting your search or filters"
                                  : "No projects have been created yet"}
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
    </div>
  )
}

