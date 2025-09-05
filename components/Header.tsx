"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationCenter } from "@/components/NotificationCenter"
import { useLanguage } from "@/lib/contexts/LanguageContext"
import { t } from "@/lib/i18n"
import { useAuth } from "@/lib/contexts/AuthContext"

export default function Header() {
  const { language } = useLanguage()
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm fixed top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-foreground">FontMarket</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/fonts" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("fonts", language)}
            </Link>
            <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("categories", language)}
            </Link>
            <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("chat", language)}
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              {t("dashboard", language)}
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <NotificationCenter />
            {user ? (
              <>
                <span className="text-sm hidden sm:inline">Welcome, {user.name}</span>
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
        </div>
      </div>
    </header>
  )
}
