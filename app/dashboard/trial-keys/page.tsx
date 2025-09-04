"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Key, Copy, Calendar, Download, Eye } from "lucide-react"
import { useLanguage } from "@/lib/contexts/LanguageContext"

interface TrialKey {
  _id: string
  key: string
  expiresAt: string
  usageCount: number
  maxUsage: number
  font: {
    name: string
    previewImage: string
  }
}

export default function TrialKeysPage() {
  const [trialKeys, setTrialKeys] = useState<TrialKey[]>([])
  const [loading, setLoading] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    fetchTrialKeys()
  }, [])

  const fetchTrialKeys = async () => {
    try {
      const response = await fetch("/api/trial-keys")
      if (response.ok) {
        const data = await response.json()
        setTrialKeys(data.trialKeys)
      }
    } catch (error) {
      console.error("Error fetching trial keys:", error)
    }
  }

  const generateTrialKey = async (fontId: string) => {
    setLoading(true)
    try {
      const response = await fetch("/api/trial-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fontId }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Trial key generated: ${data.trialKey}`)
        fetchTrialKeys()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to generate trial key")
      }
    } catch (error) {
      console.error("Error generating trial key:", error)
      alert("Failed to generate trial key")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Trial key copied to clipboard!")
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const isUsageLimitReached = (usageCount: number, maxUsage: number) => {
    return usageCount >= maxUsage
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trial Keys Management</h1>
        <p className="text-muted-foreground">
          Generate and manage trial keys for your fonts. Trial keys allow users to test your fonts for 7 days with
          limited usage.
        </p>
      </div>

      {/* Generate New Trial Key */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Generate Trial Key
          </CardTitle>
          <CardDescription>Create a new trial key for any of your fonts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Enter Font ID" className="flex-1" id="fontId" />
            <Button
              onClick={() => {
                const fontId = (document.getElementById("fontId") as HTMLInputElement)?.value
                if (fontId) generateTrialKey(fontId)
              }}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Key"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Trial keys are valid for 7 days and allow up to 100 uses</p>
        </CardContent>
      </Card>

      {/* Active Trial Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Active Trial Keys</CardTitle>
          <CardDescription>Manage your existing trial keys</CardDescription>
        </CardHeader>
        <CardContent>
          {trialKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No trial keys generated yet</p>
              <p className="text-sm">Generate trial keys to let users test your fonts</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trialKeys.map((trialKey) => (
                <div key={trialKey._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium mb-1">{trialKey.font.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            isExpired(trialKey.expiresAt) || isUsageLimitReached(trialKey.usageCount, trialKey.maxUsage)
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {isExpired(trialKey.expiresAt)
                            ? "Expired"
                            : isUsageLimitReached(trialKey.usageCount, trialKey.maxUsage)
                              ? "Usage Limit Reached"
                              : "Active"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(trialKey.expiresAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Eye className="h-3 w-3" />
                          {trialKey.usageCount}/{trialKey.maxUsage} uses
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <code className="text-sm font-mono">{trialKey.key}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(trialKey.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Usage: {((trialKey.usageCount / trialKey.maxUsage) * 100).toFixed(1)}%
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View Analytics
                      </Button>
                      <Button variant="outline" size="sm">
                        Extend Duration
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trial Key Benefits */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Trial Key Benefits</CardTitle>
          <CardDescription>How trial keys help boost your font sales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Try Before Buy</h3>
              <p className="text-sm text-muted-foreground">
                Let customers test your fonts in their projects before purchasing
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Increased Conversions</h3>
              <p className="text-sm text-muted-foreground">Trial keys typically increase purchase rates by 40-60%</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Controlled Access</h3>
              <p className="text-sm text-muted-foreground">
                Limited time and usage ensures your fonts remain protected
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
