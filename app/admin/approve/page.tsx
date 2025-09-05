"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Font } from "@/lib/models/User"
import { useAuth } from "@/lib/contexts/AuthContext"
import Link from "next/link"

export default function AdminApprovePage() {
  const [pendingFonts, setPendingFonts] = useState<Font[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchPendingFonts = async () => {
    try {
      const response = await fetch("/api/admin/fonts")
      const data = await response.json()
      if (response.ok) {
        setPendingFonts(data.fonts)
      }
    } catch (error) {
      console.error("Error fetching pending fonts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      fetchPendingFonts()
    }
  }, [user])

  const handleApproval = async (fontId: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/admin/fonts/${fontId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        alert(`Font ${status}!`)
        fetchPendingFonts()
      } else {
        const data = await response.json()
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("Error updating font status:", error)
    }
  }

  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You must be an administrator to view this page.</p>
      </div>
    )
  }

  if (loading) return <p>Loading pending fonts...</p>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Font Approval Queue</h1>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Font Name</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingFonts.length > 0 ? (
                pendingFonts.map((font) => (
                  <TableRow key={font._id?.toString()}>
                    <TableCell>
                      <Link href={`/fonts/${font._id}`} target="_blank" className="font-medium hover:underline">
                        {font.name}
                      </Link>
                    </TableCell>
                    <TableCell>{font.sellerName}</TableCell>
                    <TableCell>{font.category}</TableCell>
                    <TableCell>{font.isFree ? "Free" : `$${font.price}`}</TableCell>
                    <TableCell>{new Date(font.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" onClick={() => handleApproval(font._id!.toString(), "approved")}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleApproval(font._id!.toString(), "rejected")}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No fonts pending approval.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
