"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, DollarSign, Globe, Tag, Timer } from "lucide-react"
import Link from "next/link"
import type { Font } from "@/lib/models/User"

export default function EditFontPage() {
  const router = useRouter()
  const params = useParams()
  const fontId = params.id as string

  const [formData, setFormData] = useState<Partial<Font>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const fetchFont = async () => {
      try {
        const response = await fetch(`/api/fonts/${fontId}`)
        if (!response.ok) throw new Error("Font not found")
        const data = await response.json()
        setFormData({
          ...data.font,
          promotionEnd: data.font.promotionEnd ? new Date(data.font.promotionEnd).toISOString().slice(0, 16) : "",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch font data")
      } finally {
        setLoading(false)
      }
    }
    if (fontId) fetchFont()
  }, [fontId])

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => {
      const currentTags = prev.tags || []
      return {
        ...prev,
        tags: currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag],
      }
    })
  }

  const handleLanguageToggle = (language: string) => {
    setFormData((prev) => {
      const currentLanguages = prev.supportedLanguages || []
      return {
        ...prev,
        supportedLanguages: currentLanguages.includes(language)
          ? currentLanguages.filter((l) => l !== language)
          : [...currentLanguages, language],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const response = await fetch(`/api/fonts/${fontId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Update failed")
      setSuccess("Font updated successfully!")
      router.push("/dashboard/fonts")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.name) return <p>Loading editor...</p>

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Edit Font: {formData.name}</h1>
      <p className="text-muted-foreground mb-8">Update the details for your font.</p>
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert><AlertDescription>{success}</AlertDescription></Alert>}

        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Font Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </CardContent>
        </Card>
        
        {/* Add other form sections (Pricing, Promotions, etc.) similar to upload page */}

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/fonts"><Button variant="outline">Cancel</Button></Link>
          <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </div>
      </form>
    </div>
  )
}
