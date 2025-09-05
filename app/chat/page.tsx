"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Search, MoreVertical, Paperclip, DollarSign, Check, X, Download, MessageCircle, ShieldCheck } from "lucide-react"
import Link from "next/link"
import type { ChatMessage } from "@/lib/models/User"
import { useSearchParams, useRouter } from "next/navigation"

interface Conversation {
  _id: string
  participants: {
    _id: string
    displayName: string
    avatar?: string
  }[]
  lastMessage?: ChatMessage
  unreadCount: number
  updatedAt: string
}

export default function ChatPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const conversationIdFromUrl = searchParams.get("conversationId")
    if (conversationIdFromUrl) {
      setSelectedConversation(conversationIdFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    fetchCurrentUser()
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat/conversations")
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${conversationId}`)
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation,
          message: newMessage,
          messageType: "text",
        }),
      })

      if (response.ok) {
        setNewMessage("")
        fetchMessages(selectedConversation)
        fetchConversations()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleApprovePayment = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/approve`, {
        method: "POST",
      })

      if (response.ok) {
        alert("Payment approved!")
        fetchMessages(selectedConversation!)
        fetchConversations()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to approve payment.")
      }
    } catch (error) {
      console.error("Error approving payment:", error)
      alert("An error occurred while approving payment.")
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p._id !== currentUser?._id)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                {conversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const otherParticipant = getOtherParticipant(conversation)
                    return (
                      <div
                        key={conversation._id}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedConversation === conversation._id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation._id)}
                      >
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>{otherParticipant?.displayName?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium truncate">
                                {otherParticipant?.displayName || "Unknown User"}
                              </h4>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage?.message || "No messages yet"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(conversation.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {getOtherParticipant(conversations.find((c) => c._id === selectedConversation)!)
                            ?.displayName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">
                          {getOtherParticipant(conversations.find((c) => c._id === selectedConversation)!)
                            ?.displayName || "Unknown User"}
                        </h3>
                        <p className="text-sm text-muted-foreground">Online</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message._id?.toString()}
                          message={message}
                          isOwn={message.senderId.toString() === currentUser?._id}
                          currentUser={currentUser}
                          onApprovePayment={handleApprovePayment}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
  currentUser: any
  onApprovePayment: (orderId: string) => void
}

function MessageBubble({ message, isOwn, currentUser, onApprovePayment }: MessageBubbleProps) {
  const isPaymentRequest = message.messageType === "payment-request"

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%]`}>
        <div
          className={`rounded-lg p-3 ${
            isOwn
              ? "bg-primary text-primary-foreground"
              : isPaymentRequest
                ? "bg-yellow-50 border border-yellow-200"
                : "bg-muted"
          }`}
        >
          {isPaymentRequest ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Payment Request</span>
              </div>
              <p className="text-sm text-yellow-700">{message.message}</p>
              <div className="text-lg font-bold text-yellow-800">${message.paymentRequest?.amount}</div>

              {/* Seller's view */}
              {currentUser?.role === "seller" && !isOwn && message.paymentRequest?.status === "pending" && (
                <Button size="sm" onClick={() => onApprovePayment(message.paymentRequest!.orderId!.toString())}>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Approve Payment
                </Button>
              )}

              {/* Buyer's view */}
              {isOwn && message.paymentRequest?.status === "pending" && (
                <Badge variant="outline">Awaiting seller approval</Badge>
              )}

              {/* Both views after completion */}
              {message.paymentRequest?.status === "paid" && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span className="text-sm font-medium">Payment Completed</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm">{message.message}</p>
          )}
        </div>
        <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? "text-right" : "text-left"}`}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
