import React, { Suspense } from 'react'
import { useCameras } from 'src/hooks/api'
// import { FormattedMessage } from 'react-intl'
import './Config.sass'

const Config = () => {
  const cams = useCameras()
  return (
    <main id="config">
      Cameras:
      <div id="cam-list">
        {cams.map(cam =>
          <div key={cam.uuid} className="cam-entry">
            {cam.name}
          </div>
        )}
        <div className="cam-entry new">
          Add...
        </div>
      </div>
    </main>
  )
}

const ConfigWrapper = () =>
  <Suspense fallback={false}>
    <Config />
  </Suspense>

export default ConfigWrapper
