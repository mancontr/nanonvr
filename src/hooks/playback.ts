import { useMemo } from "react";
import { PlayPoint } from "src/types";
import { trackGroupAddDates } from "src/util/dates";
import { useCameraTracks } from "./api";

export const useTrackFromPlayPoint = (playPoint: PlayPoint): string => {
  const camTracks = useCameraTracks(playPoint?.camId)
  const tracksWithDates = useMemo(() => camTracks?.map(trackGroupAddDates) || [], [camTracks])
  const ts = playPoint?.ts
  const group = ts && tracksWithDates
    .find(t => t.start <= ts && t.end >= ts)
  const track = group?.tracks.filter(t => t.start < ts).pop()
  return track?.filename
}
