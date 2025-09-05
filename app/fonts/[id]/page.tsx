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
      // First, add to cart
      const cartResponse = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontId: font?._id }),
      })

      if (!cartResponse.ok) {
        throw new Error("Could not add font to cart.")
      }

      // Then, redirect to cart for checkout
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
    // In a real scenario, this would be a secure, expiring link.
    // For this app, we'll directly open the placeholder URL.
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
        router.push(`/chat?conversation=${data.conversationId}`)
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!font) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Font Header */}
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
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
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

            {/* Font Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Font Preview</CardTitle>
                <CardDescription>Try your own text and see how it looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preview Text</label>
                    <Textarea
                      placeholder="Type your text here..."
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      className="min-h-[100px]"
                      style={{ fontFamily: `'${font.name}', system-ui, sans-serif`, fontSize: `${selectedSize}px` }}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Size</label>
                      <Input
                        type="number"
                        min="12"
                        max="72"
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(Number(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>

                <FontPreviewGenerator text={previewText} fontSize={selectedSize} fontName={font.name} />
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="license">License</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="similar">Similar</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Font Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Category</h4>
                        <p className="text-muted-foreground">{font.category}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Languages</h4>
                        <p className="text-muted-foreground">{font.supportedLanguages.join(", ")}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">File Formats</h4>
                        <p className="text-muted-foreground">
                          {font.fontFiles.map((f) => f.format.toUpperCase()).join(", ")}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Total Size</h4>
                        <p className="text-muted-foreground">
                          {Math.round(font.fontFiles.reduce((acc, f) => acc + f.fileSize, 0) / 1024)} KB
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="license">
                <Card>
                  <CardHeader>
                    <CardTitle>License Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">License Type</h4>
                        <Badge variant="secondary">{font.license.type}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Terms</h4>
                        <p className="text-muted-foreground">{font.license.terms}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Reviews</CardTitle>
                      <CardDescription>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(font.rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <span>{font.rating} out of 5</span>
                          <span className="text-muted-foreground">({reviews.length} reviews)</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reviews.length === 0 ? (
                        <p className="text-muted-foreground">No reviews yet. Be the first to review this font!</p>
                      ) : (
                        <div className="space-y-4">
                          {reviews.map((review: any) => (
                            <div key={review._id} className="border-b pb-4 last:border-b-0">
                              <div className="flex items-start space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>{review.buyerName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium">{review.buyerName}</span>
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-3 h-3 ${
                                            i < review.rating
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-muted-foreground"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-muted-foreground">{review.comment}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="similar">
                <Card>
                  <CardHeader>
                    <CardTitle>Similar Fonts</CardTitle>
                    <CardDescription>You might also like these fonts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Similar fonts will be displayed here...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    {font.isFree ? (
                      <div className="text-2xl font-bold text-green-600">Free</div>
                    ) : (
                      <div>
                        <div className="text-2xl font-bold text-primary">${font.price}</div>
                        {font.originalPrice && (
                          <div className="text-sm text-muted-foreground line-through">${font.originalPrice}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{font.rating}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {font.isFree ? (
                  <Button className="w-full" size="lg" onClick={handleFreeDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Free
                  </Button>
                ) : (
                  <>
                    <Button className="w-full" size="lg" onClick={addToCart}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" onClick={handleBuyNow}>
                      Buy Now
                    </Button>
                  </>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={addToWishlist}>
                    <Heart className="w-4 h-4 mr-2" />
                    Wishlist
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleStartChat}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Instant download after purchase</p>
                  <p>• Commercial license included</p>
                  <p>• 30-day money-back guarantee</p>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>About the Designer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>{font.sellerName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">{font.sellerName}</h4>
                    <p className="text-sm text-muted-foreground mb-3">Professional type designer</p>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleStartChat}>
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
