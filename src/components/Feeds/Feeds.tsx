import React from 'react'
import { baseUrl } from 'src/config'
import { Track } from 'src/types'
import './Feeds.sass'

interface FeedsProps {
  track?: Track
}

const Feeds = ({ track }: FeedsProps) => {
  return (
    <div id="feeds">
      {track &&
        <video key={track.uuid + '/' + track.filename} autoPlay>
          <source src={`${baseUrl}/media/${track.uuid}/${track.filename}`} />
        </video>
      }
      {!track &&
        <img src={`${baseUrl}/images/no-video.png`} alt="No video" />
      }
    </div>
  )
}

export default Feeds
