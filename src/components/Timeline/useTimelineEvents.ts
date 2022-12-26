import { useRef } from "react"
import { useSliceState } from "./SliceContext"

interface StartingState {
  positions: number[]
  slice: [number, number]
}

const useTimelineEvents = () => {
  const [slice, setSlice] = useSliceState()
  const starts = useRef<StartingState>({ positions: [], slice: slice })
  const element = useRef<HTMLDivElement>()

  const getX = (t: any): number[] => {
    const touches = Array.from<any>(t)
    touches.sort((a, b) => a.screenX - b.screenX) // Sort L->R so zoom can always work
    return touches.map(t => t.screenX)
  }

  return {
    ref: element,
    onTouchStart: (e) => {
      starts.current = {
        positions: getX(e.touches),
        slice: slice,
      }
    },
    onTouchEnd: (e) => {
      starts.current = {
        positions: getX(e.touches),
        slice: slice,
      }
    },
    onTouchMove: (e) => {
      const touches = getX(e.touches)
      if (touches.length !== starts.current.positions.length) {
        // Touches don't match; restablish...
        starts.current = {
          positions: getX(e.touches),
          slice: slice,
        }
      }
      const deltas = touches.map((t, i: number) => t - starts.current.positions[i])
      const totalWidth = element.current.clientWidth
      const [t0, t1] = starts.current.slice
      const totalTime = t1 - t0
      if (deltas.length === 1) {
        const relTime = totalTime * deltas[0] / totalWidth
        setSlice([t0 - relTime, t1 - relTime])
      } else if (deltas.length === 2) {
        const relTime1 = totalTime * deltas[0] / totalWidth
        const relTime2 = totalTime * deltas[1] / totalWidth
        setSlice([t0 - relTime1, t1 - relTime2])
      }
    }
  }
}

export default useTimelineEvents
