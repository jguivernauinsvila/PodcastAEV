"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  src: string
  title: string
}

export default function Player({ src, title }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const update = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }

    audio.addEventListener("timeupdate", update)

    return () => {
      audio.removeEventListener("timeupdate", update)
    }
  }, [])

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
        style={{
          height: 6,
          background: "#333",
          borderRadius: 4,
          marginBottom: 10
        }}
      >
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: "#7c3aed"
        }} />
      </div>

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

      <audio ref={audioRef} src={src} />
    </div>
  )
}