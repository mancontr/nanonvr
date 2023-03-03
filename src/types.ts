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
  ts?: number
}

export interface FoldersConfig {
  config: string
  video: string
}

export interface StorageConfig {
  maxPercent?: number
}

export interface FtpConfig {
  host: string
  port: number
  dataPort: number
}

export interface Config {
  cameras?: Camera[]
  folders?: FoldersConfig
  ftp?: FtpConfig
  storage?: StorageConfig
}
