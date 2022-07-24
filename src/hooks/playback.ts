import { useMemo } from "react";
import { PlayPoint, Track } from "src/types";
import { trackAddDates } from "src/util/dates";
import { useCameraTracks } from "./api";

export const useTrackFromPlayPoint = (playPoint: PlayPoint): Track => {
  const camTracks = useCameraTracks(playPoint?.camId)
  const tracksWithDates = useMemo(() => camTracks?.map(trackAddDates) || [], [camTracks])
  const ts = playPoint?.ts
  const track = ts && tracksWithDates
    .find(t => t.start <= ts && t.start + t.length >= ts)
  return track
}
