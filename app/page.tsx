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

const API_URL =
  "https://script.google.com/macros/s/AKfycbwkPmcBtauh47l98xQ66LWUuYheSUUlLLxewHnf1X9NSJ-o2viUIVEtTaPqzeJK5131eg/exec"

export default function Page() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [category, setCategory] = useState("all")
  const [current, setCurrent] = useState<Podcast | null>(null)
  const [favorites, setFavorites] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()

        if (!Array.isArray(data)) {
          setPodcasts([])
          setCurrent(null)
          setLoading(false)
          return
        }

        const cleaned: Podcast[] = data
          .filter(p =>
            p.id &&
            p.title &&
            p.category &&
            p.audio &&
            p.date
          )
          .map(p => ({
            id: Number(p.id),
            title: String(p.title),
            category: String(p.category),
            audio: String(p.audio),
            date: String(p.date)
          }))

        setPodcasts(cleaned)
        setCurrent(cleaned.length > 0 ? cleaned[0] : null)

      } catch (err) {
        console.error(err)
        setPodcasts([])
        setCurrent(null)
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
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
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

  if (loading) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        Carregant podcasts...
      </div>
    )
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
              background:
                category === cat ? "#7c3aed" : "#222",
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
            onClick={() => setCurrent(p)}
            style={{
              padding: 12,
              borderRadius: 12,
              background:
                "linear-gradient(135deg,#1f1b3a,#2b1b4a)",
              cursor: "pointer"
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {p.title}
            </div>

            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {p.category} · {p.date}
            </div>
          </div>
        ))}
      </div>

      {current && (
        <Player
          key={current.id}
          src={current.audio}
          title={current.title}
          autoPlay={true}
          onNext={() =>
            setCurrent(getNext(current.id))
          }
        />
      )}
    </div>
  )
}