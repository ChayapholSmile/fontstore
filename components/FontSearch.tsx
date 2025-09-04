"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

interface FontSearchProps {
  onSearch: (filters: SearchFilters) => void
  loading?: boolean
}

export interface SearchFilters {
  query: string
  category: string
  priceRange: [number, number]
  isFree: boolean
  languages: string[]
  tags: string[]
  sortBy: string
}

const languages = [
  { id: "latin", name: "Latin" },
  { id: "thai", name: "Thai" },
  { id: "chinese", name: "Chinese" },
  { id: "cyrillic", name: "Cyrillic" },
]

const popularTags = [
  "modern",
  "elegant",
  "bold",
  "minimal",
  "vintage",
  "handwritten",
  "geometric",
  "condensed",
  "rounded",
  "professional",
]

export default function FontSearch({ onSearch, loading }: FontSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    category: "all",
    priceRange: [0, 100],
    isFree: false,
    languages: [],
    tags: [],
    sortBy: "newest",
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleLanguageToggle = (language: string) => {
    setFilters((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((l) => l !== language)
        : [...prev.languages, language],
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "all",
      priceRange: [0, 100],
      isFree: false,
      languages: [],
      tags: [],
      sortBy: "newest",
    })
  }

  return (
    <Card className="mb-8">
      <CardContent className="p-6 space-y-6">
        {/* Basic Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search fonts, designers, or tags..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
            <Filter className="w-4 h-4 mr-2" />
            Advanced
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="display">Display</SelectItem>
                    <SelectItem value="script">Script</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Free Only */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="free-only"
                    checked={filters.isFree}
                    onCheckedChange={(checked) => setFilters({ ...filters, isFree: checked as boolean })}
                  />
                  <label htmlFor="free-only" className="text-sm">
                    Free fonts only
                  </label>
                </div>
              </div>
            </div>

            {/* Price Range */}
            {!filters.isFree && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters({ ...filters, priceRange: value as [number, number] })}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            )}

            {/* Languages */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Language Support</label>
              <div className="flex flex-wrap gap-2">
                {languages.map((language) => (
                  <div key={language.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={language.id}
                      checked={filters.languages.includes(language.id)}
                      onCheckedChange={() => handleLanguageToggle(language.id)}
                    />
                    <label htmlFor={language.id} className="text-sm">
                      {language.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                    {filters.tags.includes(tag) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Clear All Filters
              </Button>
              <Button onClick={handleSearch} disabled={loading}>
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(filters.tags.length > 0 || filters.languages.length > 0 || filters.category !== "all" || filters.isFree) && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
            {filters.category !== "all" && (
              <Badge variant="secondary">
                Category: {filters.category}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => setFilters({ ...filters, category: "all" })}
                />
              </Badge>
            )}
            {filters.isFree && (
              <Badge variant="secondary">
                Free Only
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilters({ ...filters, isFree: false })} />
              </Badge>
            )}
            {filters.languages.map((language) => (
              <Badge key={language} variant="secondary">
                {language}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleLanguageToggle(language)} />
              </Badge>
            ))}
            {filters.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleTagToggle(tag)} />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
