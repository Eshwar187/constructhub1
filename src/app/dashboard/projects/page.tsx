"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PlusCircle, Search, Building2, Filter, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProjectCard } from "@/components/project-card"
import { NewProjectDialog } from "@/components/new-project-dialog"

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
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch user projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/projects")
          if (response.ok) {
            const data = await response.json()
            setProjects(data.projects || [])
            setFilteredProjects(data.projects || [])
          } else {
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
        }
      }
    }

    if (status === "authenticated") {
      fetchProjects()
    }
  }, [status])

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
          (project.description && project.description.toLowerCase().includes(search)),
      )
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
        default:
          comparison = 0
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredProjects(result)
  }, [projects, searchTerm, statusFilter, sortBy, sortOrder])

  const handleCreateProject = async (projectData: any) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects([...projects, newProject.project])
        toast.success("Project created", {
          description: "Your new project has been created successfully.",
        })
        setIsNewProjectOpen(false)
      } else {
        const error = await response.json()
        toast.error("Failed to create project", {
          description: error.message || "Please try again later.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    }
  }

  const handleProjectDeleted = (projectId: string) => {
    setProjects(projects.filter((p) => p._id !== projectId))
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
            <Building2 className="h-8 w-8 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col">
        <DashboardHeader />

        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
                My Projects
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your construction projects and track their progress
              </p>
            </div>
            <Button
              onClick={() => setIsNewProjectOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500 text-white shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Project
            </Button>
          </div>

          <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 mb-6">
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Project List</CardTitle>
                  <CardDescription>All your construction projects in one place</CardDescription>
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                      type="search"
                      placeholder="Search projects..."
                      className="pl-9 w-full md:w-64 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      onProjectDeleted={() => handleProjectDeleted(project._id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                      <Building2 className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No projects yet</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">
                      {searchTerm || statusFilter !== "all"
                        ? "No projects match your search criteria. Try adjusting your filters."
                        : "Create your first construction project to get started with AI-powered recommendations for floor plans, materials, and local designers."}
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <Button
                        onClick={() => setIsNewProjectOpen(true)}
                        className="bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500 text-white"
                        size="lg"
                      >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Create Project
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <NewProjectDialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} onSubmit={handleCreateProject} />
    </div>
  )
}

