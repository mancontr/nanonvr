import React, { Suspense } from 'react'
import { useCameras } from 'src/hooks/api'
import { PlayPoint } from 'src/types'
import Loading from '../Loading/Loading'
import CameraRecords from './CameraRecords'
import './Timeline.sass'

interface TimelineLayersProps {
  slice: [number, number]
  currentCamera: string
  setPlayPoint: (playPoint: PlayPoint) => void
}

const TimelineLayers = ({ slice, currentCamera, setPlayPoint }: TimelineLayersProps) => {
  const cameras = useCameras()
  return (
    <div id="layers">
      <div className="legend">
        {cameras.map(cam =>
          <div className={'layer-entry' + (cam.uuid === currentCamera ? ' active' : '')} key={cam.uuid}>
            {cam.name}
          </div>
        )}
      </div>
      <div className="lines">
        {cameras.map(cam =>
          <Suspense key={cam.uuid} fallback={<div className="layer-entry" />}>
            <CameraRecords cam={cam.uuid} slice={slice} active={cam.uuid === currentCamera} setPlayPoint={setPlayPoint} />
          </Suspense>
        )}
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

const TimelineLayersWrapper = (props: TimelineLayersProps) =>
  <Suspense fallback={<TimelineLayersPlaceholder />}>
    <TimelineLayers {...props} />
  </Suspense>

export default TimelineLayersWrapper
