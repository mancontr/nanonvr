declare var __CLIENT__: boolean, window: any

export const dataDir: string = process.env.DATA_DIR || '/share'
export const dbDir: string = process.env.DB_DIR || '/data'
export const baseUrl: string = __CLIENT__
  ? (window.___INITIAL_STATE__?.base || '') + '/api'
  : (process.env.APP_URL || ('http://localhost:' + (process.env.PORT || '3000'))) + '/api'
