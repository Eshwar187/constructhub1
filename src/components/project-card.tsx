"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Calendar, MapPin, Banknote, Trash2, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { formatArea, formatCurrency } from "@/lib/unit-utils"

interface ProjectCardProps {
  project: {
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
  }
  onProjectDeleted: () => void
}

export function ProjectCard({ project, onProjectDeleted }: ProjectCardProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleViewProject = () => {
    router.push(`/dashboard/projects/${project._id}`)
  }

  const handleDeleteProject = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      setIsDeleting(true)
      try {
        const response = await fetch(`/api/projects/${project._id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast.success("Project deleted", {
            description: "The project has been successfully deleted.",
          })
          onProjectDeleted()
        } else {
          const error = await response.json()
          toast.error("Failed to delete project", {
            description: error.message || "Please try again later.",
          })
        }
      } catch (error) {
        toast.error("Error", {
          description: "An unexpected error occurred. Please try again.",
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  // Format the location based on available data
  const formatLocation = () => {
    if (project.locationType === "global" && project.country) {
      return project.city ? `${project.city}, ${project.country}` : project.country
    } else {
      return project.city && project.state
        ? `${project.city}, ${project.state}`
        : project.state || project.city || "Location not specified"
    }
  }

  // Format the creation date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "Date unknown"
    }
  }

  return (
    <Card
      className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={handleViewProject}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
            <CardDescription className="mt-1">
              {project.status === "completed" ? (
                <span className="text-green-600 dark:text-green-400 font-medium">Completed</span>
              ) : project.status === "in_progress" ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">In Progress</span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400 font-medium">Planning</span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            onClick={handleDeleteProject}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span className="sr-only">Delete project</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{project.description}</p>
        )}
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Building2 className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">
              {formatArea(project.landArea, project.landAreaUnit || "sqft")}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">{formatLocation()}</span>
          </div>
          <div className="flex items-center text-sm">
            <Banknote className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">
              {formatCurrency(project.budget, project.currency || "USD")}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300">{formatDate(project.createdAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white" onClick={handleViewProject}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}

