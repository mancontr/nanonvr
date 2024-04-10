import React from 'react'
import { FormattedDate, FormattedTime } from 'react-intl'
import { useWidth } from 'src/hooks/responsive'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import { getTimeMarksBetweenDates } from 'src/util/dates'
import { useSlice } from './SliceContext'

const TimelineScale = () => {
  const {playPoint, playbackTs} = usePlayPointState()
  const slice = useSlice()
  const length = slice[1] - slice[0]
  const pixels = useWidth() - 100
  const pph = pixels * 3600 * 1000 / length
  const resolution = blocksAtResolution.find(x => x.min < pph)
  const ts = playbackTs || playPoint?.ts || null

  const dayLabels = getTimeMarksBetweenDates(slice, resolution.day)
  const timeLabels = getTimeMarksBetweenDates(slice, resolution.time)
  const highBoundaries = getTimeMarksBetweenDates(slice, resolution.high)
  const lowBoundaries = getTimeMarksBetweenDates(slice, resolution.low)

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
        {ts &&
          <div
            className="needle"
            style={{ left: (ts - slice[0]) * 100 / length + '%' }}
          />
        }
      </div>
    </div>
  )
}

const blocksAtResolution = [
  { min: 2000, day: 86400000, time: 60000, high: 60000, low: 10000 },
  { min: 600, day: 86400000, time: 300000, high: 300000, low: 60000 },
  { min: 250, day: 86400000, time: 600000, high: 300000, low: 60000 },
  { min: 100, day: 86400000, time: 1800000, high: 1800000, low: 600000 },
  { min: 40, day: 86400000, time: 3600000, high: 3600000, low: 900000 },
  { min: 18, day: 86400000, time: 14400000, high: 3600000, low: 1800000 },
  { min: 5, day: 86400000, time: 28800000, high: 28800000, low: 3600000 },
  { min: 2, day: 86400000, time: 0, high: 86400000, low: 28800000 },
  { min: 0, day: 0, time: 0, high: 86400000, low: 0 },
]

export default TimelineScale
