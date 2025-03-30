"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { regionsList, countriesByRegion, citiesByCountry, statesList, citiesByState } from "@/lib/location-data"
import { AREA_UNITS, LENGTH_UNITS, CURRENCIES, calculateAreaFromDimensions, getCurrencySymbol } from "@/lib/unit-utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  name: z.string().min(3, { message: "Project name must be at least 3 characters" }),
  description: z.string().optional(),

  // Land area fields
  areaValue: z.string().min(1, { message: "Area value is required" }),
  areaUnit: z.string().min(1, { message: "Area unit is required" }),

  // Dimensions fields (optional, used when areaUnit is "dimensions")
  length: z.string().optional(),
  width: z.string().optional(),
  dimensionUnit: z.string().optional(),

  // Budget fields
  budget: z.string().min(1, { message: "Budget is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  budgetCategory: z.string().min(1, { message: "Budget category is required" }),

  // Location fields - Global approach
  locationType: z.string().min(1, { message: "Location type is required" }),
  region: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),

  // Location fields - India specific (for backward compatibility)
  state: z.string().optional(),
  indianCity: z.string().optional(),
})

interface NewProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function NewProjectDialog({ open, onOpenChange, onSubmit }: NewProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [availableCountries, setAvailableCountries] = useState<string[]>([])
  const [showDimensions, setShowDimensions] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      areaValue: "",
      areaUnit: "sqft",
      length: "",
      width: "",
      dimensionUnit: "ft",
      budget: "",
      currency: "USD",
      budgetCategory: "medium",
      locationType: "global",
      region: "",
      country: "",
      city: "",
      state: "",
      indianCity: "",
    },
  })

  // Watch for changes to relevant form fields
  const selectedRegion = form.watch("region")
  const selectedCountry = form.watch("country")
  const selectedState = form.watch("state")
  const selectedAreaUnit = form.watch("areaUnit")
  const selectedLocationType = form.watch("locationType")
  const selectedCurrency = form.watch("currency")

  // Update available countries when region changes
  useEffect(() => {
    if (selectedRegion) {
      setAvailableCountries(countriesByRegion[selectedRegion] || [])
      // Reset country and city when region changes
      form.setValue("country", "")
      form.setValue("city", "")
    }
  }, [selectedRegion, form])

  // Update available cities when country changes
  useEffect(() => {
    if (selectedCountry) {
      setAvailableCities(citiesByCountry[selectedCountry] || [])
      // Reset city when country changes
      form.setValue("city", "")
    }
  }, [selectedCountry, form])

  // Update available cities when state changes (for India)
  useEffect(() => {
    if (selectedLocationType === "india" && selectedState) {
      setAvailableCities(citiesByState[selectedState] || [])
      // Reset city when state changes
      form.setValue("indianCity", "")
    }
  }, [selectedState, selectedLocationType, form])

  // Show/hide dimensions fields based on area unit
  useEffect(() => {
    setShowDimensions(selectedAreaUnit === "dimensions")

    // Reset dimensions fields if not using dimensions
    if (selectedAreaUnit !== "dimensions") {
      form.setValue("length", "")
      form.setValue("width", "")
    }
  }, [selectedAreaUnit, form])

  // Set default currency based on selected country
  useEffect(() => {
    if (selectedCountry) {
      // Map countries to their default currencies
      const countryCurrencyMap: Record<string, string> = {
        "United States": "USD",
        Canada: "CAD",
        "United Kingdom": "GBP",
        Australia: "AUD",
        India: "INR",
        Japan: "JPY",
        China: "CNY",
        "United Arab Emirates": "AED",
        // Add more mappings as needed
      }

      const defaultCurrency = countryCurrencyMap[selectedCountry]
      if (defaultCurrency) {
        form.setValue("currency", defaultCurrency)
      }
    }
  }, [selectedCountry, form])

  // Also set default currency for India when using India-specific location
  useEffect(() => {
    if (selectedLocationType === "india") {
      form.setValue("currency", "INR")
    }
  }, [selectedLocationType, form])

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      // Calculate area in square meters if using dimensions
      let finalAreaValue = values.areaValue
      let finalAreaUnit = values.areaUnit

      if (values.areaUnit === "dimensions" && values.length && values.width && values.dimensionUnit) {
        // Store both the dimensions and the calculated area
        finalAreaValue = String(
          calculateAreaFromDimensions(
            Number.parseFloat(values.length),
            Number.parseFloat(values.width),
            values.dimensionUnit,
          ),
        )
        finalAreaUnit = "sqm" // Store calculated area in square meters
      }

      // Prepare location data based on selected location type
      let location = {}
      if (values.locationType === "global") {
        location = {
          region: values.region,
          country: values.country,
          city: values.city,
        }
      } else {
        location = {
          state: values.state,
          city: values.indianCity,
        }
      }

      // Prepare final data object
      const finalData = {
        name: values.name,
        description: values.description,
        landArea: {
          value: finalAreaValue,
          unit: finalAreaUnit,
          // Include original dimensions if provided
          dimensions:
            values.areaUnit === "dimensions"
              ? {
                  length: values.length,
                  width: values.width,
                  unit: values.dimensionUnit,
                }
              : undefined,
        },
        budget: {
          value: values.budget.replace(/[^0-9.]/g, ""), // Remove non-numeric characters
          currency: values.currency,
          category: values.budgetCategory,
        },
        location: {
          type: values.locationType,
          ...location,
        },
      }

      await onSubmit(finalData)
      form.reset()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format budget as currency when input changes
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-numeric characters
    const value = e.target.value.replace(/[^0-9]/g, "")

    if (value) {
      // Format with commas for thousands
      const formattedValue = new Intl.NumberFormat("en-IN").format(Number.parseInt(value))
      form.setValue("budget", formattedValue)
    } else {
      form.setValue("budget", "")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Enter the details of your construction project to get started.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Dream Home" {...field} />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Brief description of your project" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Land Area Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Land Area</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        You can specify your land area in various units or enter dimensions directly.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="areaUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area Unit</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AREA_UNITS.map((unit) => (
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

                {!showDimensions ? (
                  <FormField
                    control={form.control}
                    name="areaValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area Value</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" placeholder="e.g., 2500" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" placeholder="e.g., 50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" min="0" placeholder="e.g., 40" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="dimensionUnit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dimension Unit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {LENGTH_UNITS.map((unit) => (
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
                  </>
                )}
              </div>
            </div>

            {/* Budget Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Budget</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {getCurrencySymbol(selectedCurrency)}
                          </span>
                          <Input
                            placeholder="e.g., 250,000"
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

                <FormField
                  control={form.control}
                  name="budgetCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Budget</SelectItem>
                          <SelectItem value="medium">Medium Budget</SelectItem>
                          <SelectItem value="high">High Budget</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Location</h3>

              <FormField
                control={form.control}
                name="locationType"
                render={({ field }) => (
                  <FormItem>
                    <Tabs defaultValue={field.value} onValueChange={field.onChange} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="global">Global</TabsTrigger>
                        <TabsTrigger value="india">India</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedLocationType === "global" ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {regionsList.map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
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
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedRegion || availableCountries.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedRegion ? "Select country" : "Select region first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {availableCountries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
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
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedCountry || availableCities.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedCountry ? "Select city" : "Select country first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {availableCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {statesList.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
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
                    name="indianCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!selectedState || availableCities.length === 0}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[200px]">
                            {availableCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

