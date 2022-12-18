import React, { useState } from 'react'
import { getDayPeriod } from 'src/util/dates'
import TimelineLayers from './TimelineLayers'
import TimelineScale from './TimelineScale'
import Controls from './Controls'
import './Timeline.sass'

const Timeline = () => {
  const [slice, setSlice] = useState<[number, number]>(getDayPeriod)

  return (
    <div id="timeline">
      <Controls slice={slice} setSlice={setSlice} />
      <TimelineScale slice={slice} />
      <TimelineLayers slice={slice} />
    </div>
  )
}

export default Timeline
