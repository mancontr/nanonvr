import React, { Suspense, useState } from 'react'
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
      <Suspense fallback={false}>
        <TimelineLayers slice={slice} />
      </Suspense>
    </div>
  )
}

export default Timeline
