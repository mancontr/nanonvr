import { useMemo } from "react";
import { PlayPoint, Track } from "src/types";
import { trackAddDates } from "src/util/dates";
import { useCameraTracks } from "./api";

export const useTrackFromPlayPoint = (playPoint: PlayPoint): Track => {
  const camTracks = useCameraTracks(playPoint?.camId)
  const track = useMemo(() => {
    return playPoint && camTracks
      .map(trackAddDates)
      .find(t => t.start <= playPoint.ts && t.start + t.length >= playPoint.ts)
  }, [camTracks])
  return track
}
