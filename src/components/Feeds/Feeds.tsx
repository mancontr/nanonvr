import React from 'react'
import basename from 'src/util/basename'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { usePlayPoint } from 'src/routes/Home/PlayPointContext'
import './Feeds.sass'

const Feeds = () => {
  const playPoint = usePlayPoint()
  const track: string = useTrackFromPlayPoint(playPoint)

  const url = track && `${basename}/media/${playPoint.camId}/${track}`
  return (
    <div id="feeds">
      {track &&
        <video key={playPoint.camId + '/' + track} autoPlay>
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
