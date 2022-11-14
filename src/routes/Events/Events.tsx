import React, { Suspense } from 'react'
import { useEvents } from 'src/hooks/api'
import { useBasePath } from 'src/hooks/config'
import { Event } from 'src/types'
import './Events.sass'

const Events = () => {
  const events = useEvents()

  return (
    <main id="events">
      <div className="thumbs">
        {events.map(event =>
          <EventCard key={event.filename} event={event} />
        )}
      </div>
    </main>
  )
}

interface EventCardProps {
  event: Event
}

const EventCard = ({ event }: EventCardProps) => {
  const baseUrl = useBasePath()
  const url = `${baseUrl}/media/${event.uuid}/events/${event.filename}`
  const readableName = event.originalName.substring(event.originalName.lastIndexOf('/') + 1)
  return (
    <a className={'event-card ' + (event.isVideo ? 'video' : 'image')} href={url} target="_blank" title={readableName}>
      {!event.isVideo &&
        <img src={url} alt={readableName} />
      }
      {!!event.isVideo &&
        <>
          <video>
            <source src={url} />
          </video>
          <div className="overlay">
            <span className="icon-play" />
          </div>
        </>
      }
    </a>
  )
}

const EventsWrapper = () =>
  <Suspense>
    <Events />
  </Suspense>

export default EventsWrapper
