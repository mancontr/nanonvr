import { Track, TrackGroup } from "src/types"

interface InternalTrackGroup {
  start: number
  end: number
  tracks: Track[]
}

function compactTracks(tracks: Track[]): TrackGroup[] {
  // Sort older to newer
  tracks.sort((a, b) => a.filename > b.filename ? 1 : -1)

  const compacted: InternalTrackGroup[] = []
  let current: InternalTrackGroup = null

  for (const track of tracks) {
    const trackStart = filename2date(track.filename)
    const trackEnd = trackStart + track.length * 1000
    if (!current) {
      current = {
        start: trackStart,
        end: trackEnd,
        tracks: [track],
      }
      continue
    }
    if ((trackStart - current.end) > 10000) { // Gaps over 10s break the group
      compacted.push(current)
      current = {
        start: trackStart,
        end: trackEnd,
        tracks: [track]
      }
    } else {
      current.end = trackEnd
      current.tracks.push(track)
    }
  }
  if (current) {
    compacted.push(current)
  }
  return compacted.map(t => ({
    start: date2filename(t.start),
    end: date2filename(t.end),
    tracks: t.tracks.map(track => track.filename)
  }))
}

export function filename2date(filename: string): number {
  return new Date(
    +filename.substring(0, 4),
    +filename.substring(5, 7) - 1,
    +filename.substring(8, 10),
    +filename.substring(11, 13),
    +filename.substring(14, 16),
    +filename.substring(17, 19),
  ).valueOf()
}

export function date2filename(date: number): string {
  const d = new Date(date)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`
}

export default compactTracks
