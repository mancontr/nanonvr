import React, { Suspense, useEffect, useRef, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import basename from 'src/util/basename'
import { useEvents } from 'src/hooks/api'
import { Event } from 'src/types'
import './Events.sass'

const Events = () => {
  const events = useEvents()
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
      <div className="thumbs">
        {events.map((event, i) =>
          <EventCard key={event.filename} event={event} onClick={() => setCurrent(i)} active={i === current} />
        )}
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
