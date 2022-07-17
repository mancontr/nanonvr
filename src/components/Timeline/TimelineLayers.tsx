import React, { Suspense } from 'react'
import { useCameras } from 'src/hooks/api'
import { Track } from 'src/types'
import CameraRecords from './CameraRecords'
import './Timeline.sass'

interface TimelineLayersProps {
  slice: [number, number]
  setTrack: (track: Track) => void
}

const TimelineLayers = ({ slice, setTrack }: TimelineLayersProps) => {
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
            <CameraRecords cam={cam.uuid} slice={slice} setTrack={setTrack} />
          </Suspense>
        )}
      </div>
    </div>
  )
}

export default TimelineLayers
