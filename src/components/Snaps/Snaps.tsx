import React, { Suspense, useEffect, useRef } from 'react'
import Loading from 'src/components/Loading/Loading'
import basename from 'src/util/basename'
import { useCameras } from 'src/hooks/api'
import { usePlayPointState } from 'src/routes/Home/PlayPointContext'
import './Snaps.sass'

const Snaps = (): JSX.Element => {
  const {playPoint, setPlayPoint} = usePlayPointState()
  const cams = useCameras().slice()

  if (playPoint?.camId) {
    const cam = cams.find(c => c.uuid === playPoint.camId)
    return (
      <div id="snaps" className="one">
        <Snap cam={cam} onClick={() => setPlayPoint(null)} />
      </div>
    )
  }

  const rowCount = Math.floor(Math.sqrt(cams.length))
  const perRow = Math.ceil(cams.length / rowCount)

  const emptySpaces = rowCount * perRow - cams.length
  for (let i = 0; i < emptySpaces; i++) cams.unshift(null)

  const rows = []
  for (let i = 0; i < rowCount; i++) {
    rows[i] = cams.slice(i * perRow, (i + 1) * perRow)
  }

  return (
    <div id="snaps">
      {rows.map(row =>
        <div className="row">
          {row.map(cam => cam &&
            <Snap key={cam.uuid} cam={cam} onClick={() => setPlayPoint({ camId: cam.uuid })}/>
          )}
        </div>
      )}
    </div>
  )
}

const Snap = ({ cam, ...other }) => {
  const canvasRef = useRef<any>(null)

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

const SnapsWrapper = () =>
  <Suspense fallback={<div id="snaps" className="one"><Loading id="snaps"/></div>}>
    <Snaps />
  </Suspense>

export default SnapsWrapper
