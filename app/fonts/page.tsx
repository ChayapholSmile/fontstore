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

      const response = await fetch(`/api/fonts?${params}`)
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
      // Show success message
    } catch (error) {
      console.error("Error adding to wishlist:", error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
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
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
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

            <Button
              variant={showFreeOnly ? "default" : "outline"}
              onClick={() => setShowFreeOnly(!showFreeOnly)}
              size="sm"
            >
              Free Only
            </Button>

            <div className="flex items-center space-x-2 ml-auto">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Fonts Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {fonts.map((font) => (
              <FontCard key={font._id?.toString()} font={font} viewMode={viewMode} onAddToWishlist={addToWishlist} />
            ))}
          </div>
        )}

        {!loading && fonts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No fonts found matching your criteria</div>
            <Button onClick={() => window.location.reload()}>Reset Filters</Button>
          </div>
        )}
      </div>
    </div>
  )
}

interface FontCardProps {
  font: Font
  viewMode: "grid" | "list"
  onAddToWishlist: (fontId: string) => void
}

function FontCard({ font, viewMode, onAddToWishlist }: FontCardProps) {
  if (viewMode === "list") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <div className="w-32 h-20 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold" style={{ fontFamily: "system-ui" }}>
                Aa
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold">{font.name}</h3>
                  <p className="text-sm text-muted-foreground">by {font.sellerName}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToWishlist(font._id!.toString())}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{font.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{font.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{font.downloads}</span>
                  </div>
                  <Badge variant="secondary">{font.category}</Badge>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    {font.isFree ? (
                      <div className="text-lg font-bold text-green-600">Free</div>
                    ) : (
                      <div>
                        <div className="text-lg font-bold text-primary">${font.price}</div>
                        {font.originalPrice && (
                          <div className="text-xs text-muted-foreground line-through">${font.originalPrice}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <Link href={`/fonts/${font._id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1">{font.name}</CardTitle>
            <CardDescription>by {font.sellerName}</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddToWishlist(font._id!.toString())}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Font Preview */}
        <div className="bg-card rounded-lg p-6 mb-4 border">
          <div className="text-2xl font-bold mb-2" style={{ fontFamily: "system-ui" }}>
            The quick brown fox
          </div>
          <div className="text-sm text-muted-foreground">
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
            <br />
            abcdefghijklmnopqrstuvwxyz
            <br />
            1234567890
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {font.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{font.rating}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{font.downloads}</span>
            </div>
          </div>
          <div className="text-right">
            {font.isFree ? (
              <div className="text-lg font-bold text-green-600">Free</div>
            ) : (
              <div>
                <div className="text-lg font-bold text-primary">${font.price}</div>
                {font.originalPrice && (
                  <div className="text-xs text-muted-foreground line-through">${font.originalPrice}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Link href={`/fonts/${font._id}`} className="flex-1">
            <Button className="w-full">View Details</Button>
          </Link>
          <Button variant="outline" size="icon">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
