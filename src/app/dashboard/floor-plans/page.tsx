"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Building2, Download, RefreshCw, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { AREA_UNITS, CURRENCIES, getCurrencySymbol } from "@/lib/unit-utils"

export default function FloorPlansPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [floorPlans, setFloorPlans] = useState<any[]>([])
  const [formData, setFormData] = useState({
    landArea: "",
    landAreaUnit: "sqft",
    budget: "",
    currency: "USD",
    bedrooms: "2",
    bathrooms: "2",
    floors: "1",
    style: "modern",
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Fetch user's floor plans
  useEffect(() => {
    const fetchFloorPlans = async () => {
      if (status === "authenticated") {
        setIsLoading(true)
        try {
          const response = await fetch("/api/floor-plans")
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
        }
      }
    }

    if (status === "authenticated") {
      fetchFloorPlans()
    }
  }, [status])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleGenerateFloorPlan = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-floor-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setFloorPlans([data.floorPlan, ...floorPlans])
        toast.success("Floor plan generated", {
          description: "Your new floor plan has been created successfully.",
        })
      } else {
        const error = await response.json()
        toast.error("Failed to generate floor plan", {
          description: error.message || "Please try again later.",
        })
      }
    } catch (error) {
      console.error("Error generating floor plan:", error)
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (floorPlanId: string) => {
    // In a real app, this would download the floor plan
    toast.success("Downloading floor plan", {
      description: "Your floor plan is being downloaded.",
    })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin"></div>
            <Building2 className="h-8 w-8 text-amber-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium">Loading floor plans...</p>
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
                Floor Plans
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Generate and manage detailed floor plans for your construction projects
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Generate New Floor Plan</CardTitle>
                <CardDescription>Enter details to create a custom floor plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="landArea">Land Area</Label>
                  <div className="flex gap-2">
                    <Input
                      id="landArea"
                      name="landArea"
                      value={formData.landArea}
                      onChange={handleInputChange}
                      placeholder="e.g. 1000"
                      className="flex-1"
                    />
                    <Select
                      value={formData.landAreaUnit}
                      onValueChange={(value) => handleSelectChange("landAreaUnit", value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {AREA_UNITS.filter((unit) => unit.value !== "dimensions").map((unit) => (
                          <SelectItem key={unit.value} value={unit.value}>
                            {unit.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Budget</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                        {getCurrencySymbol(formData.currency)}
                      </span>
                      <Input
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        placeholder="e.g. 100000"
                        className="pl-7"
                      />
                    </div>
                    <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Currency" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Select value={formData.bedrooms} onValueChange={(value) => handleSelectChange("bedrooms", value)}>
                      <SelectTrigger id="bedrooms">
                        <SelectValue placeholder="Bedrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4", "5", "6+"].map((num) => (
                          <SelectItem key={num} value={num}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Select
                      value={formData.bathrooms}
                      onValueChange={(value) => handleSelectChange("bathrooms", value)}
                    >
                      <SelectTrigger id="bathrooms">
                        <SelectValue placeholder="Bathrooms" />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "1.5", "2", "2.5", "3", "3.5", "4+"].map((num) => (
                          <SelectItem key={num} value={num}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="floors">Floors</Label>
                    <Select value={formData.floors} onValueChange={(value) => handleSelectChange("floors", value)}>
                      <SelectTrigger id="floors">
                        <SelectValue placeholder="Floors" />
                      </SelectTrigger>
                      <SelectContent>
                        {["1", "2", "3", "4+"].map((num) => (
                          <SelectItem key={num} value={num}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="style">Style</Label>
                    <Select value={formData.style} onValueChange={(value) => handleSelectChange("style", value)}>
                      <SelectTrigger id="style">
                        <SelectValue placeholder="Style" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "modern",
                          "traditional",
                          "contemporary",
                          "minimalist",
                          "colonial",
                          "mediterranean",
                          "craftsman",
                          "farmhouse",
                        ].map((style) => (
                          <SelectItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleGenerateFloorPlan}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500 text-white"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Layers className="mr-2 h-4 w-4" />
                      Generate Floor Plan
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="lg:col-span-2">
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                    All Plans
                  </TabsTrigger>
                  <TabsTrigger
                    value="recent"
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                  >
                    Recently Generated
                  </TabsTrigger>
                  <TabsTrigger
                    value="saved"
                    className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
                  >
                    Saved Plans
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
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
                  ) : floorPlans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sample floor plans - in a real app, these would come from the API */}
                      <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Modern 2-Bedroom House</CardTitle>
                          <CardDescription>1,200 sqft • 2 bed • 2 bath • 1 floor</CardDescription>
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
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm" onClick={() => handleDownload("1")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </CardFooter>
                      </Card>

                      <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Contemporary 3-Bedroom Villa</CardTitle>
                          <CardDescription>2,000 sqft • 3 bed • 2.5 bath • 2 floors</CardDescription>
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
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm" onClick={() => handleDownload("2")}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
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
                        <h3 className="text-xl font-medium mb-2">No floor plans yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">
                          Generate your first floor plan to get started with detailed blueprints for your construction
                          project.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                  {/* Similar content as "all" tab but filtered for recent plans */}
                  <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                        <Layers className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">No recent floor plans</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">
                        Generate a new floor plan to see it appear here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                  {/* Similar content as "all" tab but filtered for saved plans */}
                  <Card className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="h-20 w-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                        <Layers className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">No saved floor plans</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-center mb-6 max-w-md">
                        Save your favorite floor plans to access them quickly later.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

