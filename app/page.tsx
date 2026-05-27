"use client"

import { useMemo, useState, useEffect } from "react"
import Player from "../components/Player"
import podcasts from "../data/podcasts.json"

type Podcast = {
  id: number
  title: string
  category: string
  audio: string
  date: string
}

export default function Home() {
  const data = podcasts as Podcast[]

  // 🌍 global per autoplay
  ;(window as any).allPodcasts = data

  // ❤️ FAVORITS (persistents)
  const [favorites, setFavorites] = useState<number[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("favorites")
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  function toggleFavorite(id: number) {
    let updated: number[]

    if (favorites.includes(id)) {
      updated = favorites.filter(f => f !== id)
    } else {
      updated = [...favorites, id]
    }

    setFavorites(updated)
    localStorage.setItem("favorites", JSON.stringify(updated))
  }

  // 🧭 categories
  const categories = useMemo(() => {
    const unique = Array.from(new Set(data.map(p => p.category)))
    return ["Totes", "❤️ Favorits", ...unique]
  }, [data])

  const [filter, setFilter] = useState("Totes")

  // 📅 filtrat + ordenació
  const filtered = useMemo(() => {
    let list = [...data]

    list.sort((a, b) => (b.date > a.date ? 1 : -1))

    if (filter === "❤️ Favorits") {
      list = list.filter(p => favorites.includes(p.id))
    } else if (filter !== "Totes") {
      list = list.filter(p => p.category === filter)
    }

    return list
  }, [data, filter, favorites])

  return (
    <>
      <main
        style={{
          padding: 16,
          maxWidth: 900,
          margin: "0 auto",
          fontFamily: "Arial",
          background: "#0f172a",
          minHeight: "100vh",
          color: "white",
          paddingBottom: 140
        }}
      >
        {/* HEADER */}
        <h1 style={{ fontSize: 26, marginBottom: 12 }}>
          Això és Vila!
        </h1>

        {/* FILTRES */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: "6px 10px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                background: filter === cat ? "#a855f7" : "#1e1b2e",
                color: "white",
                fontSize: 12
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CARDS PETITES */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12
          }}
        >
          {filtered.map(p => (
            <div
              key={p.id}
              style={{
                padding: 12,
                borderRadius: 14,
                background: "#1e1b2e",
                cursor: "pointer",
                position: "relative"
              }}
            >
              {/* ❤️ FAVORIT */}
              <div
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(p.id)
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  fontSize: 16
                }}
              >
                {favorites.includes(p.id) ? "❤️" : "🤍"}
              </div>

              <div
                onClick={() => (window as any).playPodcast?.(p)}
              >
                <h4 style={{ margin: "0 0 6px 0" }}>{p.title}</h4>

                <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
                  {p.category}
                </p>

                <p style={{ margin: "4px 0 0 0", fontSize: 11, opacity: 0.5 }}>
                  {p.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Player />
    </>
  )
}