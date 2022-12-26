import { useRef } from "react"
import { useSliceState } from "./SliceContext"

interface ActionState {
  starts: Map<number, number>
  lasts: Map<number, number>
  slice: [number, number]
}

const useTimelineEvents = () => {
  const [slice, setSlice] = useSliceState()
  const s = useRef<ActionState>({ starts: new Map(), lasts: new Map(), slice: slice })
  const element = useRef<HTMLDivElement>()

  return {
    ref: element,
    onPointerDown: (e) => {
      element.current.setPointerCapture(e.pointerId)
      s.current.lasts.set(e.pointerId, e.screenX)
      s.current.lasts.forEach((v, k) => s.current.starts.set(k, v))
      s.current.slice = slice
    },
    onPointerUp: (e) => {
      s.current.starts.delete(e.pointerId)
      s.current.lasts.delete(e.pointerId)
      s.current.lasts.forEach((v, k) => s.current.starts.set(k, v))
      s.current.slice = slice
    },
    onPointerMove: (e) => {
      if (!s.current.starts.has(e.pointerId)) return // Just a hover
      s.current.lasts.set(e.pointerId, e.screenX)

      const ids = Array.from(s.current.lasts.keys())
      const totalWidth = element.current.clientWidth
      const [t0, t1] = s.current.slice
      const totalTime = t1 - t0
      if (ids.length === 1) {
        const delta = s.current.lasts.get(ids[0]) - s.current.starts.get(ids[0])
        const relTime = totalTime * delta / totalWidth
        setSlice([t0 - relTime, t1 - relTime])
      } else if (ids.length === 2) {
        const st0 = s.current.starts.get(ids[0])
        const st1 = s.current.starts.get(ids[1])
        const la0 = s.current.lasts.get(ids[0])
        const la1 = s.current.lasts.get(ids[1])
        const middleDelta = ((la0 + la1) - (st0 + st1)) / 2
        const distDelta = (Math.abs(la0 - la1) - Math.abs(st0 - st1)) / 2
        const coef = totalTime / totalWidth
        setSlice([t0 - coef * (middleDelta - distDelta), t1 - coef * (middleDelta + distDelta)])
      }
    }
  }
}

export default useTimelineEvents
