import React, { Suspense } from 'react'
import { useCameras } from 'src/hooks/api'
import CameraRecords from './CameraRecords'
import './Timeline.sass'

interface TimelineLayersProps {
  startTime: number
  endTime: number
}

const TimelineLayers = ({ startTime, endTime }: TimelineLayersProps) => {
  const cameras = useCameras()
  return (
    <div id="layers">
      <div className="legend">
        {cameras.map(cam =>
          <div className="layer-entry" key={cam.uuid}>
            {cam.name}
          </div>
        )}
      </div>
      <div className="lines">
        {cameras.map(cam =>
          <Suspense key={cam.uuid} fallback={<div className="layer-entry" />}>
            <CameraRecords cam={cam.uuid} startTime={startTime} endTime={endTime} />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default TimelineLayers
