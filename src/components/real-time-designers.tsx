"use client"

import { useState, useEffect } from "react"
import { User, Star, MapPin, Phone, Mail, ExternalLink, Search, Briefcase, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/unit-utils"

interface LocationData {
  type: string
  region?: string
  country?: string
  state?: string
  city?: string
}

interface RealTimeDesignersProps {
  location: LocationData
  budget: string
  currency?: string
  onConnect: (designer: any) => void
}

export function RealTimeDesigners({ location, budget, currency = "USD", onConnect }: RealTimeDesignersProps) {
  const [designers, setDesigners] = useState<any[]>([])
  const [filteredDesigners, setFilteredDesigners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("all")
  const [filterRating, setFilterRating] = useState("all")
  const [sortBy, setSortBy] = useState("rating")

  // Get location display text
  const getLocationDisplay = () => {
    if (location.type === "global") {
      return `${location.city || ""}, ${location.country || ""}`
    } else {
      return `${location.city || ""}, ${location.state || ""}`
    }
  }

  // Fetch designers based on location
  useEffect(() => {
    const fetchDesigners = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call to fetch designers based on location
        // For demo purposes, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Generate random designers based on location
        const locationName = getLocationDisplay()
        const mockDesigners = generateMockDesigners(locationName, 12, currency)
        setDesigners(mockDesigners)
        setFilteredDesigners(mockDesigners)
      } catch (error) {
        console.error("Error fetching designers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDesigners()
  }, [location, currency])

  // Filter and sort designers
  useEffect(() => {
    let result = [...designers]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (designer) =>
          designer.name.toLowerCase().includes(query) ||
          designer.specialty.toLowerCase().includes(query) ||
          designer.bio.toLowerCase().includes(query),
      )
    }

    // Apply specialty filter
    if (filterSpecialty !== "all") {
      result = result.filter((designer) => designer.specialty === filterSpecialty)
    }

    // Apply rating filter
    if (filterRating !== "all") {
      const minRating = Number.parseInt(filterRating)
      result = result.filter((designer) => designer.rating >= minRating)
    }

    // Apply sorting
    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "experience") {
      result.sort((a, b) => b.experience - a.experience)
    } else if (sortBy === "price-low") {
      result.sort((a, b) => a.hourlyRate - b.hourlyRate)
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.hourlyRate - a.hourlyRate)
    }

    setFilteredDesigners(result)
  }, [designers, searchQuery, filterSpecialty, filterRating, sortBy])

  // Generate mock designers for demo purposes
  const generateMockDesigners = (location: string, count: number, currencyCode: string) => {
    const specialties = [
      "Interior Designer",
      "Architect",
      "Landscape Designer",
      "Kitchen Specialist",
      "Bathroom Specialist",
    ]
    const designers = []

    for (let i = 0; i < count; i++) {
      const specialty = specialties[Math.floor(Math.random() * specialties.length)]
      const rating = (3 + Math.random() * 2).toFixed(1)
      const experience = 2 + Math.floor(Math.random() * 20)
      const hourlyRate = 25 + Math.floor(Math.random() * 175)
      const projectsCompleted = 5 + Math.floor(Math.random() * 95)
      const isAvailable = Math.random() > 0.3

      designers.push({
        id: `designer-${i}`,
        name: `Designer ${i + 1}`,
        specialty,
        rating: Number.parseFloat(rating),
        experience,
        hourlyRate,
        currency: currencyCode,
        location,
        bio: `Experienced ${specialty.toLowerCase()} with ${experience} years of expertise in residential and commercial projects.`,
        projectsCompleted,
        isAvailable,
        image: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "women" : "men"}/${i + 10}.jpg`,
      })
    }

    return designers
  }

  const handleConnect = (designer: any) => {
    onConnect(designer)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Find Local Designers</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Connect with professional designers and architects in {getLocationDisplay()}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="experience">Most Experienced</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by name, specialty, or keywords..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredDesigners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDesigners.map((designer) => (
                <Card key={designer.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-base">{designer.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {designer.specialty}
                        </CardDescription>
                      </div>
                      <Badge variant={designer.isAvailable ? "default" : "outline"} className="ml-auto">
                        {designer.isAvailable ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                        <img
                          src={designer.image || "/placeholder.svg"}
                          alt={designer.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-medium">{designer.rating}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-xs">
                            ({designer.projectsCompleted} projects)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                          <MapPin className="h-3 w-3" />
                          {designer.location}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(designer.hourlyRate, designer.currency)} / hour • {designer.experience} years
                          exp.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleConnect(designer)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black"
                      disabled={!designer.isAvailable}
                    >
                      {designer.isAvailable ? "Connect" : "Currently Unavailable"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-50 dark:bg-slate-800/50 border border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <User className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">No designers found</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">
                  We couldn't find any designers matching your criteria. Try adjusting your filters or search query.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterSpecialty("all")
                    setFilterRating("all")
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filters</CardTitle>
              <CardDescription>Refine your search</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Specialty</label>
                <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All specialties</SelectItem>
                    <SelectItem value="Interior Designer">Interior Designer</SelectItem>
                    <SelectItem value="Architect">Architect</SelectItem>
                    <SelectItem value="Landscape Designer">Landscape Designer</SelectItem>
                    <SelectItem value="Kitchen Specialist">Kitchen Specialist</SelectItem>
                    <SelectItem value="Bathroom Specialist">Bathroom Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any rating</SelectItem>
                    <SelectItem value="5">5 stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Availability</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setFilteredDesigners(designers.filter((d) => d.isAvailable))}
                  >
                    Available Now
                  </Button>
                  <Button variant="outline" className="justify-start" onClick={() => setFilteredDesigners(designers)}>
                    Show All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
              <CardDescription>Contact our support team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <span>support@buildwise.ai</span>
              </div>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Designer Directory
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

