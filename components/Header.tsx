"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationCenter } from "@/components/NotificationCenter"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { useAuth } from "@/lib/contexts/AuthContext"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const { language } = useLanguage()
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: "/fonts", label: t("fonts", language) },
    { href: "/categories", label: t("categories", language) },
    { href: "/chat", label: t("chat", language) },
    { href: "/dashboard", label: t("dashboard", language) },
    { href: "/my-purchases", label: "My Purchases" },
  ]

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm fixed top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-foreground">FontMarket</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link href="/admin/approve" className="text-sm font-semibold text-primary hover:text-primary/80">
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <LanguageSwitcher />
            {user && <NotificationCenter />}
            {user ? (
              <>
                <span className="text-sm hidden lg:inline">Welcome, {user.name}</span>
                <Button variant="outline" size="sm" onClick={logout}>
                  {t("logout", language)}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    {t("login", language)}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">{t("register", language)}</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center p-4 border-b">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                      <span className="text-lg font-bold">FontMarket</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <nav className="flex flex-col space-y-4 p-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg text-muted-foreground hover:text-foreground"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    {user?.role === "admin" && (
                      <Link
                        href="/admin/approve"
                        className="text-lg font-semibold text-primary hover:text-primary/80"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                  </nav>
                  <div className="mt-auto p-4 border-t space-y-4">
                    <LanguageSwitcher />
                    {user ? (
                      <Button variant="outline" className="w-full" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                        {t("logout", language)}
                      </Button>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">{t("login", language)}</Button>
                        </Link>
                        <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full">{t("register", language)}</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

