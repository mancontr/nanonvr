import React, { useState } from 'react'
import { getDayPeriod } from 'src/util/dates'
import TimelineLayers from './TimelineLayers'
import TimelineScale from './TimelineScale'
import Controls from './Controls'
import './Timeline.sass'
import { PlayPoint } from 'src/types'

interface TimelineProps {
  playPoint: PlayPoint
  setPlayPoint: (playPoint: PlayPoint) => void
}

const Timeline = ({ playPoint, setPlayPoint }: TimelineProps) => {
  const [slice, setSlice] = useState<[number, number]>(getDayPeriod)

  return (
    <div id="timeline">
      <Controls slice={slice} setSlice={setSlice} playPoint={playPoint} />
      <TimelineScale slice={slice} playPoint={playPoint} />
      <TimelineLayers slice={slice} playPoint={playPoint} setPlayPoint={setPlayPoint} />
    </div>
  )
}

export default Timeline
