import { Config } from 'src/types'

const defaultConfig: Config = {
  cameras: [],

  folders: {
    config: process.env.CONFIG_DIR || '/config',
    video: process.env.DATA_DIR || '/media',
  },

  ftp: {
    host: process.env.FTP_IP || undefined,
    port: parseInt(process.env.FTP_PORT) || 21821,
    dataPort: parseInt(process.env.FTP_DATA_PORT) || 21822,
  },

  storage: {
    maxPercent: 85
  }
}

export default defaultConfig
