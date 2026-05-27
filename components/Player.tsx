"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  src: string
  title: string
  onNext: () => void
}

export default function Player({ src, title, onNext }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)

  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const update = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }

    const handleEnd = () => {
      onNext()
    }

    audio.addEventListener("timeupdate", update)
    audio.addEventListener("ended", handleEnd)

    return () => {
      audio.removeEventListener("timeupdate", update)
      audio.removeEventListener("ended", handleEnd)
    }
  }, [onNext])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }

    setPlaying(!playing)
  }

  // ⏩ SEEK (clic a la barra)
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = barRef.current
    if (!audio || !bar) return

    const rect = bar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const width = rect.width

    const percent = clickX / width
    audio.currentTime = percent * audio.duration
  }

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#111",
      padding: 12,
      borderTop: "1px solid #333"
    }}>

      <div style={{ fontSize: 14, marginBottom: 6 }}>
        {title}
      </div>

      {/* PROGRESS BAR CLICKABLE */}
      <div
        ref={barRef}
        onClick={handleSeek}
        style={{
          height: 8,
          background: "#333",
          borderRadius: 4,
          marginBottom: 10,
          cursor: "pointer",
          position: "relative"
        }}
      >
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "#7c3aed",
          borderRadius: 4
        }} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={toggle}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "#7c3aed",
            color: "white"
          }}
        >
          {playing ? "Pause" : "Play"}
        </button>

        <button
          onClick={onNext}
          style={{
            padding: "6px 12px",
            borderRadius: 8,
            border: "none",
            background: "#333",
            color: "white"
          }}
        >
          Next ▶
        </button>
      </div>

      <audio ref={audioRef} src={src} />
    </div>
  )
}