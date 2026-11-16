import React, { useEffect, useMemo, useRef, useState } from 'react'
import basename from 'src/util/basename'
import { isPlaybackTrack } from 'src/util/dates'
import { useTrackFromPlayPoint } from 'src/hooks/playback'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import './Feeds.sass'

// Length of each playback stream; playback continues seamlessly after it
const STREAM_DURATION = 300
// How far we may skip forward when starting on a recording gap
const MAX_GAP_SKIP = 30000

interface StreamStart {
  requested: number // The play point it was resolved for
  start: number // The keyframe the stream really starts at
}

const Feeds = () => {
  const {playPoint, setPlayPoint, setPlaybackTs, paused} = usePlayPointState()
  const {track, start, nextStart, nextStartAfter} = useTrackFromPlayPoint(playPoint) || {}
  const videoRef = useRef<HTMLVideoElement>(null)
  const playback = isPlaybackTrack(track)

  // New recordings are streamed from the playback server, which needs to start
  // on a keyframe, so find the one at (or right before) the play point.
  const [streamStart, setStreamStart] = useState<StreamStart>(null)
  useEffect(() => {
    if (!playback) return
    const requested = playPoint.ts
    let cancelled = false
    fetch(`${basename}/media/${playPoint.camId}/keyframe?ts=${Math.round(requested)}`)
      .then(res => res.json())
      .catch(() => ({ ts: requested }))
      .then(({ ts }) => { if (!cancelled) setStreamStart({ requested, start: ts }) })
    return () => { cancelled = true }
  }, [playback, playPoint])
  const stream = playback && streamStart?.requested === playPoint.ts ? streamStart : null

  // Old recordings: the track file itself, starting at the right offset
  const offset: number = useMemo(() => Math.floor((playPoint.ts - start) / 1000), [playPoint, track])

  const videoStart = playback ? stream?.start : start
  const url = !track ? null
    : !playback ? `${basename}/media/${playPoint.camId}/${track}#t=${offset}`
    : stream ? `${basename}/media/${playPoint.camId}/play?start=${stream.start}&duration=${STREAM_DURATION}`
    : null

  const handleTimeUpdate = (e) => setPlaybackTs(videoStart + e.target.currentTime * 1000)

  const handleEnded = (e) => {
    if (!playback) {
      if (nextStart) setPlayPoint({ camId: playPoint.camId, ts: nextStart })
      return
    }
    const endTs = videoStart + e.target.currentTime * 1000
    if (e.target.currentTime >= STREAM_DURATION - 2) {
      // The stream reached its length limit: just continue
      setPlayPoint({ camId: playPoint.camId, ts: endTs })
      return
    }
    // The stream stopped on a discontinuity (ie: camera reconnection), so
    // continue from the next track, if there is one. Always moving forward.
    const next = nextStartAfter(Math.max(playPoint.ts, endTs - 3000))
    if (next) setPlayPoint({ camId: playPoint.camId, ts: Math.max(next, endTs) })
  }

  // Starting on a short gap (ie: while a camera was reconnecting) has nothing
  // to play, so skip to the next track, as long as it is close enough
  const handleError = () => {
    if (!playback) return
    const next = nextStartAfter(playPoint.ts)
    if (next && next - playPoint.ts < MAX_GAP_SKIP) setPlayPoint({ camId: playPoint.camId, ts: next })
  }

  useEffect(() => {
    if (paused) videoRef.current?.pause()
    else videoRef.current?.play()
  }, [paused])

  // A detached <video> keeps downloading until it gets garbage-collected, and
  // browsers only allow ~6 connections per server, so a few seeks would block
  // every request. Release the stream explicitly when moving on.
  useEffect(() => {
    const video = videoRef.current
    return () => {
      if (!video) return
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [url])

  return (
    <div id="feeds">
      {url &&
        <video key={url} ref={videoRef} src={url} autoPlay onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onError={handleError} />
      }
      {!track &&
        <img src={`${basename}/images/no-video.png`} alt="No video" />
      }
    </div>
  )
}

export default Feeds
