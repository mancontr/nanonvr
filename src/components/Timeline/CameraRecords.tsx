import React from 'react'
import { useCameraTracks } from 'src/hooks/api'
import { trackAddDates } from 'src/util/tracks'

interface CameraRecordsProps {
  cam: string
  startTime: number
  endTime: number
}

const CameraRecords = ({ cam, startTime, endTime }: CameraRecordsProps) => {
  const tracks = useCameraTracks(cam)
  const tracksWithDates = tracks.map(trackAddDates)
  const shown = tracksWithDates.filter(t => t.end > startTime && t.start < endTime)
  const totalTime = endTime - startTime
  return (
    <div className="layer-entry">
      {shown.map(block => {
        const style = {
          left: (block.start - startTime) * 100 / totalTime + '%',
          width: (block.length * 1000) * 100 / totalTime + '%'
        }
        return <div className="video-block" key={block.filename} style={style} />
      })}
    </div>
  )
}

export default CameraRecords
