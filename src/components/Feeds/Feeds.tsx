import React from 'react'
import { basename } from 'src/config'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { usePlayPoint } from 'src/routes/Home/PlayPointContext'
import { Track } from 'src/types'
import './Feeds.sass'

const Feeds = () => {
  const playPoint = usePlayPoint()
  const track: Track = useTrackFromPlayPoint(playPoint)

  const url = track && `${basename}/media/${track.uuid}/${track.filename}`
  return (
    <div id="feeds">
      {track &&
        <video key={track.uuid + '/' + track.filename} autoPlay>
          <source src={url} />
        </video>
      }
      {!track &&
        <img src={`${basename}/images/no-video.png`} alt="No video" />
      }
    </div>
  )
}

export default Feeds
