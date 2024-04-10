import { useMemo } from "react";
import { PlayPoint } from "src/types";
import { trackGroupAddDates } from "src/util/dates";
import { useCameraTracks } from "./api";

interface TrackMeta {
  track: string
  start: number
  nextTrack: string
  nextStart: number
}

export const useTrackFromPlayPoint = (playPoint: PlayPoint): TrackMeta => {
  const camTracks = useCameraTracks(playPoint?.camId)
  const tracksWithDates = useMemo(() => camTracks?.map(trackGroupAddDates) || [], [camTracks])
  const ts = playPoint?.ts
  if (!ts) return null
  const group = tracksWithDates.find(t => t.start <= ts && t.end >= ts)
  const filteredGroup = group.tracks.filter(t => t.start <= ts)
  const track = filteredGroup.pop()
  const nextTrack = group.tracks[group.tracks.indexOf(track) + 1]
  return {
    track: track?.filename,
    start: track?.start,
    nextTrack: nextTrack?.filename,
    nextStart: nextTrack?.start,
  }
}
