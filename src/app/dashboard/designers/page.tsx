"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Users, Building2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { RealTimeDesigners } from "@/components/real-time-designers"

interface Project {
  _id: string
  name: string
  landArea: string
  budget: string
  state: string
  city: string
  budgetCategory?: string
}

export default function DesignersPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login")
    },
  })
  
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/projects")
          if (response.ok) {
            const data = await response.json()
            setProjects(data.projects || [])

            // Select the first project by default if available
            if (data.projects && data.projects.length > 0) {
              setSelectedProject(data.projects[0])
            }
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

  const handleProjectChange = (projectId: string) => {
    const project = projects.find((p) => p._id === projectId)
    if (project) {
      setSelectedProject(project)
    }
  }

  const handleCreateProject = () => {
    router.push("/dashboard/projects")
  }

  const handleDesignerConnect = (designer: any) => {
    // In a real app, you would save this connection to the database
    toast.success(`Connected with ${designer.name}`, {
      description: "We'll notify them about your project",
    })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
            <Users className="h-8 w-8 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">Loading designers data...</p>
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
                Local Designers
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Connect with interior designers and contractors in your area
              </p>
            </div>

            {projects.length > 0 && (
              <Select value={selectedProject?._id} onValueChange={handleProjectChange}>
                <SelectTrigger className="w-[250px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {projects.length > 0 && selectedProject ? (
            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Interior Designers in {selectedProject.city}</CardTitle>
                <CardDescription>Real-time availability of professionals for your project</CardDescription>
              </CardHeader>
              <CardContent>
                <RealTimeDesigners
                  location={{
                    type: "local",
                    city: selectedProject.city,
                    state: selectedProject.state
                  }}
                  budget={selectedProject.budgetCategory || "medium"}
                  onConnect={handleDesignerConnect}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">No projects found</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">
                  You need to create a project first to find designers in your area.
                </p>
                <Button
                  onClick={handleCreateProject}
                  className="bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500 text-white"
                  size="lg"
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

