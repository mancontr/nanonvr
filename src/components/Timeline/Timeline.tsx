import React, { Suspense, useState } from 'react'
import TimelineLayers from './TimelineLayers'
import './Timeline.sass'
import TimelineScale from './TimelineScale'

const Timeline = () => {
  const [startTime] = useState(1653343200000)
  const [endTime] = useState(1653429600000)

  return (
    <div id="timeline">
      <div id="controls">
        <div className="button play" />
        <div className="button stop" />
      </div>
      <TimelineScale startTime={startTime} endTime={endTime} />
      <Suspense fallback={false}>
        <TimelineLayers startTime={startTime} endTime={endTime} />
      </Suspense>
    </div>
  )
}

export default Timeline
