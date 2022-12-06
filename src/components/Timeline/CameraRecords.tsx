import React from 'react'
import { useCameraTracks } from 'src/hooks/api'
import { PlayPoint } from 'src/types'
import { trackAddDates } from 'src/util/dates'

interface CameraRecordsProps {
  cam: string
  slice: [number, number]
  active: boolean
  setPlayPoint: (playPoint: PlayPoint) => void
}

const CameraRecords = ({ cam, slice, active, setPlayPoint }: CameraRecordsProps) => {
  const tracks = useCameraTracks(cam)
  const tracksWithDates = tracks.map(trackAddDates).reverse()
  const shown = tracksWithDates.filter(t => t.end > slice[0] && t.start < slice[1])
  const totalTime = slice[1] - slice[0]
  return (
    <div className={'layer-entry' + (active ? ' active' : '')}>
      {shown.map(block => {
        const style = {
          left: (block.start - slice[0]) * 100 / totalTime + '%',
          width: (block.length * 1000) * 100 / totalTime + '%'
        }
        return <div
          className="video-block"
          onClick={() => setPlayPoint({ camId: block.uuid, ts: block.start })}
          key={block.filename}
          style={style}
        />
      })}
    </div>
  )
}

export default CameraRecords
