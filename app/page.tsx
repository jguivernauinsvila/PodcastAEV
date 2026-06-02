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

const STORAGE_ID = "podcast_last_id"
const STORAGE_TIME = "podcast_last_time"

export default function Page() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [category, setCategory] = useState("Tot")
  const [current, setCurrent] = useState<Podcast | null>(null)
  const [autoPlay, setAutoPlay] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // 🔁 carregar podcasts + restaurar estat
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()

        if (!Array.isArray(data)) {
          setPodcasts([])
          return
        }

        setPodcasts(data)

        // 🧠 RESTAURACIÓ MEMÒRIA
        const savedId = localStorage.getItem(STORAGE_ID)
        const savedTime = localStorage.getItem(STORAGE_TIME)

        const last = savedId
          ? data.find(p => p.id === Number(savedId))
          : null

        if (last) {
          setCurrent(last)
          setStartTime(savedTime ? Number(savedTime) : 0)
        } else {
          setCurrent(data[0] || null)
          setStartTime(0)
        }

        setAutoPlay(false)
      } catch (err) {
        console.error(err)
        setPodcasts([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const normalizeCategory = (cat: string) => {
    if (!cat) return "Sense categoria"
    if (cat.toLowerCase() === "all") return "Tot"
    if (cat === "Interessants") return "Parlem-ne"
    return cat
  }

  const filtered = useMemo(() => {
    let list = [...podcasts]

    if (category !== "Tot") {
      list = list.filter(
        p => normalizeCategory(p.category) === category
      )
    }

    return list.sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [category, podcasts])

  const categories = useMemo(() => {
    const base = Array.from(
      new Set(podcasts.map(p => normalizeCategory(p.category)))
    )
    return ["Tot", ...base]
  }, [podcasts])

  const getNext = (id: number) => {
    const index = filtered.findIndex(p => p.id === id)
    if (index === -1) return filtered[0]
    if (index < filtered.length - 1) return filtered[index + 1]
    return filtered[0]
  }

  const handleSelect = (p: Podcast) => {
    setCurrent(p)
    setAutoPlay(true)
    setStartTime(0)

    localStorage.setItem(STORAGE_ID, String(p.id))
    localStorage.setItem(STORAGE_TIME, "0")
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Carregant podcasts...</div>
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b1a", color: "white" }}>
      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, background: "#0b0b1a", padding: 20, borderBottom: "1px solid #222" }}>
        <h1>Això és Vila!</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: "none",
                background: category === cat ? "#7c3aed" : "#222",
                color: "white"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div style={{ padding: 20, paddingBottom: 120 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map(p => (
            <div
              key={p.id}
              onClick={() => handleSelect(p)}
              style={{
                padding: 12,
                borderRadius: 12,
                background: "linear-gradient(135deg,#1f1b3a,#2b1b4a)",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: "bold" }}>{p.title}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {normalizeCategory(p.category)} · {new Date(p.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PLAYER */}
      {current && (
        <Player
          key={current.id}
          src={current.audio}
          title={current.title}
          autoPlay={autoPlay}
          startTime={startTime}
          onNext={() => {
            const next = getNext(current.id)
            handleSelect(next)
          }}
        />
      )}
    </div>
  )
}