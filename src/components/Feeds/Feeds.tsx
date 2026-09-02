import React, { useEffect, useMemo, useRef } from 'react'
import basename from 'src/util/basename'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import './Feeds.sass'

const Feeds = () => {
  const {playPoint, setPlayPoint, setPlaybackTs, paused} = usePlayPointState()
  const {track, start, nextStart} = useTrackFromPlayPoint(playPoint) || {}
  const offset: number = useMemo(() => Math.floor((playPoint.ts - start) / 1000), [playPoint, track])
  const videoRef = useRef<HTMLVideoElement>(null)

  const url = track && `${basename}/media/${playPoint.camId}/${track}#t=${offset}`

  const handleTimeUpdate = (e) => setPlaybackTs(start + e.target.currentTime * 1000)
  const handleEnded = () => nextStart && setPlayPoint({ camId: playPoint.camId, ts: nextStart })

  useEffect(() => {
    if (paused) videoRef.current?.pause()
    else videoRef.current?.play()
  }, [paused])

  return (
    <div id="feeds">
      {track &&
        <video key={url} ref={videoRef} autoPlay onTimeUpdate={handleTimeUpdate} onEnded={handleEnded}>
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
