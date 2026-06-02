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
const STORAGE_LISTENED = "podcast_listened"

export default function Page() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [category, setCategory] = useState("Tot")
  const [current, setCurrent] = useState<Podcast | null>(null)
  const [autoPlay, setAutoPlay] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [listened, setListened] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()

        if (!Array.isArray(data)) return

        setPodcasts(data)

        const savedId = localStorage.getItem(STORAGE_ID)
        const savedTime = localStorage.getItem(STORAGE_TIME)
        const savedListened = localStorage.getItem(STORAGE_LISTENED)

        if (savedListened) {
          setListened(JSON.parse(savedListened))
        }

        const last = savedId
          ? data.find(p => p.id === Number(savedId))
          : null

        setCurrent(last || data[0])
        setStartTime(savedTime ? Number(savedTime) : 0)
        setAutoPlay(false)
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

  const markListened = (id: number) => {
    const updated = Array.from(new Set([...listened, id]))
    setListened(updated)
    localStorage.setItem(STORAGE_LISTENED, JSON.stringify(updated))
  }

  const selectEpisode = (p: Podcast, play = true) => {
    setCurrent(p)
    setAutoPlay(play)
    setStartTime(0)

    localStorage.setItem(STORAGE_ID, String(p.id))
    localStorage.setItem(STORAGE_TIME, "0")
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Carregant...</div>
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b1a", color: "white" }}>
      <div style={{ padding: 20, borderBottom: "1px solid #222" }}>
        <h1 style={{ margin: 0 }}>Això és Vila!</h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          {["Tot", ...new Set(podcasts.map(p => normalizeCategory(p.category)))].map(cat => (
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

      <div style={{ padding: 20, paddingBottom: 120 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {filtered.map(p => (
            <div
              key={p.id}
              style={{
                padding: 12,
                borderRadius: 12,
                background: "#1f1b3a",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div onClick={() => selectEpisode(p, true)}>
                <div style={{ fontWeight: "bold" }}>
                  {listened.includes(p.id) ? "✓ " : ""}{p.title}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {normalizeCategory(p.category)}
                </div>
              </div>

              <button
                onClick={() => selectEpisode(p, true)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "#7c3aed",
                  color: "white"
                }}
              >
                Play
              </button>
            </div>
          ))}
        </div>
      </div>

      {current && (
        <Player
          key={current.id}
          src={current.audio}
          title={current.title}
          autoPlay={autoPlay}
          startTime={startTime}
          onNext={() => {
            const next = getNext(current.id)
            selectEpisode(next, true)
            markListened(current.id)
          }}
        />
      )}
    </div>
  )
}