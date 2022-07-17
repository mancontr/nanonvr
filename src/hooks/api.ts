import { useCRUD, useFetch } from '@gluedigital/ruse-fetch-extras'
import { Camera, Track } from 'src/types'
import { baseUrl } from 'src/config'

const base = baseUrl + '/api'

export const useCameras = () => useFetch<Camera[]>(base + '/cameras', null, 'cams')
export const useCamera = (id: string) => useFetch<Camera>(id && (base + '/cameras/' + id), null, 'cam-' + id)

export const useCameraCRUD = () => {
  const crud = useCRUD<string, Camera>(base + '/cameras')
  return crud
}

export const useCameraTracks = (id: string) => useFetch<Track[]>(id && (base + '/cameras/' + id + '/tracks'), null, 'tracks-' + id)
