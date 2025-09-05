"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, X, FileText, DollarSign, Globe, Tag, Timer } from "lucide-react"
import Link from "next/link"

// Helper function to convert a file to a Data URL
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function UploadFontPage() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    originalPrice: "",
    isFree: false,
    tags: [] as string[],
    supportedLanguages: [] as string[],
    promotionType: "none",
    promotionEnd: "",
    salePrice: "",
  })
  const [files, setFiles] = useState<File[]>([])
  const [previewImages, setPreviewImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const categories = [
    { value: "sans-serif", label: "Sans Serif" },
    { value: "serif", label: "Serif" },
    { value: "display", label: "Display" },
    { value: "script", label: "Script" },
    { value: "monospace", label: "Monospace" },
  ]

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "font" | "preview") => {
    const uploadedFiles = Array.from(e.target.files || [])
    if (type === "font") {
      setFiles(uploadedFiles)
    } else {
      setPreviewImages(uploadedFiles)
    }
  }

  const removeFile = (index: number, type: "font" | "preview") => {
    if (type === "font") {
      setFiles(files.filter((_, i) => i !== index))
    } else {
      setPreviewImages(previewImages.filter((_, i) => i !== index))
    }
  }

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleLanguageToggle = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      supportedLanguages: prev.supportedLanguages.includes(language)
        ? prev.supportedLanguages.filter((l) => l !== language)
        : [...prev.supportedLanguages, language],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!formData.name || !formData.description || !formData.category) {
        throw new Error("Please fill in all required fields")
      }
      if (files.length === 0) throw new Error("Please upload at least one font file")
      if (!formData.isFree && !formData.price) throw new Error("Please set a price for paid fonts")
      if (formData.promotionType === "sale" && !formData.salePrice) throw new Error("Please set a sale price")
      if (formData.promotionType !== "none" && !formData.promotionEnd)
        throw new Error("Please set a promotion end date")

      const fontFilesData = (
        await Promise.all(
          files.map(async (file) => {
            const format = file.name.split(".").pop()?.toLowerCase()
            if (!format || !["otf", "ttf", "woff", "woff2"].includes(format)) {
              console.warn(`Skipping file with invalid format: ${file.name}`)
              return null
            }
            return {
              name: file.name,
              size: file.size,
              format,
              dataUrl: await fileToDataUrl(file),
            }
          }),
        )
      ).filter(Boolean)

      if (fontFilesData.length === 0) {
        throw new Error("No valid font files were provided. Supported formats: otf, ttf, woff, woff2.")
      }

      const previewImagesData = await Promise.all(
        previewImages.map(async (file) => ({
          name: file.name,
          size: file.size,
          dataUrl: await fileToDataUrl(file),
        })),
      )

      const payload = {
        fontData: {
          ...formData,
          promotionType: formData.promotionType === "none" ? undefined : formData.promotionType,
        },
        fontFiles: fontFilesData,
        previewImages: previewImagesData,
      }

      const response = await fetch("/api/fonts/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Upload failed")

      setSuccess("Font uploaded successfully! It will be reviewed before going live.")
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        originalPrice: "",
        isFree: false,
        tags: [],
        supportedLanguages: [],
        promotionType: "none",
        promotionEnd: "",
        salePrice: "",
      })
      setFiles([])
      setPreviewImages([])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload New Font</h1>
            <p className="text-muted-foreground">
              Share your typography with the world. All uploads are reviewed before going live.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>Provide basic details about your font</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Font Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Modern Sans Pro"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your font, its features, and ideal use cases..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Pricing</span>
                </CardTitle>
                <CardDescription>Set your font pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(c) => setFormData({ ...formData, isFree: c as boolean })}
                  />
                  <Label htmlFor="isFree">This is a free font</Label>
                </div>
                {!formData.isFree && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (USD) *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="29.99"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="39.99"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="w-5 h-5" />
                  <span>Promotions & Timed Release</span>
                </CardTitle>
                <CardDescription>Set up a sale or a limited-time giveaway.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="promotionType">Promotion Type</Label>
                    <Select
                      value={formData.promotionType}
                      onValueChange={(value) => setFormData({ ...formData, promotionType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select promotion type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="sale">Sale</SelectItem>
                        <SelectItem value="giveaway">Giveaway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promotionEnd">Promotion End Date</Label>
                    <Input
                      id="promotionEnd"
                      type="datetime-local"
                      disabled={formData.promotionType === "none"}
                      value={formData.promotionEnd}
                      onChange={(e) => setFormData({ ...formData, promotionEnd: e.target.value })}
                    />
                  </div>
                </div>
                {formData.promotionType === "sale" && (
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Sale Price (USD)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="14.99"
                      value={formData.salePrice}
                      onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Language Support</span>
                </CardTitle>
                <CardDescription>Select which languages your font supports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {languages.map((lang) => (
                    <div key={lang.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={lang.id}
                        checked={formData.supportedLanguages.includes(lang.id)}
                        onCheckedChange={() => handleLanguageToggle(lang.id)}
                      />
                      <Label htmlFor={lang.id}>{lang.name}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="w-5 h-5" />
                  <span>Tags</span>
                </CardTitle>
                <CardDescription>Add tags to help users discover your font</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      {formData.tags.includes(tag) && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Files</span>
                </CardTitle>
                <CardDescription>Upload your font files and preview images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Font Files *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload font files</p>
                    <p className="text-xs text-muted-foreground">OTF, TTF, WOFF, WOFF2 (Max 10MB each)</p>
                    <Input
                      type="file"
                      multiple
                      accept=".otf,.ttf,.woff,.woff2"
                      onChange={(e) => handleFileUpload(e, "font")}
                      className="mt-4"
                    />
                  </div>
                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Font Files:</Label>
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{f.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(i, "font")}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <Label>Preview Images</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium">Upload preview images</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, WebP (Max 5MB each)</p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "preview")}
                      className="mt-4"
                    />
                  </div>
                  {previewImages.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Preview Images:</Label>
                      {previewImages.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{f.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(i, "preview")}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Uploading..." : "Upload Font"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

