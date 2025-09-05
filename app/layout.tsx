import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
  title: "ChayapholSmile Fonts - Premium Font Marketplace",
  description:
    "Discover and purchase premium fonts from talented designers worldwide. A marketplace by ChayapholSmile.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'

