import { v4 as uuid } from 'uuid'
import { Camera } from 'src/types'
import { getConfig, setConfig } from './config'

export const getCameras = (): Camera[] => {
  return getConfig().cameras || []
}

export const getCamera = (id: string): Camera | undefined => {
  return getConfig().cameras?.find(c => c.uuid === id)
}

export const addCamera = (camera: Camera): void => {
  const config = getConfig()
  setConfig({
    ...config,
    cameras: [
      ...config.cameras,
      { ...camera, uuid: uuid() }
    ]
  })
}

export const updateCamera = (id: string, camera: Camera): void => {
  const config = getConfig()
  const newCameras = config.cameras.slice()
  const idx = newCameras.findIndex(cam => cam.uuid === id)
  newCameras[idx] = camera
  setConfig({ ...config, cameras: newCameras })
}

export const removeCamera = (id: string): void => {
  const config = getConfig()
  const newCameras = config.cameras.filter(cam => cam.uuid !== id)
  setConfig({ ...config, cameras: newCameras })
}
