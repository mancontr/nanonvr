import React from 'react'
import { Track } from 'src/types'
import { baseUrl } from 'src/config'

interface ControlsProps {
  slice: [number, number]
  setSlice: (v: [number, number]) => void
  track: Track
}

const Controls = ({ slice, setSlice, track }: ControlsProps) => {
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
        <div className="button play" />
        <div className="button stop" />
        <a className={'button download' + (url ? '' : ' disabled')} download href={url} />
      </div>
      <div className="control-block">
        <div className="button left" onClick={prev} />
        <div className="button right" onClick={next} />
        <div className="button zoom-in" onClick={zoomIn} />
        <div className="button zoom-out" onClick={zoomOut} />
      </div>
    </div>
  )
}

export default Controls
