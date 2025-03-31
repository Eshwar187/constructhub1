"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Building2, PlusCircle, MessageSquare, Users, Paintbrush, Layers, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ProjectCard } from "@/components/project-card"
import { NewProjectDialog } from "@/components/new-project-dialog"
import { RecentActivityList } from "@/components/recent-activity-list"

// Define types for our data structures
interface Project {
  _id: string
  name: string
  description?: string
  landArea: string
  landAreaUnit?: string
  budget: string
  currency?: string
  locationType?: string
  region?: string
  country?: string
  state?: string
  city?: string
  createdAt: string
  status?: string
  userId: string
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
  totalProjects: number
  aiConsultations: number
  floorPlansGenerated: number
  materialsSearched: number
  designersContacted: number
  lastActive: string
}

export default function DashboardPage() {
  const { data: session, status, update } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login")
    },
  })
  
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    aiConsultations: 0,
    floorPlansGenerated: 0,
    materialsSearched: 0,
    designersContacted: 0,
    lastActive: new Date().toISOString(),
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)

  // Fetch user projects and activity
  useEffect(() => {
    const fetchData = async () => {
      if (status === "authenticated") {
        try {
          // Fetch projects
          const projectsResponse = await fetch("/api/projects")
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json()
            setProjects(projectsData.projects || [])

            // Calculate total projects here, after projectsData is available
            setStats((prev) => ({
              ...prev,
              totalProjects: projectsData.projects?.length || 0,
            }))
          } else {
            console.error("Failed to load projects")
          }

          // Fetch activity
          const activityResponse = await fetch("/api/user/activity")
          if (activityResponse.ok) {
            const activityData = await activityResponse.json()
            setActivities(activityData.activities || [])

            // Calculate stats from activity
            const aiChats = activityData.activities?.filter((a: Activity) => a.type === "ai_chat").length || 0
            const floorPlans = activityData.activities?.filter((a: Activity) => a.type === "floor_plan").length || 0
            const materials = activityData.activities?.filter((a: Activity) => a.type === "material_search").length || 0
            const designers = activityData.activities?.filter((a: Activity) => a.type === "designer_search").length || 0

            setStats({
              totalProjects: projects.length, // Use the projects state here
              aiConsultations: aiChats,
              floorPlansGenerated: floorPlans,
              materialsSearched: materials,
              designersContacted: designers,
              lastActive: activityData.activities?.[0]?.timestamp || new Date().toISOString(),
            })
          } else {
            console.error("Failed to load activity")
          }
        } catch (error) {
          console.error("Error fetching data:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status, projects])

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
        setStats((prev) => ({
          ...prev,
          totalProjects: prev.totalProjects + 1,
        }))
        toast.success("Project created", {
          description: "Your new project has been created successfully.",
        })
        setShowNewProjectDialog(false)
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
            <Building2 className="h-8 w-8 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium">Loading your dashboard...</p>
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
                Welcome back, {session?.user?.name || session?.user?.username || "User"}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your construction projects and get AI-powered recommendations
              </p>
            </div>
            <Button
              onClick={() => setShowNewProjectDialog(true)}
              className="bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500 text-white shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.totalProjects}</div>
                  <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {stats.totalProjects > 0
                    ? `${stats.totalProjects} active construction projects`
                    : "No projects yet. Create your first one!"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  AI Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.aiConsultations}</div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {stats.aiConsultations > 0
                    ? `${stats.aiConsultations} conversations with AI assistant`
                    : "No AI consultations yet. Ask our assistant!"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Floor Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.floorPlansGenerated}</div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Layers className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {stats.floorPlansGenerated > 0
                    ? `${stats.floorPlansGenerated} floor plans generated`
                    : "No floor plans generated yet"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Materials & Designers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.materialsSearched + stats.designersContacted}</div>
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Paintbrush className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {stats.materialsSearched + stats.designersContacted > 0
                    ? `${stats.materialsSearched} material searches, ${stats.designersContacted} designer contacts`
                    : "No material or designer searches yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="projects" className="space-y-6">
            <TabsList className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-1">
              <TabsTrigger value="projects" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                My Projects
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                Recent Activity
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
              >
                Recommendations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
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
                      <CardFooter>
                        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project._id}
                      project={project}
                      onProjectDeleted={() => {
                        setProjects(projects.filter((p) => p._id !== project._id))
                        setStats((prev) => ({
                          ...prev,
                          totalProjects: prev.totalProjects - 1,
                        }))
                      }}
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
                      Create your first construction project to get started with AI-powered recommendations for floor
                      plans, materials, and local designers.
                    </p>
                    <Button
                      onClick={() => setShowNewProjectDialog(true)}
                      className="bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500 text-white"
                      size="lg"
                    >
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create Project
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activity">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent actions and interactions with BuildWise AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivityList activities={activities} />
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/activity")}
                    className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:border-amber-400 dark:text-amber-400 dark:hover:bg-amber-950"
                  >
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations">
              <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle>Personalized Recommendations</CardTitle>
                  <CardDescription>Based on your projects and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <CardTitle className="text-base">AI Assistant</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Get expert advice on your construction project from our AI assistant.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={() => router.push("/dashboard/chat")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Chat with AI
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <Layers className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <CardTitle className="text-base">Floor Plans</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Generate optimized floor plans based on your land area and budget.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={() =>
                            projects.length > 0
                              ? router.push(`/dashboard/projects/${projects[0]._id}?tab=floorplan`)
                              : setShowNewProjectDialog(true)
                          }
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          Generate Floor Plan
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                            <Paintbrush className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <CardTitle className="text-base">Materials & Paints</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Find cost-effective materials and paint suggestions for your project.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={() =>
                            projects.length > 0
                              ? router.push(`/dashboard/projects/${projects[0]._id}?tab=materials`)
                              : setShowNewProjectDialog(true)
                          }
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Explore Materials
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <CardTitle className="text-base">Local Designers</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Connect with interior designers and contractors in your area.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={() =>
                            projects.length > 0
                              ? router.push(`/dashboard/projects/${projects[0]._id}?tab=designers`)
                              : setShowNewProjectDialog(true)
                          }
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          Find Designers
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <NewProjectDialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog} onSubmit={handleCreateProject} />
    </div>
  )
}

