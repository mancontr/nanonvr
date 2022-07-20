import React from 'react'
import { baseUrl } from 'src/config'
import { Track } from 'src/types'
import './Feeds.sass'

interface FeedsProps {
  track?: Track
}

const Feeds = ({ track }: FeedsProps) => {
  const url = track && `${baseUrl}/media/${track.uuid}/${track.filename}`
  return (
    <div id="feeds">
      {track &&
        <video key={track.uuid + '/' + track.filename} autoPlay>
          <source src={url} />
        </video>
      }
      {!track &&
        <img src={`${baseUrl}/images/no-video.png`} alt="No video" />
      }
    </div>
  )
}

export default Feeds
