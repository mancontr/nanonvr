import { useEffect } from 'react'
import { Camera, PlayPoint } from 'src/types'

const SECOND = 1000
const MINUTE = 60 * SECOND

const seekStep = (e: KeyboardEvent) => {
  if (e.shiftKey) return 10 * SECOND
  if (e.ctrlKey) return 5 * MINUTE
  return MINUTE
}

const useTimelineHotkeys = (
  cameras: Camera[],
  playPoint: PlayPoint,
  setPlayPoint: (p: PlayPoint) => void,
  ts: number | null,
  paused: boolean,
  setPaused: (p: boolean) => void,
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA'].includes(target?.tagName) || target?.isContentEditable) return

      if (e.key >= '1' && e.key <= '9') {
        const cam = cameras[parseInt(e.key, 10) - 1]
        if (cam) setPlayPoint({ camId: cam.uuid, ts: ts ?? undefined })
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (!playPoint?.camId) return
        e.preventDefault()
        const delta = (e.key === 'ArrowLeft' ? -1 : 1) * seekStep(e)
        setPlayPoint({ camId: playPoint.camId, ts: (ts || Date.now()) + delta })
      } else if (e.key === ' ') {
        if (!playPoint?.camId) return
        e.preventDefault()
        setPaused(!paused)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cameras, playPoint, setPlayPoint, ts, paused, setPaused])
}

export default useTimelineHotkeys
