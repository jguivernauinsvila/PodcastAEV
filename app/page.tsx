"use client"

import { useEffect, useMemo, useState } from "react"
import Player from "../components/Player"
import podcastsData from "../data/podcasts.json"

type Podcast = {
  id: number
  title: string
  category: string
  audio: string
  date: string
}

export default function Page() {
  const podcasts: Podcast[] = podcastsData as Podcast[]

  const [category, setCategory] = useState("all")
  const [current, setCurrent] = useState<Podcast | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])

  // LOAD FAVORITES
  useEffect(() => {
    const saved = localStorage.getItem("favorites")
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  // SAVE FAVORITES
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const filtered = useMemo(() => {
    let list = [...podcasts]

    if (category !== "all") {
      list = list.filter(p => p.category === category)
    }

    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [category])

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(podcasts.map(p => p.category)))]
  }, [])

  useEffect(() => {
    if (!current && filtered.length > 0) {
      setCurrent(filtered[0])
    }
  }, [filtered])

  const getNext = (id: number) => {
    const index = filtered.findIndex(p => p.id === id)
    if (index === -1) return filtered[0]
    if (index < filtered.length - 1) return filtered[index + 1]
    return filtered[0]
  }

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0b0b1a",
      color: "white",
      padding: 20
    }}>

      <h1 style={{ fontSize: 28, marginBottom: 10 }}>
        Això és Vila!
      </h1>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: "none",
              background: category === cat ? "#7c3aed" : "#222",
              color: "white",
              cursor: "pointer"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div style={{ display: "grid", gap: 12, marginBottom: 120 }}>
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => setCurrent(p)}
            style={{
              padding: 12,
              borderRadius: 12,
              background: "linear-gradient(135deg,#1f1b3a,#2b1b4a)",
              cursor: "pointer",
              position: "relative"
            }}
          >

            <div style={{ fontWeight: "bold" }}>{p.title}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {p.category} · {p.date}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(p.id)
              }}
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                border: "none",
                background: "transparent",
                fontSize: 18,
                cursor: "pointer"
              }}
            >
              {favorites.includes(p.id) ? "❤️" : "🤍"}
            </button>

          </div>
        ))}
      </div>

      {/* PLAYER */}
      {current && (
        <Player
          key={current.id}
          src={current.audio}
          title={current.title}
          onNext={() => setCurrent(getNext(current.id))}
        />
      )}
    </div>
  )
}
🧩 2. components/Player.tsx (SUBSTITUEIX TOT)
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
          Next ▶
        </button>
      </div>

      <audio ref={audioRef} src={src} />
    </div>
  )
}