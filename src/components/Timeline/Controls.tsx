import React from 'react'
import basename from 'src/util/basename'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import { Track } from 'src/types'
import { useSliceState } from './SliceContext'

const Controls = () => {
  const [playPoint, setPlayPoint] = usePlayPointState()
  const [slice, setSlice] = useSliceState()
  const track: Track = useTrackFromPlayPoint(playPoint)
  const size = slice[1] - slice[0]
  const zoomIn = () => setSlice([slice[0] + size / 4, slice[1] - size / 4])
  const zoomOut = () => setSlice([slice[0] - size / 2, slice[1] + size / 2])
  const stop = () => setPlayPoint(null)
  const url = track && `${basename}/media/${track.uuid}/${track.filename}`

  return (
    <div id="controls">
      <div className="control-block" />
      <div className="control-block">
        <div className="button icon-play disabled" />
        <div className={'button icon-stop' + (playPoint ? '' : ' disabled')} onClick={stop} />
        <a className={'button icon-download' + (url ? '' : ' disabled')} download href={url} />
      </div>
      <div className="control-block">
        <div className="button icon-zoom-in" onClick={zoomIn} />
        <div className="button icon-zoom-out" onClick={zoomOut} />
      </div>
    </div>
  )
}

export default Controls
