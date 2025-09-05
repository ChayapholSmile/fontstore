"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid, List, Star, Download, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"
import type { Font } from "@/lib/models/User"

export default function FontsPage() {
  const [fonts, setFonts] = useState<Font[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFreeOnly, setShowFreeOnly] = useState(false)

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "sans-serif", label: "Sans Serif" },
    { value: "serif", label: "Serif" },
    { value: "display", label: "Display" },
    { value: "script", label: "Script" },
    { value: "monospace", label: "Monospace" },
  ]

  useEffect(() => {
    fetchFonts()
  }, [selectedCategory, sortBy, showFreeOnly])

  const fetchFonts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== "all") params.append("category", selectedCategory)
      if (searchQuery) params.append("search", searchQuery)
      if (showFreeOnly) params.append("free", "true")

      const response = await fetch(`/api/fonts?${params.toString()}`)
      const data = await response.json()
      setFonts(data.fonts || [])
    } catch (error) {
      console.error("Error fetching fonts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchFonts()
  }

  const addToWishlist = async (fontId: string) => {
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontId }),
      })
      alert("Added to wishlist!")
    } catch (error) {
      console.error("Error adding to wishlist:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search fonts, designers, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="free-only"
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="free-only" className="text-sm text-muted-foreground">Free only</label>
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />)}
          </div>
        ) : fonts.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">No Fonts Found</h2>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or check back later.</p>
            <Button onClick={() => window.location.reload()}>Reset Filters</Button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {fonts.map((font) => (
              <FontCard key={font._id?.toString()} font={font} viewMode={viewMode} onAddToWishlist={addToWishlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FontCard({ font, viewMode, onAddToWishlist }: { font: Font; viewMode: "grid" | "list"; onAddToWishlist: (fontId: string) => void; }) {
  if (viewMode === "list") {
    return (
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-32 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
            <span className="text-lg font-bold truncate" style={{ fontFamily: `"${font.name}", system-ui` }}>Aa</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">{font.name}</h3>
                <p className="text-sm text-muted-foreground">by {font.sellerName}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onAddToWishlist(font._id!.toString())}><Heart className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">{font.category}</Badge>
                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {font.rating}</div>
              </div>
              <Link href={`/fonts/${font._id}`}><Button>View</Button></Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>{font.name}</CardTitle>
            <CardDescription>by {font.sellerName}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" onClick={() => onAddToWishlist(font._id!.toString())}>
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted rounded-lg p-6 mb-4 h-40 flex items-center justify-center">
          <p className="text-2xl truncate" style={{ fontFamily: `"${font.name}", system-ui` }}>The quick brown fox</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />{font.rating}</div>
            <div className="flex items-center gap-1 text-muted-foreground"><Download className="w-4 h-4" />{font.downloads}</div>
          </div>
          <div className="text-lg font-bold">{font.isFree ? "Free" : `$${font.price}`}</div>
        </div>
        <Link href={`/fonts/${font._id}`} className="mt-4"><Button className="w-full">View Details</Button></Link>
      </CardContent>
    </Card>
  )
}

