import { TrackGroup } from 'src/types'

export const filename2localDate = (filename) => new Date(
  parseInt(filename.substring(0, 4)),
  parseInt(filename.substring(5, 7)) - 1,
  parseInt(filename.substring(8, 10)),
  parseInt(filename.substring(11, 13)),
  parseInt(filename.substring(14, 16)),
  parseInt(filename.substring(17, 19)),
).getTime()

export const trackGroupAddDates = (track: TrackGroup) => {
  const start = filename2localDate(track.start)
  const end = filename2localDate(track.end)
  const tracks = track.tracks.map(str => ({
    filename: str,
    start: filename2localDate(str),
  }))
  return { start, end, tracks }
}

/**
 * Returns time period boundaries between two dates (both included in the period)
 * @param start The left boundary of the period
 * @param end The right boundary of the period
 * @param size The size of each block (eg: 3600000 for hourly)
 * @returns A list of day boundaries
 */
 export const getTimeMarksBetweenDates = (slice: [number, number], size: number): number[] => {
  if (size === 0) return []
  const boundaries = []
  let startOfDay = new Date(slice[0])
  startOfDay = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), startOfDay.getDate())
  let t = startOfDay.getTime()
  while (t <= slice[1]) {
    if (t >= slice[0]) {
      boundaries.push(t)
    }
    t += size
  }
  return boundaries
}

/**
 * Returns the timestamp of the start and end of the day on which around date falls
 * @param around A timestamp to use as reference (default: now)
 * @returns Timestamps for the beginning and end of the day
 */
export const getDayPeriod = (around?: Date): [number, number] => {
  const now = around || new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return [start.getTime(), end.getTime()]
}
