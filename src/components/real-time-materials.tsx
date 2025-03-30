"use client"

import { useState, useEffect } from "react"
import { Paintbrush, Search, Filter, ShoppingCart, Truck, Star, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

interface RealTimeMaterialsProps {
  location: LocationData
  budget: string
  currency?: string
}

export function RealTimeMaterials({ location, budget, currency = "USD" }: RealTimeMaterialsProps) {
  const [materials, setMaterials] = useState<any[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterPrice, setFilterPrice] = useState("all")
  const [sortBy, setSortBy] = useState("recommended")
  const [activeTab, setActiveTab] = useState("paints")
  const [cart, setCart] = useState<any[]>([])

  // Get location display text
  const getLocationDisplay = () => {
    if (location.type === "global") {
      return `${location.city || ""}, ${location.country || ""}`
    } else {
      return `${location.city || ""}, ${location.state || ""}`
    }
  }

  // Fetch materials based on location and budget
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call to fetch materials based on location and budget
        // For demo purposes, we'll simulate a delay and return mock data
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Generate random materials based on location and budget
        const mockMaterials = generateMockMaterials(activeTab, 20, currency)
        setMaterials(mockMaterials)
        setFilteredMaterials(mockMaterials)
      } catch (error) {
        console.error("Error fetching materials:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMaterials()
  }, [location, budget, activeTab, currency])

  // Filter and sort materials
  useEffect(() => {
    let result = [...materials]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (material) =>
          material.name.toLowerCase().includes(query) ||
          material.brand.toLowerCase().includes(query) ||
          material.description.toLowerCase().includes(query),
      )
    }

    // Apply category filter
    if (filterCategory !== "all") {
      result = result.filter((material) => material.category === filterCategory)
    }

    // Apply price filter
    if (filterPrice !== "all") {
      if (filterPrice === "budget") {
        result = result.filter((material) => material.priceCategory === "budget")
      } else if (filterPrice === "standard") {
        result = result.filter((material) => material.priceCategory === "standard")
      } else if (filterPrice === "premium") {
        result = result.filter((material) => material.priceCategory === "premium")
      }
    }

    // Apply sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === "eco") {
      result.sort((a, b) => (b.ecoFriendly ? 1 : 0) - (a.ecoFriendly ? 1 : 0))
    }
    // "recommended" is the default sort and doesn't need additional sorting

    setFilteredMaterials(result)
  }, [materials, searchQuery, filterCategory, filterPrice, sortBy])

  // Generate mock materials for demo purposes
  const generateMockMaterials = (type: string, count: number, currencyCode: string) => {
    const materials = []
    let categories: string[] = []
    let priceRange: [number, number] = [0, 0]
    let unit = ""

    if (type === "paints") {
      categories = ["Interior", "Exterior", "Primer", "Enamel", "Emulsion"]
      priceRange = [20, 100]
      unit = "per liter"
    } else if (type === "flooring") {
      categories = ["Hardwood", "Laminate", "Vinyl", "Tile", "Carpet"]
      priceRange = [10, 80]
      unit = "per sq ft"
    } else if (type === "fixtures") {
      categories = ["Lighting", "Faucets", "Handles", "Switches", "Hinges"]
      priceRange = [5, 200]
      unit = "per piece"
    } else {
      categories = ["Cement", "Bricks", "Sand", "Steel", "Glass"]
      priceRange = [5, 500]
      unit = "per unit"
    }

    const brands = [
      "BuildMaster",
      "EcoHome",
      "PremiumCraft",
      "DuraTech",
      "NatureBuild",
      "ModernSpace",
      "ClassicTouch",
      "IndustrialPro",
    ]

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const brand = brands[Math.floor(Math.random() * brands.length)]
      const price = priceRange[0] + Math.floor(Math.random() * (priceRange[1] - priceRange[0]))
      const rating = (3 + Math.random() * 2).toFixed(1)
      const stock = Math.floor(Math.random() * 100)
      const ecoFriendly = Math.random() > 0.6
      const deliveryDays = 1 + Math.floor(Math.random() * 7)
      const discount = Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0
      const priceCategory =
        price < priceRange[0] + (priceRange[1] - priceRange[0]) / 3
          ? "budget"
          : price < priceRange[0] + (2 * (priceRange[1] - priceRange[0])) / 3
            ? "standard"
            : "premium"

      materials.push({
        id: `${type}-${i}`,
        name: `${brand} ${category} ${type === "paints" ? "Paint" : type === "flooring" ? "Flooring" : ""}`,
        brand,
        category,
        price,
        currency: currencyCode,
        unit,
        rating: Number.parseFloat(rating),
        stock,
        ecoFriendly,
        deliveryDays,
        discount,
        priceCategory,
        description: `High-quality ${category.toLowerCase()} ${type === "paints" ? "paint" : type === "flooring" ? "flooring" : "material"} suitable for ${Math.random() > 0.5 ? "indoor" : "outdoor"} use.`,
        image: `https://placehold.co/200x200/${Math.floor(Math.random() * 16777215).toString(16)}/FFFFFF/png?text=${category}`,
      })
    }

    return materials
  }

  const addToCart = (material: any) => {
    setCart([...cart, material])
  }

  const isInCart = (materialId: string) => {
    return cart.some((item) => item.id === materialId)
  }

  const getPriceWithDiscount = (price: number, discount: number) => {
    return price * (1 - discount / 100)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Building Materials</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Find cost-effective materials available in {getLocationDisplay()}
            </p>
          </div>

          <TabsList>
            <TabsTrigger value="paints" className="flex items-center gap-1">
              <Paintbrush className="h-4 w-4" />
              Paints
            </TabsTrigger>
            <TabsTrigger value="flooring">Flooring</TabsTrigger>
            <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
            <TabsTrigger value="structural">Structural</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start mt-6">
          <div className="w-full md:w-64 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
                <CardDescription>Refine your search</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {activeTab === "paints" && (
                        <>
                          <SelectItem value="Interior">Interior</SelectItem>
                          <SelectItem value="Exterior">Exterior</SelectItem>
                          <SelectItem value="Primer">Primer</SelectItem>
                          <SelectItem value="Enamel">Enamel</SelectItem>
                          <SelectItem value="Emulsion">Emulsion</SelectItem>
                        </>
                      )}
                      {activeTab === "flooring" && (
                        <>
                          <SelectItem value="Hardwood">Hardwood</SelectItem>
                          <SelectItem value="Laminate">Laminate</SelectItem>
                          <SelectItem value="Vinyl">Vinyl</SelectItem>
                          <SelectItem value="Tile">Tile</SelectItem>
                          <SelectItem value="Carpet">Carpet</SelectItem>
                        </>
                      )}
                      {activeTab === "fixtures" && (
                        <>
                          <SelectItem value="Lighting">Lighting</SelectItem>
                          <SelectItem value="Faucets">Faucets</SelectItem>
                          <SelectItem value="Handles">Handles</SelectItem>
                          <SelectItem value="Switches">Switches</SelectItem>
                          <SelectItem value="Hinges">Hinges</SelectItem>
                        </>
                      )}
                      {activeTab === "structural" && (
                        <>
                          <SelectItem value="Cement">Cement</SelectItem>
                          <SelectItem value="Bricks">Bricks</SelectItem>
                          <SelectItem value="Sand">Sand</SelectItem>
                          <SelectItem value="Steel">Steel</SelectItem>
                          <SelectItem value="Glass">Glass</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <Select value={filterPrice} onValueChange={setFilterPrice}>
                    <SelectTrigger>
                      <SelectValue placeholder="All prices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All prices</SelectItem>
                      <SelectItem value="budget">Budget-friendly</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">Recommended</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="eco">Eco-Friendly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSearchQuery("")
                      setFilterCategory("all")
                      setFilterPrice("all")
                      setSortBy("recommended")
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Shopping Cart</CardTitle>
                  <Badge>{cart.length}</Badge>
                </div>
              </CardHeader>
              {cart.length > 0 ? (
                <CardContent className="space-y-3">
                  {cart.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="truncate max-w-[150px]">{item.name}</div>
                      <div>{formatCurrency(item.price, item.currency)}</div>
                    </div>
                  ))}
                  {cart.length > 3 && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">+{cart.length - 3} more items</div>
                  )}
                  <div className="pt-2 flex justify-between font-medium">
                    <div>Total:</div>
                    <div>
                      {formatCurrency(
                        cart.reduce((sum, item) => sum + item.price, 0),
                        currency,
                      )}
                    </div>
                  </div>
                  <Button className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Checkout
                  </Button>
                </CardContent>
              ) : (
                <CardContent>
                  <div className="text-center py-3 text-slate-500 dark:text-slate-400">Your cart is empty</div>
                </CardContent>
              )}
            </Card>
          </div>

          <div className="flex-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder={`Search ${activeTab}...`}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <TabsContent value="paints" className="m-0">
              {renderMaterialsList("paints")}
            </TabsContent>

            <TabsContent value="flooring" className="m-0">
              {renderMaterialsList("flooring")}
            </TabsContent>

            <TabsContent value="fixtures" className="m-0">
              {renderMaterialsList("fixtures")}
            </TabsContent>

            <TabsContent value="structural" className="m-0">
              {renderMaterialsList("structural")}
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )

  function renderMaterialsList(type: string) {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-slate-100 dark:bg-slate-800">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )
    }

    if (filteredMaterials.length === 0) {
      return (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Filter className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium mb-2">No materials found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">
              We couldn't find any materials matching your criteria. Try adjusting your filters or search query.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setFilterCategory("all")
                setFilterPrice("all")
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((material) => (
          <Card key={material.id} className="overflow-hidden">
            <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
              <img
                src={material.image || "/placeholder.svg"}
                alt={material.name}
                className="h-full w-full object-cover"
              />
              {material.discount > 0 && (
                <Badge className="absolute top-2 right-2 bg-red-500">-{material.discount}%</Badge>
              )}
              {material.ecoFriendly && <Badge className="absolute top-2 left-2 bg-green-500">Eco-Friendly</Badge>}
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{material.name}</CardTitle>
                  <CardDescription>{material.brand}</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{material.rating}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{material.description}</p>
              <div className="flex justify-between items-center">
                <div className="font-medium">
                  {material.discount > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-500">
                        {formatCurrency(getPriceWithDiscount(material.price, material.discount), material.currency)}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500 text-sm line-through">
                        {formatCurrency(material.price, material.currency)}
                      </span>
                    </div>
                  ) : (
                    <span>{formatCurrency(material.price, material.currency)}</span>
                  )}
                  <span className="text-xs text-slate-500 dark:text-slate-400"> {material.unit}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                  <Truck className="h-3 w-3" />
                  <span>
                    {material.deliveryDays} day{material.deliveryDays > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => addToCart(material)}
                className={`w-full ${
                  isInCart(material.id) ? "bg-green-600 hover:bg-green-700" : "bg-amber-500 hover:bg-amber-600"
                } text-white`}
                disabled={isInCart(material.id) || material.stock === 0}
              >
                {material.stock === 0 ? (
                  "Out of Stock"
                ) : isInCart(material.id) ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }
}

