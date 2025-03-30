"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Building2, MapPin, Banknote, Loader2, Pencil, Save, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ChatUI } from "@/components/chat-ui"
import { RealTimeDesigners } from "@/components/real-time-designers"
import { RealTimeFloorPlan } from "@/components/real-time-floor-plan"
import { RealTimeMaterials } from "@/components/real-time-materials"
import { AREA_UNITS, CURRENCIES, formatCurrency, getCurrencySymbol } from "@/lib/unit-utils"

const projectFormSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters" }),
  description: z.string().optional(),
  areaValue: z.string().min(1, { message: "Area value is required" }),
  areaUnit: z.string().min(1, { message: "Area unit is required" }),
  budget: z.string().min(1, { message: "Budget is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
})

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDesigner, setSelectedDesigner] = useState<any>(null)
  const [projectId, setProjectId] = useState<string | null>(null)

  // Resolve params to get the project ID
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setProjectId(resolvedParams.id);
    };
    resolveParams();
  }, [params]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      areaValue: "",
      areaUnit: "sqft",
      budget: "",
      currency: "USD",
    },
  })

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (status === "authenticated" && projectId) {
        try {
          const response = await fetch(`/api/projects/${projectId}`)
          if (response.ok) {
            const data = await response.json()
            setProject(data.project)

            // Set form values with enhanced data structure
            form.reset({
              name: data.project.name,
              description: data.project.description || "",
              areaValue: data.project.landArea,
              areaUnit: data.project.landAreaUnit || "sqft",
              budget: data.project.budget,
              currency: data.project.currency || "USD",
            })
          } else {
            toast.error("Failed to load project", {
              description: "Please try again later.",
            })
            router.push("/dashboard/projects")
          }
        } catch (error) {
          console.error("Error fetching project:", error)
          toast.error("Error loading project", {
            description: "An unexpected error occurred.",
          })
          router.push("/dashboard/projects")
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (status === "authenticated" && projectId) {
      fetchProject()
    }
  }, [status, projectId, router, form])

  const handleSaveProject = async (values: z.infer<typeof projectFormSchema>) => {
    if (!projectId) return; // Ensure projectId is available

    setIsSaving(true)
    try {
      // Prepare updated project data
      const updatedData = {
        name: values.name,
        description: values.description,
        landArea: values.areaValue,
        landAreaUnit: values.areaUnit,
        budget: values.budget.replace(/[^0-9.]/g, ""),
        currency: values.currency,
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const updatedProject = await response.json()
        setProject({ ...project, ...updatedProject.project })
        setIsEditing(false)
        toast.success("Project updated", {
          description: "Your project has been updated successfully.",
        })
      } else {
        const error = await response.json()
        toast.error("Failed to update project", {
          description: error.message || "Please try again later.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDesignerConnect = (designer: any) => {
    setSelectedDesigner(designer)
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "")
    if (value) {
      const formattedValue = new Intl.NumberFormat("en-IN").format(Number.parseInt(value))
      form.setValue("budget", formattedValue)
    } else {
      form.setValue("budget", "")
    }
  }

  const getLocationDisplay = () => {
    if (!project) return ""
    if (project.locationType === "global") {
      return `${project.city || ""}, ${project.country || ""}`
    } else {
      return `${project.indianCity || project.city || ""}, ${project.state || ""}`
    }
  }

  const getAreaDisplay = () => {
    if (!project) return ""
    const areaValue = project.landArea
    const areaUnit = project.landAreaUnit || "sqft"

    if (project.dimensions) {
      const { length, width, unit } = project.dimensions
      return `${length} × ${width} ${unit} (${areaValue} ${areaUnit})`
    }

    const unitObj = AREA_UNITS.find((u) => u.value === areaUnit)
    const unitLabel = unitObj ? unitObj.label : areaUnit
    return `${areaValue} ${unitLabel}`
  }

  if (status === "loading" || isLoading || !projectId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-2">
          <Building2 className="h-10 w-10 text-amber-500 animate-pulse" />
          <p className="text-slate-600 dark:text-slate-400">Loading project details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 container mx-auto py-6 px-4">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/projects")} className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Editing Project</h1>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <div className="flex items-center gap-2 mt-1 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{getLocationDisplay()}</span>
                  </div>
                </div>
              )}
            </div>

            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Project
              </Button>
            )}
          </div>

          {isEditing ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Edit Project</CardTitle>
                <CardDescription>Update your project details</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSaveProject)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="resize-none"
                              placeholder="Brief description of your project"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="areaUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area Unit</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {AREA_UNITS.filter((unit) => unit.value !== "dimensions").map((unit) => (
                                    <SelectItem key={unit.value} value={unit.value}>
                                      {unit.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="areaValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Area Value</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-[200px]">
                                  {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency.value} value={currency.value}>
                                      {currency.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget Amount</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                                    {getCurrencySymbol(form.watch("currency"))}
                                  </span>
                                  <Input
                                    className="pl-7"
                                    {...field}
                                    onChange={(e) => {
                                      handleBudgetChange(e)
                                    }}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Land Area</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-amber-500" />
                  <div className="text-xl font-bold">{getAreaDisplay()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Budget</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-green-500" />
                  <div className="text-xl font-bold">{formatCurrency(project.budget, project.currency || "USD")}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Location</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  <div className="text-xl font-bold">{getLocationDisplay()}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {project.description && !isEditing && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{project.description}</p>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="floorplan" className="space-y-6">
            <TabsList>
              <TabsTrigger value="floorplan">Floor Plan</TabsTrigger>
              <TabsTrigger value="chat">AI Assistant</TabsTrigger>
              <TabsTrigger value="designers">Local Designers</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
            </TabsList>
            <TabsContent value="floorplan">
              <RealTimeFloorPlan
                landArea={project.landArea}
                landAreaUnit={project.landAreaUnit || "sqft"}
                budget={project.budget}
                currency={project.currency || "USD"}
                location={{
                  type: project.locationType || "global",
                  region: project.region,
                  country: project.country,
                  state: project.state,
                  city: project.city || project.indianCity,
                }}
                projectId={project._id}
              />
            </TabsContent>
            <TabsContent value="chat">
              <Card className="h-[calc(100vh-20rem)]">
                <CardHeader>
                  <CardTitle>AI Construction Assistant</CardTitle>
                  <CardDescription>
                    Ask questions about your construction project and get expert recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[calc(100%-5rem)] flex flex-col">
                  <ChatUI
                    projectDetails={{
                      landArea: project.landArea,
                      landAreaUnit: project.landAreaUnit || "sqft",
                      budget: project.budget,
                      currency: project.currency || "USD",
                      location: {
                        type: project.locationType || "global",
                        region: project.region,
                        country: project.country,
                        state: project.state,
                        city: project.city || project.indianCity,
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="designers">
              <Card>
                <CardHeader>
                  <CardTitle>Local Interior Designers</CardTitle>
                  <CardDescription>
                    Real-time availability of professionals in {project.city || project.indianCity}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RealTimeDesigners
                    location={{
                      type: project.locationType || "global",
                      region: project.region,
                      country: project.country,
                      state: project.state,
                      city: project.city || project.indianCity,
                    }}
                    budget={project.budgetCategory || "medium"}
                    currency={project.currency || "USD"}
                    onConnect={handleDesignerConnect}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="materials">
              <RealTimeMaterials
                location={{
                  type: project.locationType || "global",
                  region: project.region,
                  country: project.country,
                  state: project.state,
                  city: project.city || project.indianCity,
                }}
                budget={project.budget}
                currency={project.currency || "USD"}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}