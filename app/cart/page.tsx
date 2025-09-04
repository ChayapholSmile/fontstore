"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ShoppingCart, CreditCard } from "lucide-react"
import Link from "next/link"
import type { Font } from "@/lib/models/User"

interface CartItem {
  _id: string
  font: Font
  quantity: number
  addedAt: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      const data = await response.json()
      setCartItems(data.items || [])
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      })
      fetchCart()
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })
      fetchCart()
    } catch (error) {
      console.error("Error removing item:", error)
    }
  }

  const checkout = async () => {
    setProcessing(true)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        window.location.href = data.redirectUrl || "/chat"
      } else {
        const error = await response.json()
        alert(error.error || "Checkout failed. Please try again.")
      }
    } catch (error) {
      console.error("Error during checkout:", error)
      alert("An unexpected error occurred during checkout.")
    } finally {
      setProcessing(false)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.font.price * item.quantity, 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold">FontMarket</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/fonts" className="text-muted-foreground hover:text-foreground transition-colors">
                Browse Fonts
              </Link>
              <Link href="/cart" className="text-primary font-medium">
                Cart ({cartItems.length})
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                Profile
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Shopping Cart ({cartItems.length} items)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground mb-4">Add some fonts to get started</p>
                    <Link href="/fonts">
                      <Button>Browse Fonts</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <span className="font-bold text-lg">Aa</span>
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold">{item.font.name}</h3>
                          <p className="text-sm text-muted-foreground">by {item.font.sellerName}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="secondary">{item.font.category}</Badge>
                            {item.font.supportedLanguages.map((lang) => (
                              <Badge key={lang} variant="outline" className="text-xs">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold">${(item.font.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">${item.font.price} each</div>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => removeItem(item._id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <Button className="w-full" size="lg" onClick={checkout} disabled={processing}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    {processing ? "Processing..." : "Contact Seller to Pay"}
                  </Button>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• You will be redirected to a chat with the seller.</p>
                    <p>• Finalize payment and receive your font directly.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

