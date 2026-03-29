"use client"

import { useEffect, useState } from "react"

export function ClockDecoration() {
  const [time, setTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(new Date())
    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 在客户端挂载前显示占位符
  if (!mounted || !time) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-36 h-36 md:w-44 md:h-44">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15 shadow-inner" />
          <div className="absolute inset-3 rounded-full border-2 border-primary/10" />
          <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary z-10 shadow-md" />
        </div>
        <div className="text-2xl md:text-3xl font-mono font-bold text-foreground/80 tracking-wider">
          --:--:--
        </div>
      </div>
    )
  }

  const secondsDegrees = (time.getSeconds() / 60) * 360
  const minutesDegrees = ((time.getMinutes() + time.getSeconds() / 60) / 60) * 360
  const hoursDegrees = ((time.getHours() % 12 + time.getMinutes() / 60) / 12) * 360

  const formattedTime = time.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36 md:w-44 md:h-44">
        {/* 外圈 */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/15 shadow-inner" />
        
        {/* 内圈装饰 */}
        <div className="absolute inset-3 rounded-full border-2 border-primary/10" />
        
        {/* 刻度 */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-4 bg-primary/25 rounded-full"
            style={{
              top: "10px",
              left: "50%",
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
              transformOrigin: `50% ${68}px`,
            }}
          />
        ))}

        {/* 小刻度 */}
        {Array.from({ length: 60 }).map((_, i) => {
          if (i % 5 === 0) return null
          return (
            <div
              key={`small-${i}`}
              className="absolute w-0.5 h-2 bg-primary/15 rounded-full"
              style={{
                top: "12px",
                left: "50%",
                transform: `translateX(-50%) rotate(${i * 6}deg)`,
                transformOrigin: `50% ${66}px`,
              }}
            />
          )
        })}

        {/* 中心点 */}
        <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary z-10 shadow-md" />

        {/* 时针 */}
        <div
          className="absolute top-1/2 left-1/2 w-2 h-10 md:h-12 -translate-x-1/2 origin-top rounded-full bg-foreground/80 shadow-sm transition-transform duration-300"
          style={{
            transform: `translateX(-50%) rotate(${hoursDegrees}deg)`,
            transformOrigin: "50% 0%",
          }}
        />

        {/* 分针 */}
        <div
          className="absolute top-1/2 left-1/2 w-1.5 h-14 md:h-16 -translate-x-1/2 origin-top rounded-full bg-foreground/60 shadow-sm transition-transform duration-300"
          style={{
            transform: `translateX(-50%) rotate(${minutesDegrees}deg)`,
            transformOrigin: "50% 0%",
          }}
        />

        {/* 秒针 */}
        <div
          className="absolute top-1/2 left-1/2 w-1 h-16 md:h-[72px] -translate-x-1/2 origin-top rounded-full bg-primary shadow-sm"
          style={{
            transform: `translateX(-50%) rotate(${secondsDegrees}deg)`,
            transformOrigin: "50% 0%",
          }}
        />
      </div>

      {/* 数字时间显示 */}
      <div className="text-2xl md:text-3xl font-mono font-bold text-foreground/80 tracking-wider">
        {formattedTime}
      </div>
    </div>
  )
}
