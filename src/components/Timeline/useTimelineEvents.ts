import { useRef } from "react"
import { useSetPlayPoint } from "src/routes/Home/PlayPointContext"
import { useSliceState } from "./SliceContext"

interface Tap {
  start: number
  last: number
  target?: any
  ts: number
}

interface ActionState {
  taps: Map<number, Tap>
  slice: [number, number]
}

const useTimelineEvents = () => {
  const [slice, setSlice] = useSliceState()
  const setPlayPoint = useSetPlayPoint()
  const s = useRef<ActionState>({ taps: new Map(), slice: slice })
  const element = useRef<HTMLDivElement>()

  const handleSeek = (tap: Tap) => {
    if (tap.target?.classList?.contains('video-block')) {
      const camId = tap.target.parentElement.dataset.cam
      const totalWidth = element.current.clientWidth
      const leftMargin = element.current.getBoundingClientRect().left
      const [t0, t1] = s.current.slice
      const totalTime = t1 - t0
      const fullTs = t0 + totalTime / totalWidth * (tap.start - leftMargin)
      const ts = Math.round(fullTs / 1000) * 1000 // Second precission only
      setPlayPoint({ camId, ts })
    }
  }

  return {
    ref: element,
    onPointerDown: (e) => {
      element.current.setPointerCapture(e.pointerId)
      s.current.taps.set(e.pointerId, {
        start: e.clientX,
        last: e.clientX,
        target: e.target,
        ts: Date.now()
      })
      s.current.taps.forEach((v) => v.start = v.last)
      s.current.slice = slice
    },
    onPointerUp: (e) => {
      const tap = s.current.taps.get(e.pointerId)
      s.current.taps.delete(e.pointerId)
      s.current.taps.forEach((v) => v.start = v.last)
      s.current.slice = slice
      if ((Date.now() - tap.ts) < 150) {
        handleSeek(tap)
      }
    },
    onPointerMove: (e) => {
      if (!s.current.taps.has(e.pointerId)) return // Just a hover
      s.current.taps.get(e.pointerId).last = e.clientX

      const ids = Array.from(s.current.taps.keys())
      const totalWidth = element.current.clientWidth
      const [t0, t1] = s.current.slice
      const totalTime = t1 - t0
      if (ids.length === 1) {
        const tap = s.current.taps.get(ids[0])
        const delta = tap.last - tap.start
        const relTime = totalTime * delta / totalWidth
        setSlice([t0 - relTime, t1 - relTime])
      } else if (ids.length === 2) {
        const tap0 = s.current.taps.get(ids[0])
        const tap1 = s.current.taps.get(ids[1])
        const middleDelta = ((tap0.last + tap1.last) - (tap0.start + tap1.start)) / 2
        const distDelta = (Math.abs(tap0.last - tap1.last) - Math.abs(tap0.start - tap1.start)) / 2
        const coef = totalTime / totalWidth
        setSlice([t0 - coef * (middleDelta - distDelta), t1 - coef * (middleDelta + distDelta)])
      }
    }
  }
}

export default useTimelineEvents
