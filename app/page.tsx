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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL)
        const data = await res.json()

        if (!Array.isArray(data)) {
          setPodcasts([])
          setCurrent(null)
          return
        }

        setPodcasts(data)
        setCurrent(data.length > 0 ? data[0] : null)
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

  const filtered = useMemo(() => {
    let list = [...podcasts]

    if (category !== "all") {
      list = list.filter(p => p.category === category)
    }

    return list.sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
  }, [category, podcasts])

  const categories = useMemo(() => {
    const base = Array.from(new Set(podcasts.map(p => p.category)))
    return ["all", ...base]
  }, [podcasts])

  const getNext = (id: number) => {
    const index = filtered.findIndex(p => p.id === id)
    if (index === -1) return filtered[0]
    if (index < filtered.length - 1) return filtered[index + 1]
    return filtered[0]
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Carregant podcasts...</div>
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b1a",
        color: "white"
      }}
    >
      {/* HEADER FIXE */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#0b0b1a",
          padding: 20,
          borderBottom: "1px solid #222"
        }}
      >
        {/* LOGO + TÍTOL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 15
          }}
        >
          <img
            src="/logo.png"
            alt="logo"
            style={{ height: 45 }}
          />

          <h1 style={{ fontSize: 26, margin: 0 }}>
            Això és Vila!
          </h1>
        </div>

        {/* CATEGORIES */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap"
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
      </div>

      {/* CONTINGUT */}
      <div style={{ padding: 20, paddingBottom: 120 }}>
        <div style={{ display: "grid", gap: 12 }}>
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
                {p.category} ·{" "}
                {new Date(p.date).toLocaleDateString()}
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
          autoPlay={true}
          onNext={() =>
            setCurrent(getNext(current.id))
          }
        />
      )}
    </div>
  )
}