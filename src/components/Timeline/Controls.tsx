import React, { useState } from 'react'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import { useSliceState } from './SliceContext'
import DownloadModal from './DownloadModal'

const Controls = () => {
  const {playPoint, setPlayPoint, playbackTs} = usePlayPointState()
  const [slice, setSlice] = useSliceState()
  const [downloadOpen, setDownloadOpen] = useState(false)
  const size = slice[1] - slice[0]
  const zoomIn = () => setSlice([slice[0] + size / 4, slice[1] - size / 4])
  const zoomOut = () => setSlice([slice[0] - size / 2, slice[1] + size / 2])
  const stop = () => setPlayPoint(null)
  const canDownload = !!playPoint?.camId

  return (
    <div id="controls">
      <div className="control-block" />
      <div className="control-block">
        <div className="button icon-play disabled" />
        <div className={'button icon-stop' + (playPoint ? '' : ' disabled')} onClick={stop} />
        <div
          className={'button icon-download' + (canDownload ? '' : ' disabled')}
          onClick={() => canDownload && setDownloadOpen(true)}
        />
      </div>
      <div className="control-block">
        <div className="button icon-zoom-in" onClick={zoomIn} />
        <div className="button icon-zoom-out" onClick={zoomOut} />
      </div>
      {downloadOpen &&
        <DownloadModal
          camId={playPoint.camId}
          anchorTs={playbackTs || playPoint.ts || Date.now()}
          onClose={() => setDownloadOpen(false)}
        />
      }
    </div>
  )
}

export default Controls
