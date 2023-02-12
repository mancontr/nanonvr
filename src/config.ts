declare var __CLIENT__: boolean, window: any

// Folder for the config
export const configDir: string = process.env.CONFIG_DIR || '/config'

// Folder for the videos
export const dataDir: string = process.env.DATA_DIR || '/share'

// Basename
export const basename = (__CLIENT__
  ? window.frameElement ? new URL(window.frameElement.src).pathname.slice(0, -1) : ''
  : process.env.APP_URL || ('http://localhost:' + (process.env.PORT || '3000'))
)

// URL to perform API calls
export const apiBaseUrl: string = basename + '/api'

// FTP settings
export const ftpPort: number = parseInt(process.env.FTP_PORT) || 21821
export const ftpDataPort: number = parseInt(process.env.FTP_DATA_PORT) || 21822
