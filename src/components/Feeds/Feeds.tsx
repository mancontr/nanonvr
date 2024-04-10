import React from 'react'
import basename from 'src/util/basename'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import { filename2localDate } from 'src/util/dates'
import './Feeds.sass'

const Feeds = () => {
  const {playPoint, setPlaybackTs} = usePlayPointState()
  const track: string = useTrackFromPlayPoint(playPoint)

  const url = track && `${basename}/media/${playPoint.camId}/${track}`

  const handleTimeUpdate = (e) => {
    const clipStart = filename2localDate(track)
    const newTs = clipStart + e.target.currentTime * 1000
    setPlaybackTs(newTs)
  }

  return (
    <div id="feeds">
      {track &&
        <video key={playPoint.camId + '/' + track} autoPlay onTimeUpdate={handleTimeUpdate}>
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
