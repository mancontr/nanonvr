import React from 'react'
import { basename } from 'src/config'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { usePlayPoint } from 'src/routes/Home/PlayPointContext'
import { Track } from 'src/types'
import Player from './Player'
import './Feeds.sass'

const Feeds = () => {
  const playPoint = usePlayPoint()
  const track: Track = useTrackFromPlayPoint(playPoint)

  const url = track && `${basename}/media/${track.uuid}/${track.filename}`
  const options = {
    autoplay: true,
    // controls: true, // Testing only
    fill: true,
    sources: [{
      src: url,
      type: 'video/mp4',
    }]
  }
  return (
    <div id="feeds">
      {track &&
        <Player options={options} />
      }
      {!track &&
        <img src={`${basename}/images/no-video.png`} alt="No video" />
      }
    </div>
  )
}

export default Feeds
