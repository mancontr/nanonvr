import { useCRUD, useFetch } from '@gluedigital/ruse-fetch-extras'
import { Camera, Event, Track } from 'src/types'
import basename from 'src/util/basename'

const base = basename + '/api'

export const useCameras = () => useFetch<Camera[]>(base + '/cameras', null, 'cams')
export const useCamera = (id: string) => useFetch<Camera>(id && (base + '/cameras/' + id), null, 'cam-' + id)

export const useCameraCRUD = () => {
  const crud = useCRUD<string, Camera>(base + '/cameras')
  return crud
}

export const useCameraTracks = (id: string) => useFetch<Track[]>(id && (base + '/cameras/' + id + '/tracks'), null, 'tracks-' + id)

export const useEvents = () => useFetch<Event[]>(base + '/events', null, 'evts')
