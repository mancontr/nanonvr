import React from 'react'
import TimelineLayers from './TimelineLayers'
import TimelineScale from './TimelineScale'
import Controls from './Controls'
import './Timeline.sass'
import { SliceProvider } from './SliceContext'

const Timeline = () => {
  return (
    <div id="timeline">
      <Controls />
      <TimelineScale />
      <TimelineLayers />
    </div>
  )
}

const TimelineWrapper = () =>
  <SliceProvider>
    <Timeline />
  </SliceProvider>


export default TimelineWrapper
