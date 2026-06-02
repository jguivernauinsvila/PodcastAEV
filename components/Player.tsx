"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  src: string
  title: string
  onNext: () => void
  autoPlay?: boolean
  startTime?: number
}

const STORAGE_TIME = "podcast_last_time"

export default function Player({
  src,
  title,
  onNext,
  autoPlay,
  startTime = 0
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)

  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const update = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
      localStorage.setItem(STORAGE_TIME, String(audio.currentTime))
    }

    const end = () => onNext()

    audio.addEventListener("timeupdate", update)
    audio.addEventListener("ended", end)

    return () => {
      audio.removeEventListener("timeupdate", update)
      audio.removeEventListener("ended", end)
    }
  }, [onNext])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.load()

    const run = async () => {
      await new Promise(r =>
        audio.addEventListener("loadedmetadata", r, { once: true })
      )

      audio.currentTime = startTime
      audio.playbackRate = speed

      if (autoPlay) {
        await audio.play()
        setPlaying(true)
      }
    }

    run()
  }, [src, autoPlay, startTime])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  const skip = (sec: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime += sec
  }

  const changeSpeed = () => {
    const next = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : 1
    setSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = barRef.current
    if (!audio || !bar) return

    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    audio.currentTime = (x / rect.width) * audio.duration
  }

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#111", padding: 12 }}>

      <div style={{ fontSize: 14 }}>{title}</div>

      <div
        ref={barRef}
        onClick={seek}
        style={{ height: 8, background: "#333", borderRadius: 4, margin: "10px 0" }}
      >
        <div style={{ width: `${progress}%`, height: "100%", background: "#7c3aed" }} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => skip(-15)}>⏪ 15</button>
        <button onClick={toggle}>{playing ? "Pause" : "Play"}</button>
        <button onClick={() => skip(15)}>15 ⏩</button>
        <button onClick={changeSpeed}>{speed}x</button>
        <button onClick={onNext}>Next</button>
      </div>

      <audio ref={audioRef} src={src} />
    </div>
  )
}