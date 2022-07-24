import React from 'react'
import { useBasePath } from 'src/hooks/config'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { PlayPoint, Track } from 'src/types'
import './Feeds.sass'

interface FeedsProps {
  playPoint?: PlayPoint
}

const Feeds = ({ playPoint }: FeedsProps) => {
  const track: Track = useTrackFromPlayPoint(playPoint)

  const baseUrl = useBasePath()
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
