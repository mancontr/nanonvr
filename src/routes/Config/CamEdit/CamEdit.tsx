import React, { Suspense, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import Loading from 'src/components/Loading/Loading'
import { useCamera, useCameraCRUD } from 'src/hooks/api'
import { Camera } from 'src/types'
import CamStatus from './CamStatus'

import './CamEdit.sass'

const emptyCam: Camera = {
  uuid: null,
  name: '',
  streamMain: '',
  streamSub: '',
  snapshot: '',
}

const CamEdit = () => {
  const history = useHistory()
  const { id } = useParams()
  const initialCam = useCamera(id)
  const [cam, setCam] = useState(initialCam || emptyCam)
  const handleChange = e => setCam({ ...cam, [e.target.name]: e.target.value })
  const cameraCrud = useCameraCRUD()

  const handleSubmit = async e => {
    e.preventDefault()
    if (id) {
      await cameraCrud.update(id, cam)
    } else {
      await cameraCrud.create(cam)
    }
    history.push('/config')
  }

  const handleRemove = async () => {
    if (confirm('Are you sure?')) {
      await cameraCrud.delete(id)
      history.push('/config')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <span><FormattedMessage id="config.edit.field.name" /></span>
        <input name="name" required value={cam.name} onChange={handleChange} />
      </label>
      <label>
        <span><FormattedMessage id="config.edit.field.streamMain" /></span>
        <input name="streamMain" type="url" required value={cam.streamMain} onChange={handleChange} />
      </label>
      <label>
        <span><FormattedMessage id="config.edit.field.streamSub" /></span>
        <input name="streamSub" type="url" value={cam.streamSub} onChange={handleChange} />
      </label>
      <label>
        <span><FormattedMessage id="config.edit.field.snapshot" /></span>
        <input name="snapshot" type="url" value={cam.snapshot} onChange={handleChange} />
      </label>
      <div className="buttons">
        <button className="primary">
          <FormattedMessage id={'config.edit.' + (id ? 'save' : 'add')} />
        </button>
        {id &&
          <button onClick={handleRemove}>
            <FormattedMessage id="config.edit.remove" />
          </button>
        }
      </div>
    </form>
  )
}

const CamEditWrapper = () => {
  const { id } = useParams()
  return (
    <main id="config-cam-edit">
      <h2><FormattedMessage id={`config.edit.title-${id ? 'edit' : 'add'}`} /></h2>
      <Suspense fallback={<Loading />}>
        <CamEdit />
      </Suspense>
      {id &&
        <CamStatus />
      }
    </main>
  )
}

export default CamEditWrapper
