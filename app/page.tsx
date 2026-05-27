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
  const [category, setCategory] = useState("all")
  const [current, setCurrent] = useState<Podcast | null>(null)

  const podcasts: Podcast[] = podcastsData as Podcast[]

  const filtered = useMemo(() => {
    let list = [...podcasts]

    if (category !== "all") {
      list = list.filter(p => p.category === category)
    }

    // més nous a més antics
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [category])

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(podcasts.map(p => p.category)))]
  }, [])

  useEffect(() => {
    if (!current && filtered.length > 0) {
      setCurrent(filtered[0])
    }
  }, [filtered])

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b1a", color: "white", padding: 20 }}>
      
      {/* HEADER */}
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>
        Això és Vila!
      </h1>

      {/* FILTRES */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: "6px 12px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              background: category === cat ? "#7c3aed" : "#222",
              color: "white"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TARGETES */}
      <div style={{ display: "grid", gap: 12 }}>
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => setCurrent(p)}
            style={{
              padding: 12,
              borderRadius: 12,
              background: "linear-gradient(135deg,#1f1b3a,#2b1b4a)",
              cursor: "pointer"
            }}
          >
            <div style={{ fontWeight: "bold" }}>{p.title}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {p.category} · {p.date}
            </div>
          </div>
        ))}
      </div>

      {/* PLAYER FIX */}
      {current && (
        <Player
          key={current.id}
          src={current.audio}
          title={current.title}
        />
      )}
    </div>
  )
}