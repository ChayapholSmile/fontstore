"use client"

import type React from "react"
import { Work_Sans, Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { LanguageProvider } from "@/lib/contexts/LanguageContext"
import { AuthProvider } from "@/lib/contexts/AuthContext"
import "./globals.css"

// Added Work Sans for headings and Open Sans for body text as per design brief
const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Removed useSearchParams usage that was causing Suspense boundary error

  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <LanguageProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
