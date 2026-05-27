"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  src: string
  title: string
  onNext: () => void
  autoPlay?: boolean
}

export default function Player({ src, title, onNext, autoPlay }: Props) {
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

    const end = () => {
      onNext()
    }

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

    if (autoPlay) {
      audio.play()
      setPlaying(true)
    } else {
      setPlaying(false)
    }
  }, [src])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return

    if (playing) audio.pause()
    else audio.play()

    setPlaying(!playing)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = barRef.current
    if (!audio || !bar) return

    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percent = x / rect.width

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

      <div
        ref={barRef}
        onClick={seek}
        style={{
          height: 8,
          background: "#333",
          borderRadius: 4,
          marginBottom: 10,
          cursor: "pointer"
        }}
      >
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "#7c3aed"
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
          Next
        </button>
      </div>

      <audio ref={audioRef} src={src} />
    </div>
  )
}