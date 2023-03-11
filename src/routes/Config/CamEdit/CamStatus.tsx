import React, { Suspense, useEffect, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useParams } from 'react-router-dom'
import { useCameraCRUD, useCameraStatus } from 'src/hooks/api'

import './CamStatus.sass'

const CamStatus = () => {
  const { id } = useParams()
  const initialCamStatus = useCameraStatus(id)
  const actions = useCameraCRUD()
  const [ camStatus, setCamStatus ] = useState(initialCamStatus)

  const { status, logs } = camStatus
  const statusLC = status.toLowerCase()

  const refresh = () => {
    actions.getStatus(id)
      .then(currentCamStatus => setCamStatus(currentCamStatus))
  }

  const start = () => actions.recordStart(id).then(refresh)
  const stop = () => actions.recordStop(id).then(refresh)

  useEffect(() => {
    const t = setInterval(refresh, 5000)
    return () => clearInterval(t)
  }, []) // TODO: Missing dependency, but it would cause a rerender loop

  return (
    <div className="cam-status">
      <div>
        <h3>
          <FormattedMessage id="cam-status.title" />
        </h3>
        <span className={'status status-' + statusLC}>
          <FormattedMessage id={'cam-status.state.' + statusLC} />
        </span>
        <span className="icon-area">
          <span title="Refresh" className="icon icon-history" onClick={refresh} />
          {status === 'ACTIVE' &&
            <span title="Stop recording" className="icon icon-stop" onClick={stop} />
          }
          {status === 'IDLE' &&
            <span title="Start recording" className="icon icon-play" onClick={start} />
          }
        </span>
      </div>
      <div className="logs">
        <span className="key">
          <FormattedMessage id="cam-status.logs" />
        </span>
        <div className="log-lines">
          <div>
            {logs.map((line, i) =>
              <div key={i} className={'log-line' + (line.startsWith('***') ? ' highlighted' : '')}>
                {line}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const CamStatusWrapper = () => {
  return (
    <Suspense fallback={null}>
      <CamStatus />
    </Suspense>
  )
}

export default CamStatusWrapper
