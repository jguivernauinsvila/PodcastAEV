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

  // 🎧 setup audio + restore time
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const update = () => {
      const pct = (audio.currentTime / audio.duration) * 100 || 0
      setProgress(pct)

      // 💾 guardar posició constantment
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

  // ⏱️ restore position + autoplay control
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.load()

    const playAudio = async () => {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    }

    const handle = async () => {
      // esperar metadata per poder seek
      await new Promise(resolve => {
        const onMeta = () => {
          audio.removeEventListener("loadedmetadata", onMeta)
          resolve(true)
        }
        audio.addEventListener("loadedmetadata", onMeta)
      })

      audio.currentTime = startTime || 0

      if (autoPlay) {
        playAudio()
      }
    }

    handle()
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
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#7c3aed"
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={toggle}>
          {playing ? "Pause" : "Play"}
        </button>

        <button onClick={onNext}>Next</button>
      </div>

      <audio ref={audioRef} src={src} />
    </div>
  )
}