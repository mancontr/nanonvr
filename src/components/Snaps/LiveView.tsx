import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js/light'
import Loading from 'src/components/Loading/Loading'
import basename from 'src/util/basename'
import { Camera } from 'src/types'

interface LiveViewProps {
  cam: Camera
  onClick?: () => void
  fallback: React.ReactNode
}

/**
 * Live view of a camera, using low-latency HLS from MediaMTX (through our
 * proxy). Shows the fallback instead if it can't be played.
 */
const LiveView = ({ cam, onClick, fallback }: LiveViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(true) // Until frames are playing

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    setFailed(false)
    setLoading(true)
    const src = `${basename}/live/${cam.uuid}/index.m3u8`
    let hls: Hls = null

    if (Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        // MediaMTX needs a moment to start remuxing a camera nobody was watching
        manifestLoadPolicy: {
          default: {
            maxTimeToFirstByteMs: 10000,
            maxLoadTimeMs: 20000,
            timeoutRetry: { maxNumRetry: 2, retryDelayMs: 0, maxRetryDelayMs: 0 },
            errorRetry: { maxNumRetry: 5, retryDelayMs: 1000, maxRetryDelayMs: 4000 },
          },
        },
      })
      let recoveredMedia = false
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recoveredMedia) {
          recoveredMedia = true
          hls.recoverMediaError()
        } else {
          console.warn('[live] Playback failed:', data.details)
          setFailed(true)
        }
      })
      hls.loadSource(src)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src // Native HLS (Safari)
    } else {
      setFailed(true)
    }

    return () => {
      hls?.destroy()
      // Ensure the connection gets closed (see Feeds)
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [cam.uuid])

  if (failed) return <>{fallback}</>
  return (
    <div className="snap live-view" onClick={onClick}>
      <video
        className="live"
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onPlaying={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onError={() => setFailed(true)}
      />
      {loading && <Loading />}
    </div>
  )
}

export default LiveView
