import React, { Suspense } from 'react'
import { FormattedMessage } from 'react-intl'
import { Link } from 'react-router-dom'
import Loading from 'src/components/Loading/Loading'
import { useCameras } from 'src/hooks/api'
import CamEntry from './CamEntry'
import './CamList.sass'

const CamList = () => {
  const cams = useCameras()
  return (
    <>
      {cams.map(cam =>
        <CamEntry key={cam.uuid} cam={cam} />
      )}
      <Link className="cam-entry new" to="/config/new">
        <span className="icon icon-plus" />
        <span className="title">
          <FormattedMessage id="config.cams.add" />
        </span>
      </Link>
    </>
  )
}

const CamListWrapper = () =>
  <main id="config-cam-list">
    <FormattedMessage id="config.cams.title" />
    <div id="cam-list">
      <Suspense fallback={<Loading />}>
        <CamList />
      </Suspense>
    </div>
  </main>

export default CamListWrapper
