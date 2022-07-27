declare var __CLIENT__: boolean, window: any

// Folder for the videos
export const dataDir: string = process.env.DATA_DIR || '/share'

// Folder for the database
export const dbDir: string = process.env.DB_DIR || '/data'

// URL to perform API calls
export const apiBaseUrl: string = (__CLIENT__
  ? window.___INITIAL_STATE__?.base || ''
  : process.env.APP_URL || ('http://localhost:' + (process.env.PORT || '3000'))
) + '/api'

// Max size of videos on disk (in GiB)
export const maxSize: number = (parseInt(process.env.MAX_SIZE) || 0) * (1000**3)
