import React, { Suspense, useEffect, useRef } from 'react'
import Loading from 'src/components/Loading/Loading'
import { basename } from 'src/config'
import { useCameras } from 'src/hooks/api'
import './Snaps.sass'

const Snaps = (): JSX.Element => {
  const cams = useCameras()
  return (
    <>
      {cams.map(cam =>
        <Snap key={cam.uuid} cam={cam} />
      )}
    </>
  )
}

const Snap = ({ cam }) => {
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
    <canvas className="snap" ref={canvasRef} />
  )
}

const SnapsWrapper = () =>
  <div id="snaps">
    <Suspense fallback={<Loading />}>
      <Snaps />
    </Suspense>
  </div>

export default SnapsWrapper
