# MicroPodcasts

A mobile-first Next.js 14 app using the App Router and Tailwind CSS. It renders a feed of short podcast entries from a local JSON file.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Feed data

Podcast entries live in `data/podcasts.json` and use:

```json
{
  "title": "Episode title",
  "date": "2026-05-21",
  "category": "Category",
  "audio_url": "https://example.com/audio.mp3"
}
```
