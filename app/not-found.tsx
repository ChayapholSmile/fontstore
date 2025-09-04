import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function NotFoundContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  )
}
