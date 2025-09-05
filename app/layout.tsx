import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"
import "./globals.css"

export const metadata: Metadata = {
  title: "FontMarket - Premium Font Marketplace",
  description: "Discover and purchase premium fonts from talented designers worldwide. Support multiple languages: Thai, English, and Chinese.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}
