import { useCRUD, useFetch } from '@gluedigital/ruse-fetch-extras'
import { Camera } from 'src/types'

const base = (process.env.APP_URL || ('http://localhost:' + (process.env.PORT || '3000'))) + '/api'

export const useCameras = () => useFetch<Camera[]>(base + '/cameras')
export const useCamera = (id: string) => useFetch<Camera>(id && (base + '/cameras/' + id))

export const useCameraCRUD = () => {
  const crud = useCRUD<string, Camera>(base + '/cameras')
  return crud
}
