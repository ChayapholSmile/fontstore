"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Type, Palette, Sparkles, Code, PenTool, Globe } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    id: "sans-serif",
    name: "Sans Serif",
    description: "Clean, modern fonts without decorative strokes",
    icon: Type,
    color: "bg-blue-500",
    count: 0,
    featured: ["Modern Sans Pro", "Helvetica Alternative", "Clean UI Font"],
  },
  {
    id: "serif",
    name: "Serif",
    description: "Traditional fonts with decorative strokes",
    icon: PenTool,
    color: "bg-green-500",
    count: 0,
    featured: ["Elegant Serif", "Times Alternative", "Book Font"],
  },
  {
    id: "display",
    name: "Display",
    description: "Eye-catching fonts for headlines and titles",
    icon: Sparkles,
    color: "bg-purple-500",
    count: 0,
    featured: ["Bold Display", "Creative Title", "Impact Font"],
  },
  {
    id: "script",
    name: "Script",
    description: "Handwritten and calligraphic style fonts",
    icon: Palette,
    color: "bg-pink-500",
    count: 0,
    featured: ["Elegant Script", "Handwritten Style", "Calligraphy Font"],
  },
  {
    id: "monospace",
    name: "Monospace",
    description: "Fixed-width fonts perfect for coding",
    icon: Code,
    color: "bg-gray-500",
    count: 0,
    featured: ["Code Font Pro", "Terminal Font", "Developer Mono"],
  },
  {
    id: "international",
    name: "International",
    description: "Fonts supporting Thai, Chinese, and other languages",
    icon: Globe,
    color: "bg-orange-500",
    count: 0,
    featured: ["Thai Sans", "Chinese Traditional", "Multi-language Pro"],
  },
]

export default function CategoriesPage() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryCounts()
  }, [])

  const fetchCategoryCounts = async () => {
    try {
      const response = await fetch("/api/categories/counts")
      const data = await response.json()
      setCategoryCounts(data.counts || {})
    } catch (error) {
      console.error("Error fetching category counts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
            Explore Font <span className="text-primary">Categories</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Discover the perfect font for your project from our carefully curated categories
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon
            const count = categoryCounts[category.id] || 0

            return (
              <Link key={category.id} href={`/fonts?category=${category.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{category.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {loading ? "..." : `${count} fonts`}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription className="text-base">{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">Featured Fonts:</h4>
                      <div className="space-y-2">
                        {category.featured.map((fontName) => (
                          <div key={fontName} className="text-sm text-foreground">
                            • {fontName}
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Browse {category.name} Fonts
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Popular Tags */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Popular Tags</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "modern",
              "elegant",
              "bold",
              "minimal",
              "vintage",
              "handwritten",
              "geometric",
              "condensed",
              "rounded",
              "thin",
              "heavy",
              "decorative",
              "professional",
              "creative",
              "clean",
              "stylish",
            ].map((tag) => (
              <Link key={tag} href={`/fonts?search=${tag}`}>
                <Badge
                  variant="outline"
                  className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                >
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
