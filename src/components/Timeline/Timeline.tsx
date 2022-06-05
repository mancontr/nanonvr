import React, { Suspense, useState } from 'react'
import TimelineLayers from './TimelineLayers'
import './Timeline.sass'
import TimelineScale from './TimelineScale'

const Timeline = () => {
  const [slice] = useState<[number, number]>([1653343200000, 1653429600000])

  return (
    <div id="timeline">
      <div id="controls">
        <div className="button play" />
        <div className="button stop" />
      </div>
      <TimelineScale slice={slice} />
      <Suspense fallback={false}>
        <TimelineLayers slice={slice} />
      </Suspense>
    </div>
  )
}

export default Timeline
