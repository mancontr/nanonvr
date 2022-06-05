import { Track } from 'src/types'

export const trackAddDates = (track: Track) => {
  const start = new Date(
    parseInt(track.filename.substring(0, 4)),
    parseInt(track.filename.substring(5, 7)) - 1,
    parseInt(track.filename.substring(8, 10)),
    parseInt(track.filename.substring(11, 13)),
    parseInt(track.filename.substring(14, 16)),
    parseInt(track.filename.substring(17, 19)),
  ).getTime()
  const end = start + track.length
  return { ...track, start, end }
}
