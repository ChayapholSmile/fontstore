"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  endDate: string
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endDate) - +new Date()
    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }
    return timeLeft
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endDate])

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
    if (value < 0) return null
    return (
      <div key={interval} className="text-center">
        <div className="text-2xl font-bold">{value.toString().padStart(2, "0")}</div>
        <div className="text-xs uppercase text-muted-foreground">{interval}</div>
      </div>
    )
  })

  return (
    <div className="p-4 border rounded-lg bg-card">
      <p className="text-center text-sm font-medium mb-2 text-primary">ข้อเสนอจะสิ้นสุดใน</p>
      <div className="flex justify-center gap-4 text-foreground">
        {timerComponents.length ? timerComponents : <span>ข้อเสนอสิ้นสุดแล้ว!</span>}
      </div>
    </div>
  )
}

export default CountdownTimer
