import React from 'react'
import { useBasePath } from 'src/hooks/config'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { PlayPoint, Track } from 'src/types'

interface ControlsProps {
  slice: [number, number]
  setSlice: (v: [number, number]) => void
  playPoint: PlayPoint
}

const Controls = ({ slice, setSlice, playPoint }: ControlsProps) => {
  const track: Track = useTrackFromPlayPoint(playPoint)
  const baseUrl = useBasePath()
  const size = slice[1] - slice[0]
  const next = () => setSlice([slice[0] + size / 2, slice[1] + size / 2])
  const prev = () => setSlice([slice[0] - size / 2, slice[1] - size / 2])
  const zoomIn = () => setSlice([slice[0] + size / 4, slice[1] - size / 4])
  const zoomOut = () => setSlice([slice[0] - size / 2, slice[1] + size / 2])
  const url = track && `${baseUrl}/media/${track.uuid}/${track.filename}`

  return (
    <div id="controls">
      <div className="control-block" />
      <div className="control-block">
        <div className="button icon-play" />
        <div className="button icon-stop" />
        <a className={'button icon-download' + (url ? '' : ' disabled')} download href={url} />
      </div>
      <div className="control-block">
        <div className="button icon-rewind" onClick={prev} />
        <div className="button icon-ff" onClick={next} />
        <div className="button icon-zoom-in" onClick={zoomIn} />
        <div className="button icon-zoom-out" onClick={zoomOut} />
      </div>
    </div>
  )
}

export default Controls
