import React, { Suspense } from 'react'
import { useCameras } from 'src/hooks/api'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import Loading from '../Loading/Loading'
import CameraRecords from './CameraRecords'
import { useSlice } from './SliceContext'
import './Timeline.sass'
import useTimelineEvents from './useTimelineEvents'

const TimelineLayers = () => {
  const cameras = useCameras()
  const {playPoint, playbackTs} = usePlayPointState()
  const slice = useSlice()
  const events = useTimelineEvents()
  const ts = playbackTs || playPoint?.ts || null
  return (
    <div id="layers">
      <div className="legend">
        {cameras.map(cam =>
          <div className={'layer-entry' + (cam.uuid === playPoint?.camId ? ' active' : '')} key={cam.uuid}>
            {cam.name}
          </div>
        )}
      </div>
      <div className="lines" {...events}>
        {cameras.map(cam =>
          <Suspense key={cam.uuid} fallback={<div className="layer-entry" />}>
            <CameraRecords cam={cam.uuid} active={cam.uuid === playPoint?.camId} />
          </Suspense>
        )}
        {ts &&
          <div className="needle" style={{ left: (ts - slice[0]) * 100 / (slice[1] - slice[0]) + '%' }} />
        }
      </div>
    </div>
  )
}

const TimelineLayersPlaceholder = () =>
  <div id="layers" className="placeholder">
    <div className="legend">
      <Loading />
    </div>
    <div className="lines" />
  </div>

const TimelineLayersWrapper = () =>
  <Suspense fallback={<TimelineLayersPlaceholder />}>
    <TimelineLayers />
  </Suspense>

export default TimelineLayersWrapper
