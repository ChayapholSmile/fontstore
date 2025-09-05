"use client"

import type React from "react"
import { Work_Sans, Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { LanguageProvider } from "@/lib/contexts/LanguageContext"
import { AuthProvider } from "@/lib/contexts/AuthContext"
import Header from "@/components/Header"

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
  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <LanguageProvider>
            <Suspense
              fallback={
                <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>
              }
            >
              <Header />
              <main className="pt-16">{children}</main>
            </Suspense>
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
