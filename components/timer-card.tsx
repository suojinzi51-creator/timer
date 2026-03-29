"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Pause, RotateCcw, Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TimerCardProps {
  id: string
  onDelete: (id: string) => void
  isOnly: boolean
}

export function TimerCard({ id, onDelete, isOnly }: TimerCardProps) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(5 * 60)
  const [remainingSeconds, setRemainingSeconds] = useState(5 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [editingField, setEditingField] = useState<"hours" | "minutes" | "seconds" | null>(null)
  const [editValue, setEditValue] = useState("")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const alarmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 播放响亮的提醒铃声 - 持续3秒
  const playAlarmSound = useCallback(() => {
    try {
      // 创建 AudioContext
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioContextClass()
      audioContextRef.current = audioContext

      const playBeep = (startTime: number, frequency: number, duration: number) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(frequency, startTime)
        
        // 音量设置为较大值
        gainNode.gain.setValueAtTime(0.5, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      // 播放3秒的铃声序列 - 多个频率交替，模拟闹钟声
      const now = audioContext.currentTime
      const beepDuration = 0.15
      const gap = 0.1
      
      for (let i = 0; i < 12; i++) {
        const time = now + i * (beepDuration + gap)
        // 交替高低音
        playBeep(time, i % 2 === 0 ? 880 : 660, beepDuration)
      }

      // 3秒后停止
      alarmTimeoutRef.current = setTimeout(() => {
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
        }
      }, 3000)

    } catch {
      // 如果 Web Audio API 不可用，使用备用方案
      console.log("Audio playback not supported")
    }
  }, [])

  // 清理音频资源
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (alarmTimeoutRef.current) {
        clearTimeout(alarmTimeoutRef.current)
      }
    }
  }, [])

  // 计时逻辑
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsFinished(true)
            playAlarmSound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, playAlarmSound])

  // 更新显示时间
  useEffect(() => {
    const h = Math.floor(remainingSeconds / 3600)
    const m = Math.floor((remainingSeconds % 3600) / 60)
    const s = remainingSeconds % 60
    setHours(h)
    setMinutes(m)
    setSeconds(s)
  }, [remainingSeconds])

  const handleStart = useCallback(() => {
    if (remainingSeconds > 0) {
      setIsRunning(true)
      setIsFinished(false)
    }
  }, [remainingSeconds])

  const handlePause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setIsFinished(false)
    setRemainingSeconds(totalSeconds)
    // 停止铃声
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current)
    }
  }, [totalSeconds])

  const handleFieldClick = (field: "hours" | "minutes" | "seconds") => {
    if (isRunning) return
    setEditingField(field)
    const value = field === "hours" ? hours : field === "minutes" ? minutes : seconds
    setEditValue(value.toString().padStart(2, "0"))
  }

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 2)
    setEditValue(value)
  }

  const handleFieldBlur = () => {
    if (editingField) {
      let value = parseInt(editValue) || 0
      if (editingField === "hours") {
        value = Math.min(99, Math.max(0, value))
        setHours(value)
      } else if (editingField === "minutes") {
        value = Math.min(59, Math.max(0, value))
        setMinutes(value)
      } else {
        value = Math.min(59, Math.max(0, value))
        setSeconds(value)
      }

      const newHours = editingField === "hours" ? value : hours
      const newMinutes = editingField === "minutes" ? value : minutes
      const newSeconds = editingField === "seconds" ? value : seconds
      const newTotal = newHours * 3600 + newMinutes * 60 + newSeconds
      setTotalSeconds(newTotal)
      setRemainingSeconds(newTotal)
      setEditingField(null)
      setIsFinished(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFieldBlur()
    }
  }

  const formatNumber = (num: number) => num.toString().padStart(2, "0")

  const progress = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 ease-out",
        "bg-card border-border/50 shadow-lg hover:shadow-2xl",
        "rounded-2xl",
        isFinished && "animate-pulse border-accent border-2 shadow-accent/20"
      )}
    >
      {/* 装饰性时钟图标 */}
      <div className="absolute top-6 right-6 opacity-[0.07]">
        <Clock className="w-20 h-20 text-primary" />
      </div>

      {/* 进度条 */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted/50">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear rounded-r-full",
            isFinished ? "bg-accent" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-8 md:p-12">
        {/* 时间显示 */}
        <div className="flex items-center justify-center gap-1 md:gap-2 mb-8">
          {/* 小时 */}
          <div className="relative">
            {editingField === "hours" ? (
              <input
                type="text"
                value={editValue}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-24 md:w-36 text-6xl md:text-8xl font-mono font-black text-center bg-muted/50 rounded-xl outline-none ring-2 ring-primary text-foreground tracking-tight"
              />
            ) : (
              <button
                onClick={() => handleFieldClick("hours")}
                disabled={isRunning}
                className={cn(
                  "w-24 md:w-36 text-6xl md:text-8xl font-mono font-black text-center rounded-xl transition-all duration-300 tracking-tight",
                  "hover:bg-primary/5 hover:scale-105 disabled:hover:bg-transparent disabled:hover:scale-100",
                  "active:scale-95",
                  isFinished ? "text-accent" : "text-foreground"
                )}
              >
                {formatNumber(hours)}
              </button>
            )}
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              时
            </span>
          </div>

          <span className={cn(
            "text-5xl md:text-7xl font-mono font-black mx-1",
            isFinished ? "text-accent animate-pulse" : "text-foreground/40"
          )}>:</span>

          {/* 分钟 */}
          <div className="relative">
            {editingField === "minutes" ? (
              <input
                type="text"
                value={editValue}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-24 md:w-36 text-6xl md:text-8xl font-mono font-black text-center bg-muted/50 rounded-xl outline-none ring-2 ring-primary text-foreground tracking-tight"
              />
            ) : (
              <button
                onClick={() => handleFieldClick("minutes")}
                disabled={isRunning}
                className={cn(
                  "w-24 md:w-36 text-6xl md:text-8xl font-mono font-black text-center rounded-xl transition-all duration-300 tracking-tight",
                  "hover:bg-primary/5 hover:scale-105 disabled:hover:bg-transparent disabled:hover:scale-100",
                  "active:scale-95",
                  isFinished ? "text-accent" : "text-foreground"
                )}
              >
                {formatNumber(minutes)}
              </button>
            )}
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              分
            </span>
          </div>

          <span className={cn(
            "text-5xl md:text-7xl font-mono font-black mx-1",
            isFinished ? "text-accent animate-pulse" : "text-foreground/40"
          )}>:</span>

          {/* 秒 */}
          <div className="relative">
            {editingField === "seconds" ? (
              <input
                type="text"
                value={editValue}
                onChange={handleFieldChange}
                onBlur={handleFieldBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-24 md:w-36 text-6xl md:text-8xl font-mono font-black text-center bg-muted/50 rounded-xl outline-none ring-2 ring-primary text-foreground tracking-tight"
              />
            ) : (
              <button
                onClick={() => handleFieldClick("seconds")}
                disabled={isRunning}
                className={cn(
                  "w-24 md:w-36 text-6xl md:text-8xl font-mono font-black text-center rounded-xl transition-all duration-300 tracking-tight",
                  "hover:bg-primary/5 hover:scale-105 disabled:hover:bg-transparent disabled:hover:scale-100",
                  "active:scale-95",
                  isFinished ? "text-accent" : "text-foreground"
                )}
              >
                {formatNumber(seconds)}
              </button>
            )}
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              秒
            </span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center justify-center gap-4 mt-10">
          {isRunning ? (
            <Button
              onClick={handlePause}
              size="lg"
              className={cn(
                "gap-2 px-8 py-6 text-base font-semibold rounded-xl",
                "bg-secondary text-secondary-foreground",
                "shadow-md hover:shadow-lg",
                "hover:bg-secondary/80 hover:scale-105",
                "active:scale-95",
                "transition-all duration-300 ease-out"
              )}
            >
              <Pause className="w-5 h-5" />
              暂停
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              size="lg"
              disabled={remainingSeconds === 0 && !isFinished}
              className={cn(
                "gap-2 px-8 py-6 text-base font-semibold rounded-xl",
                "bg-primary text-primary-foreground",
                "shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30",
                "hover:bg-primary/90 hover:scale-105",
                "active:scale-95",
                "disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none",
                "transition-all duration-300 ease-out"
              )}
            >
              <Play className="w-5 h-5" />
              开始
            </Button>
          )}

          <Button
            onClick={handleReset}
            size="lg"
            variant="outline"
            className={cn(
              "gap-2 px-6 py-6 text-base font-semibold rounded-xl",
              "border-2 shadow-sm",
              "hover:bg-muted/50 hover:scale-105 hover:shadow-md",
              "active:scale-95",
              "transition-all duration-300 ease-out"
            )}
          >
            <RotateCcw className="w-5 h-5" />
            重置
          </Button>

          {!isOnly && (
            <Button
              onClick={() => onDelete(id)}
              size="lg"
              variant="outline"
              className={cn(
                "gap-2 px-6 py-6 text-base font-semibold rounded-xl",
                "text-destructive border-2 border-destructive/30",
                "shadow-sm hover:shadow-md",
                "hover:bg-destructive/10 hover:border-destructive/50 hover:scale-105",
                "active:scale-95",
                "transition-all duration-300 ease-out"
              )}
            >
              <Trash2 className="w-5 h-5" />
              删除
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
