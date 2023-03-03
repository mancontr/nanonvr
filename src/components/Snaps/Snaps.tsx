import React, { Suspense, useEffect, useRef } from 'react'
import Loading from 'src/components/Loading/Loading'
import basename from 'src/util/basename'
import { useCameras } from 'src/hooks/api'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import './Snaps.sass'

const Snaps = (): JSX.Element => {
  const [playPoint, setPlayPoint] = usePlayPointState()
  const cams = useCameras()

  if (playPoint?.camId) {
    const cam = cams.find(c => c.uuid === playPoint.camId)
    return (
      <div id="snaps" className="one">
        <Snap cam={cam} onClick={() => setPlayPoint(null)} />
      </div>
    )
  }

  const layout = getLayout(cams.length)

  return (
    <div id="snaps" className={layout}>
      {cams.map(cam =>
        <Snap key={cam.uuid} cam={cam} onClick={() => setPlayPoint({ camId: cam.uuid })}/>
      )}
    </div>
  )
}

const Snap = ({ cam, ...other }) => {
  const canvasRef = useRef<any>()

  useEffect(() => {
    let t = null
    const update = () => {
      const url = cam && `${basename}/api/cameras/${cam.uuid}/snapshot?t=${Date.now()}`
      const img = new Image()
      img.onload = () => {
        const context = canvasRef.current.getContext('2d')
        canvasRef.current.setAttribute('width', img.width)
        canvasRef.current.setAttribute('height', img.height)
        context.drawImage(img, 0, 0)
        t = setTimeout(update, 3000)
      }
      img.src = url
    }
    update()
    return () => clearInterval(t)
  }, [])

  return (
    <canvas className="snap" ref={canvasRef} {...other} />
  )
}

const getLayout = (len: number): string => {
  if (len === 1) return 'one'
  if (len <= 4) return 'four'
  if (len <= 9) return 'nine'
  return 'sixteen'
}

const SnapsWrapper = () =>
  <Suspense fallback={<div id="snaps" className="one"><Loading id="snaps"/></div>}>
    <Snaps />
  </Suspense>

export default SnapsWrapper
