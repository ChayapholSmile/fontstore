"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FontPreviewGeneratorProps {
  text: string
  fontSize: number
  fontName: string
}

export default function FontPreviewGenerator({ text, fontSize, fontName }: FontPreviewGeneratorProps) {
  const [backgroundColor, setBackgroundColor] = useState("#ffffff")
  const [textColor, setTextColor] = useState("#000000")
  const [previewStyle, setPreviewStyle] = useState("normal")

  return (
    <div className="space-y-6">
      {/* Preview Canvas */}
      <Card>
        <CardContent className="p-8">
          <div
            className="min-h-[200px] rounded-lg flex items-center justify-center p-8"
            style={{
              backgroundColor,
              color: textColor,
            }}
          >
            <div
              className="text-center break-words max-w-full"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: `'${fontName}', system-ui, sans-serif`,
                fontWeight: previewStyle === "bold" ? "bold" : "normal",
                fontStyle: previewStyle === "italic" ? "italic" : "normal",
              }}
            >
              {text || "Type something to preview..."}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Background Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-8 h-8 rounded border"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border rounded"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Text Color</label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-8 h-8 rounded border"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border rounded"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Style</label>
          <Select value={previewStyle} onValueChange={setPreviewStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="italic">Italic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBackgroundColor("#ffffff")
              setTextColor("#000000")
            }}
          >
            Light Theme
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBackgroundColor("#000000")
              setTextColor("#ffffff")
            }}
          >
            Dark Theme
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBackgroundColor("#f3f4f6")
              setTextColor("#1f2937")
            }}
          >
            Minimal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBackgroundColor("#3b82f6")
              setTextColor("#ffffff")
            }}
          >
            Brand Blue
          </Button>
        </div>
      </div>
    </div>
  )
}
