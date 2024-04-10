import React, { useMemo } from 'react'
import basename from 'src/util/basename'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import './Feeds.sass'

const Feeds = () => {
  const {playPoint, setPlayPoint, setPlaybackTs} = usePlayPointState()
  const {track, start, nextStart} = useTrackFromPlayPoint(playPoint) || {}
  const offset: number = useMemo(() => Math.floor((playPoint.ts - start) / 1000), [playPoint, track])

  const url = track && `${basename}/media/${playPoint.camId}/${track}#t=${offset}`

  const handleTimeUpdate = (e) => setPlaybackTs(start + e.target.currentTime * 1000)
  const handleEnded = () => nextStart && setPlayPoint({ camId: playPoint.camId, ts: nextStart })

  return (
    <div id="feeds">
      {track &&
        <video key={playPoint.camId + '/' + track} autoPlay onTimeUpdate={handleTimeUpdate} onEnded={handleEnded}>
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
