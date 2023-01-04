import React, { useEffect } from 'react'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'

/* Video.js reference player */

interface PlayerProps {
  options: any
  onReady?: (player: any) => void
}

const Player = ({ options, onReady }: PlayerProps) => {
  const videoRef = React.useRef(null)
  const playerRef = React.useRef(null)

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement('video-js')
      videoElement.classList.add('vjs-big-play-centered')
      videoRef.current.appendChild(videoElement)

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready')
        onReady && onReady(player)
      })
    } else {
      const player = playerRef.current;
      player.autoplay(options.autoplay)
      player.src(options.sources)
    }
  }, [options, videoRef])

  React.useEffect(() => {
    const player = playerRef.current

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose()
        playerRef.current = null
      }
    };
  }, [playerRef])

  return (<div className="video" data-vjs-player ref={videoRef} />)
}

export default Player
