import React, { Suspense } from 'react'
import { useCameras } from 'src/hooks/api'
import { usePlayPoint } from 'src/routes/Home/PlayPointContext'
import Loading from '../Loading/Loading'
import CameraRecords from './CameraRecords'
import { useSlice } from './SliceContext'
import './Timeline.sass'
import useTimelineEvents from './useTimelineEvents'

const TimelineLayers = () => {
  const cameras = useCameras()
  const playPoint = usePlayPoint()
  const slice = useSlice()
  const events = useTimelineEvents()
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
        {playPoint &&
          <div className="needle" style={{ left: (playPoint.ts - slice[0]) * 100 / (slice[1] - slice[0]) + '%' }} />
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
