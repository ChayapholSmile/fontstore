"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, Calendar, DollarSign, TrendingUp } from "lucide-react"
import { useLanguage } from "@/lib/contexts/LanguageContext"

interface Font {
  _id: string
  name: string
  category: string
  price: number
  downloads: number
  rating: number
  sponsored: boolean
  sponsorEndDate?: string
}

export default function SponsorPage() {
  const [fonts, setFonts] = useState<Font[]>([])
  const [selectedFont, setSelectedFont] = useState<string>("")
  const [sponsorAmount, setSponsorAmount] = useState("")
  const [sponsorDuration, setSponsorDuration] = useState("")
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    fetchUserFonts()
  }, [])

  const fetchUserFonts = async () => {
    try {
      const response = await fetch("/api/dashboard/fonts")
      if (response.ok) {
        const data = await response.json()
        setFonts(data.fonts)
      }
    } catch (error) {
      console.error("Error fetching fonts:", error)
    }
  }

  const handleSponsor = async () => {
    if (!selectedFont || !sponsorAmount || !sponsorDuration) {
      alert("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fontId: selectedFont,
          amount: sponsorAmount,
          duration: sponsorDuration,
        }),
      })

      if (response.ok) {
        alert("Font sponsored successfully!")
        fetchUserFonts()
        setSelectedFont("")
        setSponsorAmount("")
        setSponsorDuration("")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to sponsor font")
      }
    } catch (error) {
      console.error("Error sponsoring font:", error)
      alert("Failed to sponsor font")
    } finally {
      setLoading(false)
    }
  }

  const sponsoredFonts = fonts.filter((font) => font.sponsored)
  const availableFonts = fonts.filter((font) => !font.sponsored)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sponsor Your Fonts</h1>
        <p className="text-muted-foreground">
          Boost your font visibility with sponsored listings. Sponsored fonts appear at the top of search results and
          category pages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sponsor New Font */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Sponsor a Font
            </CardTitle>
            <CardDescription>Select a font to sponsor and increase its visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="font-select">Select Font</Label>
              <Select value={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a font to sponsor" />
                </SelectTrigger>
                <SelectContent>
                  {availableFonts.map((font) => (
                    <SelectItem key={font._id} value={font._id}>
                      {font.name} - {font.downloads} downloads
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Sponsor Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="50"
                value={sponsorAmount}
                onChange={(e) => setSponsorAmount(e.target.value)}
                min="10"
                step="10"
              />
              <p className="text-sm text-muted-foreground mt-1">Minimum $10. Higher amounts get better placement.</p>
            </div>

            <div>
              <Label htmlFor="duration">Duration (days)</Label>
              <Select value={sponsorDuration} onValueChange={setSponsorDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days - $0.50/day</SelectItem>
                  <SelectItem value="14">14 days - $0.45/day</SelectItem>
                  <SelectItem value="30">30 days - $0.40/day</SelectItem>
                  <SelectItem value="60">60 days - $0.35/day</SelectItem>
                  <SelectItem value="90">90 days - $0.30/day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sponsorAmount && sponsorDuration && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Total Cost:</span>
                  <span className="font-bold text-lg">${(Number.parseFloat(sponsorAmount) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Duration:</span>
                  <span>{sponsorDuration} days</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleSponsor}
              disabled={loading || !selectedFont || !sponsorAmount || !sponsorDuration}
              className="w-full"
            >
              {loading ? "Processing..." : "Sponsor Font"}
            </Button>
          </CardContent>
        </Card>

        {/* Sponsored Fonts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Active Sponsorships
            </CardTitle>
            <CardDescription>Your currently sponsored fonts</CardDescription>
          </CardHeader>
          <CardContent>
            {sponsoredFonts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sponsored fonts yet</p>
                <p className="text-sm">Sponsor a font to boost its visibility</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sponsoredFonts.map((font) => (
                  <div key={font._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{font.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />${font.price}
                        </span>
                        <span>{font.downloads} downloads</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {font.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-2">
                        Sponsored
                      </Badge>
                      {font.sponsorEndDate && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(font.sponsorEndDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sponsorship Benefits */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Sponsorship Benefits</CardTitle>
          <CardDescription>What you get when you sponsor your fonts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Top Placement</h3>
              <p className="text-sm text-muted-foreground">
                Your fonts appear at the top of search results and category pages
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Special Badge</h3>
              <p className="text-sm text-muted-foreground">
                Sponsored fonts get a special "Sponsored" badge for increased visibility
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">More Sales</h3>
              <p className="text-sm text-muted-foreground">
                Increased visibility typically leads to 3-5x more downloads and sales
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
