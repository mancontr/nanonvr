import React, { useState } from 'react'
import { getDayPeriod } from 'src/util/dates'
import TimelineLayers from './TimelineLayers'
import TimelineScale from './TimelineScale'
import Controls from './Controls'
import './Timeline.sass'
import { Track } from 'src/types'

interface TimelineProps {
  track: Track
  setTrack: (track: Track) => void
}

const Timeline = ({ track, setTrack }: TimelineProps) => {
  const [slice, setSlice] = useState<[number, number]>(getDayPeriod)

  return (
    <div id="timeline">
      <Controls slice={slice} setSlice={setSlice} track={track} />
      <TimelineScale slice={slice} />
      <TimelineLayers slice={slice} setTrack={setTrack} />
    </div>
  )
}

export default Timeline
