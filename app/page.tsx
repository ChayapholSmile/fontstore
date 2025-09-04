"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Star, Download, MessageCircle, Heart, TrendingUp, Users, Award } from "lucide-react"
import Link from "next/link"
import type { Font } from "@/lib/models/User"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationCenter } from "@/components/NotificationCenter"
import { t } from "@/lib/i18n"
import { useSearchParams } from "next/navigation"

function HomePageContent() {
  const [featuredFonts, setFeaturedFonts] = useState<Font[]>([])
  const [popularFonts, setPopularFonts] = useState<Font[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const { language } = useLanguage()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.get("q") || ""
    setSearchQuery(query)
  }, [searchParams])

  const fetchHomepageData = async () => {
    try {
      const [featuredResponse, popularResponse] = await Promise.all([
        fetch("/api/fonts?featured=true&limit=6"),
        fetch("/api/fonts?sortBy=popular&limit=6"),
      ])

      const featuredData = await featuredResponse.json()
      const popularData = await popularResponse.json()

      setFeaturedFonts(featuredData.fonts || [])
      setPopularFonts(popularData.fonts || [])
    } catch (error) {
      console.error("Error fetching homepage data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHomepageData()
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/fonts?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-foreground">FontMarket</span>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/fonts" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("fonts")}
              </Link>
              <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("categories")}
              </Link>
              <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("chat")}
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                {t("dashboard")}
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              <LanguageSwitcher />
              <NotificationCenter />
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">{t("register")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">{t("heroTitle")}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">{t("heroSubtitle")}</p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 focus:border-primary"
              />
              <Button onClick={handleSearch} className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-lg">
                Search
              </Button>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {[
              { key: "sansSerif", value: "sans-serif" },
              { key: "serif", value: "serif" },
              { key: "display", value: "display" },
              { key: "script", value: "script" },
              { key: "monospace", value: "monospace" },
              { key: "handwritten", value: "handwritten" },
            ].map((category) => (
              <Link key={category.key} href={`/fonts?category=${category.value}`}>
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                >
                  {t(category.key)}
                </Badge>
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">10,000+</div>
              <div className="text-muted-foreground">Premium Fonts</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">5,000+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">500+</div>
              <div className="text-muted-foreground">Talented Designers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fonts */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{t("featuredFonts")}</h2>
              <p className="text-muted-foreground">Handpicked by our design team</p>
            </div>
            <Link href="/fonts?featured=true">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredFonts.map((font) => (
                <FontCard key={font._id?.toString()} font={font} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Fonts */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{t("popularFonts")}</h2>
              <p className="text-muted-foreground">Most downloaded fonts</p>
            </div>
            <Link href="/fonts?sortBy=popular">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularFonts.map((font) => (
                <FontCard key={font._id?.toString()} font={font} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Font Preview Tool */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("tryBeforeYouBuy")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("testAnyFont")}</p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>{t("fontPreviewTool")}</CardTitle>
              <CardDescription>{t("typeYourText")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Input
                  placeholder={t("tryFontPlaceholder")}
                  className="text-lg py-3"
                  defaultValue="The quick brown fox jumps over the lazy dog"
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-4 text-foreground">
                    The quick brown fox jumps over the lazy dog
                  </div>
                  <div className="text-sm text-muted-foreground">{t("previewWithModernSansPro")}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="outline">{t("changeFont")}</Button>
                <Button variant="outline">{t("adjustSize")}</Button>
                <Button variant="outline">{t("changeLanguage")}</Button>
                <Link href="/fonts">
                  <Button>{t("browseAllFonts")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">F</span>
                </div>
                <span className="text-xl font-bold">{t("fontMarket")}</span>
              </div>
              <p className="text-muted-foreground text-sm">{t("largestMarketplace")}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("browse")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/fonts" className="hover:text-foreground transition-colors">
                    {t("allFonts")}
                  </Link>
                </li>
                <li>
                  <Link href="/fonts?free=true" className="hover:text-foreground transition-colors">
                    {t("freeFonts")}
                  </Link>
                </li>
                <li>
                  <Link href="/fonts?featured=true" className="hover:text-foreground transition-colors">
                    {t("premiumFonts")}
                  </Link>
                </li>
                <li>
                  <Link href="/fonts?sortBy=newest" className="hover:text-foreground transition-colors">
                    {t("newReleases")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("sell")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/sellers/register" className="hover:text-foreground transition-colors">
                    {t("becomeASeller")}
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-foreground transition-colors">
                    {t("sellerDashboard")}
                  </Link>
                </li>
                <li>
                  <Link href="/guidelines" className="hover:text-foreground transition-colors">
                    {t("uploadGuidelines")}
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors">
                    {t("pricingGuide")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">{t("support")}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    {t("helpCenter")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    {t("contactUs")}
                  </Link>
                </li>
                <li>
                  <Link href="/license" className="hover:text-foreground transition-colors">
                    {t("licenseInfo")}
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    {t("termsOfService")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 FontMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface FontCardProps {
  font: Font
}

function FontCard({ font }: FontCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-1">{font.name}</CardTitle>
            <CardDescription>
              {t("by")} {font.sellerName}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
              <div className="text-lg font-bold text-green-600">{t("free")}</div>
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
            <Button className="w-full">{t("viewDetails")}</Button>
          </Link>
          <Button variant="outline" size="icon">
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
