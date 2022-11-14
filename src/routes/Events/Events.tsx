import React, { Suspense, useState } from 'react'
import { useEvents } from 'src/hooks/api'
import { useBasePath } from 'src/hooks/config'
import { Event } from 'src/types'
import './Events.sass'

const Events = () => {
  const events = useEvents()
  const [current, setCurrent] = useState(0)
  const currEvent = events[current]

  return (
    <main id="events">
      <div className="main">
        {currEvent &&
          <EventCard event={currEvent} isBig />
        }
      </div>
      <div className="thumbs">
        {events.map((event, i) =>
          <EventCard key={event.filename} event={event} onClick={() => setCurrent(i)} />
        )}
      </div>
    </main>
  )
}

interface EventCardProps {
  event: Event
  isBig?: boolean
  [k: string]: any
}

const EventCard = ({ event, isBig, ...other }: EventCardProps) => {
  const baseUrl = useBasePath()
  const url = `${baseUrl}/media/${event.uuid}/events/${event.filename}`
  const readableName = event.originalName.substring(event.originalName.lastIndexOf('/') + 1)
  return (
    <div className={'event-card ' + (event.isVideo ? 'video' : 'image')} title={readableName} {...other}>
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
