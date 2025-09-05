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
import { Upload, X, FileText, DollarSign, Globe, Tag } from "lucide-react"
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
      // Validate form
      if (!formData.name || !formData.description || !formData.category) {
        throw new Error("Please fill in all required fields")
      }

      if (files.length === 0) {
        throw new Error("Please upload at least one font file")
      }

      if (!formData.isFree && !formData.price) {
        throw new Error("Please set a price for paid fonts")
      }

      // Convert files to Data URLs
      const fontFilesData = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          size: file.size,
          format: file.name.split(".").pop()?.toLowerCase(),
          dataUrl: await fileToDataUrl(file),
        })),
      )

      const previewImagesData = await Promise.all(
        previewImages.map(async (file) => ({
          name: file.name,
          size: file.size,
          dataUrl: await fileToDataUrl(file),
        })),
      )

      const payload = {
        fontData: formData,
        fontFiles: fontFilesData,
        previewImages: previewImagesData,
      }

      const response = await fetch("/api/fonts/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setSuccess("Font uploaded successfully! It will be reviewed before going live.")
      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        originalPrice: "",
        isFree: false,
        tags: [],
        supportedLanguages: [],
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

            {/* Basic Information */}
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
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
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

            {/* Pricing */}
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
                    onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked as boolean })}
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

            {/* Language Support */}
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
                  {languages.map((language) => (
                    <div key={language.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={language.id}
                        checked={formData.supportedLanguages.includes(language.id)}
                        onCheckedChange={() => handleLanguageToggle(language.id)}
                      />
                      <Label htmlFor={language.id}>{language.name}</Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
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
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      {formData.tags.includes(tag) && <X className="w-3 h-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* File Uploads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Files</span>
                </CardTitle>
                <CardDescription>Upload your font files and preview images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Font Files */}
                <div className="space-y-4">
                  <Label>Font Files *</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Upload font files</p>
                        <p className="text-xs text-muted-foreground">
                          Supported formats: OTF, TTF, WOFF, WOFF2 (Max 10MB each)
                        </p>
                      </div>
                      <Input
                        type="file"
                        multiple
                        accept=".otf,.ttf,.woff,.woff2"
                        onChange={(e) => handleFileUpload(e, "font")}
                        className="mt-4"
                      />
                    </div>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Font Files:</Label>
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index, "font")}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview Images */}
                <div className="space-y-4">
                  <Label>Preview Images</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Upload preview images</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, WebP (Max 5MB each, recommended: 1200x800px)
                        </p>
                      </div>
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "preview")}
                        className="mt-4"
                      />
                    </div>
                  </div>

                  {previewImages.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Preview Images:</Label>
                      {previewImages.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index, "preview")}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
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
