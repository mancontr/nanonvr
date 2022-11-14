export interface Camera {
  uuid: string
  name: string
  streamMain: string
  streamSub?: string
  snapshot?: string
}

export interface Track {
  uuid: string
  filename: string
  filesize: number
  length: number
}

export interface Event {
  uuid: string
  filename: string
  filesize: number
  originalName: string
  isVideo: boolean
}

export interface PlayPoint {
  camId: string
  ts: number
}
