import { v4 as uuid } from 'uuid'
import { Camera } from 'src/types'
import { getConfig, getConfigHandler } from './config'

export const getCameras = (): Camera[] => {
  return getConfig().cameras || []
}

export const getCamera = (id: string): Camera | undefined => {
  return getConfig().cameras?.find(c => c.uuid === id)
}

export const addCamera = (camera: Camera): void => {
  const hnd = getConfigHandler()
  const config = hnd.getContents()
  hnd.setContents({
    ...config,
    cameras: [
      ...config.cameras,
      { ...camera, uuid: uuid() }
    ]
  })
  hnd.save()
}

export const updateCamera = (id: string, camera: Camera): void => {
  const hnd = getConfigHandler()
  const config = hnd.getContents()
  const newCameras = config.cameras.slice()
  const idx = newCameras.findIndex(cam => cam.uuid === id)
  newCameras[idx] = camera
  hnd.setContents({ ...config, cameras: newCameras })
  hnd.save()
}

export const removeCamera = (id: string): void => {
  const hnd = getConfigHandler()
  const config = hnd.getContents()
  const newCameras = config.cameras.filter(cam => cam.uuid !== id)
  hnd.setContents({ ...config, cameras: newCameras })
  hnd.save()
}
