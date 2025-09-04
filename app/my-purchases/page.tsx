"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Calendar, DollarSign, FileText, History } from "lucide-react"
import Link from "next/link"

interface Purchase {
  _id: string
  fontName: string
  fontId: string
  amount: number
  status: string
  purchaseDate: string
  downloadCount: number
  lastDownload?: string
  license: string
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/orders/my-purchases")
      if (response.ok) {
        const data = await response.json()
        setPurchases(data.purchases)
      }
    } catch (error) {
      console.error("Error fetching purchases:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (orderId: string) => {
    try {
      const response = await fetch(`/api/download/${orderId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `font-${orderId}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Refresh purchases to update download count
        fetchPurchases()
      } else {
        alert("Download failed. Please try again.")
      }
    } catch (error) {
      console.error("Error downloading font:", error)
      alert("Download failed. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Purchases</h1>
        <p className="text-muted-foreground">
          Download and manage your purchased fonts. All purchases include lifetime download access.
        </p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No purchases yet</h3>
            <p className="text-muted-foreground mb-4">
              Start browsing our font collection to find the perfect typography for your projects.
            </p>
            <Link href="/fonts">
              <Button>Browse Fonts</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {purchases.map((purchase) => (
            <Card key={purchase._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1">{purchase.fontName}</CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />${purchase.amount}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>{purchase.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      Downloaded {purchase.downloadCount} times
                    </span>
                    {purchase.lastDownload && (
                      <span className="flex items-center gap-1">
                        <History className="h-3 w-3" />
                        Last: {new Date(purchase.lastDownload).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {purchase.license} License
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDownload(purchase._id)}
                    disabled={purchase.status !== "completed"}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Font
                  </Button>

                  <Link href={`/fonts/${purchase.fontId}`}>
                    <Button variant="outline">View Font Details</Button>
                  </Link>

                  <Link href={`/my-purchases/${purchase._id}/history`}>
                    <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                      <History className="h-4 w-4" />
                      Download History
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>License:</strong> {purchase.license} - Copyright ©{" "}
                    {new Date(purchase.purchaseDate).getFullYear()} Font Designer, Licensed to: Your Name (Unique
                    License ID: {purchase._id.slice(-8)})
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
