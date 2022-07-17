import React from 'react'
import { useCameraTracks } from 'src/hooks/api'
import { Track } from 'src/types'
import { trackAddDates } from 'src/util/dates'

interface CameraRecordsProps {
  cam: string
  slice: [number, number]
  setTrack: (track: Track) => void
}

const CameraRecords = ({ cam, slice, setTrack }: CameraRecordsProps) => {
  const tracks = useCameraTracks(cam)
  const tracksWithDates = tracks.map(trackAddDates)
  const shown = tracksWithDates.filter(t => t.end > slice[0] && t.start < slice[1])
  const totalTime = slice[1] - slice[0]
  return (
    <div className="layer-entry">
      {shown.map(block => {
        const style = {
          left: (block.start - slice[0]) * 100 / totalTime + '%',
          width: (block.length * 1000) * 100 / totalTime + '%'
        }
        return <div
          className="video-block"
          onClick={() => setTrack(block)}
          key={block.filename}
          style={style}
        />
      })}
    </div>
  )
}

export default CameraRecords
