"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, Download, Heart, MessageCircle, Share2, ShoppingCart, Eye, Globe, Calendar, User } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter, notFound } from "next/navigation"
import type { Font } from "@/lib/models/User"
import FontPreviewGenerator from "@/components/FontPreviewGenerator"
import { useAuth } from "@/lib/contexts/AuthContext"
import CountdownTimer from "@/components/CountdownTimer"

export default function FontDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [font, setFont] = useState<Font | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog")
  const [selectedSize, setSelectedSize] = useState(24)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (font && font.fontFiles && font.fontFiles.length > 0) {
      const fontFile = font.fontFiles[0]
      const styleId = `font-style-${font._id}`
      if (document.getElementById(styleId)) return

      const style = document.createElement("style")
      style.id = styleId
      style.innerHTML = `
        @font-face {
          font-family: "${font.name}";
          src: url('${fontFile.fileUrl}');
        }
      `
      document.head.appendChild(style)

      return () => {
        const styleElement = document.getElementById(styleId)
        if (styleElement) {
          document.head.removeChild(styleElement)
        }
      }
    }
  }, [font])

  useEffect(() => {
    if (params.id) {
      fetchFont(params.id as string)
    }
  }, [params.id])

  const fetchFont = async (fontId: string) => {
    try {
      const response = await fetch(`/api/fonts/${fontId}`)
      if (!response.ok) {
        notFound()
        return
      }
      const data = await response.json()
      setFont(data.font)
      setReviews(data.reviews || [])
    } catch (error) {
      console.error("Error fetching font:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontId: font?._id }),
      })
      alert("Added to cart!")
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  const addToWishlist = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontId: font?._id }),
      })
      alert("Added to wishlist!")
    } catch (error) {
      console.error("Error adding to wishlist:", error)
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    try {
      const cartResponse = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontId: font?._id }),
      })

      if (!cartResponse.ok) throw new Error("Could not add font to cart.")
      router.push("/cart")
    } catch (error) {
      console.error("Buy Now error:", error)
      alert("Could not proceed with purchase. Please try adding to cart manually.")
    }
  }

  const handleFreeDownload = () => {
    if (!font || !font.fontFiles || font.fontFiles.length === 0) {
      alert("No font file available for download.")
      return
    }
    window.open(font.fontFiles[0].fileUrl, "_blank")
  }

  const handleStartChat = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (!font) return

    try {
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: font.sellerId }),
      })
      const data = await response.json()
      if (response.ok && data.conversationId) {
        router.push(`/chat?conversationId=${data.conversationId}`)
      } else {
        throw new Error(data.error || "Could not start conversation.")
      }
    } catch (error) {
      console.error("Error starting chat:", error)
      alert("Error starting chat.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <p>Loading font...</p>
      </div>
    )
  }

  if (!font) {
    return notFound()
  }

  const isPromotionActive = font.promotionEnd && new Date(font.promotionEnd) > new Date()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8 text-sm text-muted-foreground">
          <Link href="/fonts" className="hover:text-foreground">
            Fonts
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/fonts?category=${font.category}`} className="hover:text-foreground">
            {font.category}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{font.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{font.name}</h1>
                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>by {font.sellerName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(font.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{font.downloads} downloads</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={addToWishlist}>
                    <Heart className="w-4 h-4 mr-2" /> Wishlist
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">{font.category}</Badge>
                {font.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
                {font.supportedLanguages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    <Globe className="w-3 h-3 mr-1" />
                    {lang}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground text-lg">{font.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Font Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Type to preview..."
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="min-h-[150px] text-4xl"
                  style={{ fontFamily: `"${font.name}"`, fontSize: `${selectedSize}px` }}
                />
              </CardContent>
            </Card>

            {/* Other tabs remain the same */}
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                {isPromotionActive && font.promotionEnd && (
                  <div className="mb-4">
                    <CountdownTimer endDate={font.promotionEnd.toString()} />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    {isPromotionActive && font.promotionType === "sale" && font.salePrice !== undefined ? (
                      <>
                        <div className="text-2xl font-bold text-primary">${font.salePrice}</div>
                        <div className="text-sm text-muted-foreground line-through">${font.price}</div>
                      </>
                    ) : (isPromotionActive && font.promotionType === "giveaway") || font.isFree ? (
                      <div className="text-2xl font-bold text-green-600">Free</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-primary">${font.price}</div>
                        {font.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">${font.originalPrice}</div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{font.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {font.isFree || (isPromotionActive && font.promotionType === "giveaway") ? (
                  <Button className="w-full" size="lg" onClick={handleFreeDownload}>
                    <Download className="w-4 h-4 mr-2" /> Download Free
                  </Button>
                ) : (
                  <>
                    <Button className="w-full" size="lg" onClick={addToCart}>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleBuyNow}>
                      Buy Now
                    </Button>
                  </>
                )}
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={addToWishlist}>
                    <Heart className="w-4 h-4 mr-2" /> Wishlist
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleStartChat}>
                    <MessageCircle className="w-4 h-4 mr-2" /> Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Seller info card remains */}
          </div>
        </div>
      </div>
    </div>
  )
}

