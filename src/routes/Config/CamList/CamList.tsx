import React, { Suspense } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import { useCameras } from 'src/hooks/api'
import CamEntry from './CamEntry'
import './CamList.sass'

const CamList = () => {
  const cams = useCameras()
  return (
    <main id="config-cam-list">
      <FormattedMessage id="config.cams.title" />
      <div id="cam-list">
        {cams.map(cam =>
          <CamEntry key={cam.uuid} cam={cam} />
        )}
        <Link className="cam-entry new" to="/config/new">
          <span className="title">
            <FormattedMessage id="config.cams.add" />
          </span>
        </Link>
      </div>
    </main>
  )
}

const CamListWrapper = () =>
  <Suspense fallback={false}>
    <CamList />
  </Suspense>

export default CamListWrapper
