import React from 'react'
import { useCameraTracks } from 'src/hooks/api'
import { trackGroupAddDates } from 'src/util/dates'
import { useSlice } from './SliceContext'

interface CameraRecordsProps {
  cam: string
  active: boolean
}

const CameraRecords = ({ cam, active }: CameraRecordsProps) => {
  const slice = useSlice()
  const tracks = useCameraTracks(cam)
  const tracksWithDates = tracks.map(trackGroupAddDates).reverse()
  const shown = tracksWithDates.filter(t => t.end > slice[0] && t.start < slice[1])
  const totalTime = slice[1] - slice[0]
  return (
    <div className={'layer-entry' + (active ? ' active' : '')} data-cam={cam}>
      {shown.map(block => {
        const style = {
          left: (block.start - slice[0]) * 100 / totalTime + '%',
          width: (block.end - block.start) * 100 / totalTime + '%'
        }
        return <div
          className="video-block"
          key={block.start}
          style={style}
        />
      })}
    </div>
  )
}

export default CameraRecords
