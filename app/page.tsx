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

  useEffect(() => {
    const saved = localStorage.getItem("favorites")
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites))
  }, [favorites])

  const filtered = useMemo(() => {
    let list = [...podcasts]

    if (category === "favorits") {
      list = list.filter(p => favorites.includes(p.id))
    } else if (category !== "all") {
      list = list.filter(p => p.category === category)
    }

    return list.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [category, favorites])

  const categories = useMemo(() => {
    const base = Array.from(new Set(podcasts.map(p => p.category)))
    return ["all", ...base, "favorits"]
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

  const handleSelect = (p: Podcast) => {
    setCurrent(p)
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

      {/* CATEGORIES */}
      <div style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 20
      }}>
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

      {/* LISTA */}
      <div style={{ display: "grid", gap: 12, marginBottom: 120 }}>
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => handleSelect(p)}
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
          autoPlay={true}
          onNext={() => setCurrent(getNext(current.id))}
        />
      )}
    </div>
  )
}