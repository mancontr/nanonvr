import React, { Suspense, useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useHistory } from 'react-router-dom'
import basename from 'src/util/basename'
import { useEvents } from 'src/hooks/api'
import { Event } from 'src/types'
import './Events.sass'

const Events = () => {
  const events = useEvents()
  const history = useHistory()
  const [current, setCurrent] = useState(0)
  const currEvent = events[current]

  useEffect(() => {
    const handler = e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrent(c => c > 0 ? c - 1 : 0)
        e.preventDefault()
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrent(c => c < events.length - 1 ? c + 1 : c)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [events])

  const prev = () => setCurrent(current > 0 ? current - 1 : 0)
  const next = () => setCurrent(current < events.length - 1 ? current + 1 : current)
  const jump = () => {
    const f = currEvent.filename
    const ts = new Date(
      [f.substring(0, 4), f.substring(4, 6), f.substring(6, 8)].join('-') +
      'T' +
      [f.substring(9, 11), f.substring(11, 13), f.substring(13, 15)].join(':') +
      'Z'
    )
    setTimeout(() => history.push('/', { camId: currEvent.uuid, ts: ts.valueOf() }), 0)
  }
  const download = () => {
    const url = `${basename}/media/${currEvent.uuid}/events/${currEvent.filename}`
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.download = currEvent.filename
    a.click()
  }

  return (
    <main id="events">
      <div className="main">
        {currEvent &&
          <EventCard event={currEvent} isBig />
        }
        {events.length === 0 &&
          <div className="event-card alert">
            <FormattedMessage id="events.empty" />
          </div>
        }
      </div>
      <div className="bar">
        <div className="actions">
          <span className="icon icon-play-reverse" onClick={prev}/>
          <span className="icon icon-play" onClick={next} />
          <span className="icon icon-history" onClick={jump} />
          <span className="icon icon-download" onClick={download} />
        </div>
        <div className="thumbs">
          {events.map((event, i) =>
            <EventCard key={event.filename} event={event} onClick={() => setCurrent(i)} active={i === current} />
          )}
        </div>
      </div>
    </main>
  )
}

interface EventCardProps {
  event: Event
  isBig?: boolean
  active?: boolean
  [k: string]: any
}

const EventCard = ({ event, isBig, active, ...other }: EventCardProps) => {
  const ref = useRef<any>()
  const url = `${basename}/media/${event.uuid}/events/${event.filename}`
  const readableName = event.originalName.substring(event.originalName.lastIndexOf('/') + 1)

  let className = 'event-card ' + (event.isVideo ? 'video' : 'image')
  if (active) className += ' active'

  useEffect(() => {
    if (active) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }, [active])

  return (
    <div className={className} {...other} ref={ref}>
      {!event.isVideo &&
        <img src={url} alt={readableName} />
      }
      {!!event.isVideo &&
        <>
          <video controls={isBig}>
            <source src={url} />
          </video>
          {!isBig &&
            <div className="overlay">
              <span className="icon-play" />
            </div>
          }
        </>
      }
    </div>
  )
}

const EventsWrapper = () =>
  <Suspense>
    <Events />
  </Suspense>

export default EventsWrapper
