import React from 'react'
import { FormattedDate, FormattedTime } from 'react-intl'
import { getTimeMarksBetweenDates } from 'src/util/dates'

interface TimelineScaleProps {
  startTime: number
  endTime: number
}

const TimelineScale = ({ startTime, endTime }: TimelineScaleProps) => {
  const length = endTime - startTime
  const dayLabels = getTimeMarksBetweenDates(startTime, endTime, 86400000)
  const timeLabels = getTimeMarksBetweenDates(startTime, endTime, 2 * 3600000)
  const highBoundaries = getTimeMarksBetweenDates(startTime, endTime, 3600000)
  const lowBoundaries = getTimeMarksBetweenDates(startTime, endTime, 900000)

  return (
    <div id="scale">
      <div className="legend" />
      <div className="lines">
        {dayLabels.map(b => {
          const style = { left: (b - startTime) * 100 / length + '%' }
          return (
            <div key={b} className="scale-entry major" style={style}>
              <FormattedDate value={b} year="numeric" month="2-digit" day="2-digit" />
            </div>
          )
        })}
        {timeLabels.map(b => {
          const style = { left: (b - startTime) * 100 / length + '%' }
          return (
            <div key={b} className="scale-entry minor" style={style}>
              <FormattedTime value={b} hour="2-digit" minute="2-digit" hour12={false} />
            </div>
          )
        })}
        {highBoundaries.map(b => {
          const style = { left: (b - startTime) * 100 / length + '%' }
          return <div key={b} className="scale-mark high" style={style} />
        })}
        {lowBoundaries.map(b => {
          const style = { left: (b - startTime) * 100 / length + '%' }
          return <div key={b} className="scale-mark low" style={style} />
        })}
      </div>
    </div>
  )
}

export default TimelineScale
