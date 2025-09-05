import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

function NotFoundContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg w-full">
        <div>
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold text-foreground mt-4">ไม่พบหน้า</h2>
          <p className="text-muted-foreground mt-2">
            ขออภัย ไม่พบหน้าที่คุณกำลังมองหา อาจถูกลบไปแล้วหรือคุณอาจพิมพ์ URL ผิด
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input placeholder="ค้นหาฟอนต์..." className="pl-12 pr-4 py-6 text-lg rounded-xl border-2" />
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/">
            <Button size="lg">กลับหน้าหลัก</Button>
          </Link>
          <Link href="/fonts">
            <Button size="lg" variant="outline">
              ดูฟอนต์ทั้งหมด
            </Button>
          </Link>
        </div>
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
