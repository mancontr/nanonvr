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

function filename2date(filename: string): number {
  const str = filename.substring(0, 10) + 'T' + filename.substring(11, 19).replace(/-/g, ':') + 'Z'
  return new Date(str).valueOf()
}

function date2filename(date: number): string {
  const str = new Date(date).toISOString()
  return str.substring(0, 10) + ' ' + str.substring(11, 19).replace(/:/g, '-')
}

export default compactTracks
