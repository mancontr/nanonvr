import React, { Suspense, useState } from 'react'
import TimelineLayers from './TimelineLayers'
import './Timeline.sass'

const Timeline = () => {
  const [startTime] = useState(1653343200000)
  const [endTime] = useState(1653429600000)

  return (
    <div id="timeline">
      <div id="controls">
        <div className="button play" />
        <div className="button stop" />
      </div>
      <div id="scale">
        <div className="legend" />
        <div className="lines" />
      </div>
      <Suspense fallback={false}>
        <TimelineLayers startTime={startTime} endTime={endTime} />
      </Suspense>
    </div>
  )
}

export default Timeline
