import { useCRUD, useFetch } from '@gluedigital/ruse-fetch-extras'
import { Camera, CameraStatus, Event, Track } from 'src/types'
import basename from 'src/util/basename'

const base = basename + '/api'

export const useCameras = () => useFetch<Camera[]>(base + '/cameras', null, 'cams')
export const useCamera = (id: string) => useFetch<Camera>(id && (base + '/cameras/' + id), null, 'cam-' + id)
export const useCameraStatus = (id: string) => useFetch<CameraStatus>(id && (base + '/cameras/' + id + '/status'), null, 'status-' + id)

export const useCameraCRUD = () => {
  const crud = useCRUD<string, Camera>(base + '/cameras')
  return {
    ...crud,
    getStatus: (id: string) => crud.custom(`/${id}/status`),
    recordStart: (id: string) => crud.custom(`/${id}/record/start`, { method: 'POST' }),
    recordStop: (id: string) => crud.custom(`/${id}/record/stop`, { method: 'POST' }),
  }
}

export const useCameraTracks = (id: string) => useFetch<Track[]>(id && (base + '/cameras/' + id + '/tracks'), null, 'tracks-' + id)

export const useEvents = () => useFetch<Event[]>(base + '/events', null, 'evts')
