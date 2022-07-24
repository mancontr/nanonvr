import React from 'react'
import { FormattedDate, FormattedTime } from 'react-intl'
import { PlayPoint } from 'src/types'
import { getTimeMarksBetweenDates } from 'src/util/dates'

interface TimelineScaleProps {
  slice: [number, number]
  playPoint: PlayPoint
}

const TimelineScale = ({ slice, playPoint }: TimelineScaleProps) => {
  const length = slice[1] - slice[0]
  const dayLabels = getTimeMarksBetweenDates(slice, 86400000)
  const timeLabels = getTimeMarksBetweenDates(slice, 2 * 3600000)
  const highBoundaries = getTimeMarksBetweenDates(slice, 3600000)
  const lowBoundaries = getTimeMarksBetweenDates(slice, 900000)

  return (
    <div id="scale">
      <div className="legend" />
      <div className="lines">
        {dayLabels.map(b => {
          const style = { left: (b - slice[0]) * 100 / length + '%' }
          return (
            <div key={b} className="scale-entry major" style={style}>
              <FormattedDate value={b} year="numeric" month="2-digit" day="2-digit" />
            </div>
          )
        })}
        {timeLabels.map(b => {
          const style = { left: (b - slice[0]) * 100 / length + '%' }
          return (
            <div key={b} className="scale-entry minor" style={style}>
              <FormattedTime value={b} hour="2-digit" minute="2-digit" hour12={false} />
            </div>
          )
        })}
        {highBoundaries.map(b => {
          const style = { left: (b - slice[0]) * 100 / length + '%' }
          return <div key={b} className="scale-mark high" style={style} />
        })}
        {lowBoundaries.map(b => {
          const style = { left: (b - slice[0]) * 100 / length + '%' }
          return <div key={b} className="scale-mark low" style={style} />
        })}
        {playPoint &&
          <div
            className="needle"
            style={{ left: (playPoint.ts - slice[0]) * 100 / length + '%' }}
          />
        }
      </div>
    </div>
  )
}

export default TimelineScale
