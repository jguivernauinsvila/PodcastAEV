"use client"

import { useEffect, useRef, useState } from "react"

type Track = {
  title: string
  audio: string
}

export default function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [track, setTrack] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("lastPodcast")

    if (saved) {
      const t = JSON.parse(saved)
      setTrack(t)

      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.src = t.audio
        }
      }, 50)
    }

    ;(window as any).playPodcast = (t: Track) => {
      setTrack(t)
      localStorage.setItem("lastPodcast", JSON.stringify(t))

      if (audioRef.current) {
        audioRef.current.src = t.audio
        audioRef.current.play()
        setPlaying(true)
      }
    }
  }, [])

  function togglePlay() {
    if (!audioRef.current) return

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  // 📊 PROGRÉS
  function handleTimeUpdate() {
    if (!audioRef.current) return

    const current = audioRef.current.currentTime
    const duration = audioRef.current.duration

    if (duration) {
      setProgress((current / duration) * 100)
    }
  }

  if (!track) return null

  return (
    <>
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} />

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#1a1025",
          color: "white",
          padding: 12,
          zIndex: 50
        }}
      >
        {/* barra progrés */}
        <div
          style={{
            height: 4,
            background: "#2e1a3a",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 8
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#a855f7"
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <strong>{track.title}</strong>
          </div>

          <button
            onClick={togglePlay}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "#a855f7",
              color: "white"
            }}
          >
            {playing ? "⏸" : "▶"}
          </button>
        </div>
      </div>
    </>
  )
}