"use client"

import { useEffect, useMemo, useState } from "react"
import Player from "../components/Player"

type Podcast = {
  id: number
  title: string
  category: string
  audio: string
  date: string
}

const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSdZFdKel-XUVoxtjkZIKvmebVrleePVT577i1UnYUHU0lNFZZG4yo4lX-YWudlJtDvakZKu28YfQd8/pub?gid=0&single=true&output=csv"

function parseCSV(csv: string): Podcast[] {
  const lines = csv
    .trim()
    .split("\n")
    .filter(Boolean)

  // treu headers
  const dataLines = lines.slice(1)

  return dataLines.map(line => {
    const values = line.split(",")

    return {
      id: Number(values[0]?.trim()),
      title: values[1]?.trim(),
      category: values[2]?.trim(),
      audio: values[3]?.trim(),
      date: values[4]?.trim()
    }
  })
}

export default function Page() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [category, setCategory] = useState("all")
  const [current, setCurrent] = useState<Podcast | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(SHEET_URL)
        const text = await res.text()

        console.log("CSV RAW:", text) // DEBUG IMPORTANT

        const data = parseCSV(text)

        setPodcasts(data)
        setCurrent(data[0] || null)
      } catch (err) {
        console.error("Error loading sheet", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

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
  }, [category, podcasts, favorites])

  const categories = useMemo(() => {
    const base = Array.from(new Set(podcasts.map(p => p.category)))
    return ["all", ...base, "favorits"]
  }, [podcasts])

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

  if (loading) {
    return <div style={{ padding: 20 }}>Carregant podcasts...</div>
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b1a",
        color: "white",
        padding: 20
      }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>
        Això és Vila!
      </h1>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 20
        }}
      >
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
              onClick={e => {
                e.stopPropagation()
                toggleFavorite(p.id)
              }}
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                border: "none",
                background: "transparent",
                fontSize: 16,
                cursor: "pointer"
              }}
            >
              {favorites.includes(p.id) ? "❤️" : ""}
            </button>
          </div>
        ))}
      </div>

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