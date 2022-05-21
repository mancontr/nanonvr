import React, { Suspense, useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import { useCamera, useCameraCRUD } from 'src/hooks/api'
import { Camera } from 'src/types'

const emptyCam: Camera = {
  uuid: null,
  name: '',
  stream: '',
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
    <main id="config-cam-edit">
      <h2><FormattedMessage id="config.edit.title" /></h2>
      <form onSubmit={handleSubmit}>
        <label>
          <span><FormattedMessage id="config.edit.field.name" /></span>
          <input name="name" value={cam.name} onChange={handleChange} />
        </label>
        <label>
          <span><FormattedMessage id="config.edit.field.stream" /></span>
          <input name="stream" value={cam.stream} onChange={handleChange} />
        </label>
        <button className="primary">
          <FormattedMessage id={'config.edit.' + (id ? 'save' : 'add')} />
        </button>
        {id &&
          <button onClick={handleRemove}>
            <FormattedMessage id="config.edit.remove" />
          </button>
        }
      </form>
    </main>
  )
}

const CamEditWrapper = () =>
  <Suspense fallback={false}>
    <CamEdit />
  </Suspense>

export default CamEditWrapper
