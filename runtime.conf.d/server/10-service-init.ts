import db from 'src/server/services/db'
import * as fswatch from 'src/server/services/fswatch'
import * as ffmpeg from 'src/server/services/ffmpeg'
import * as cleanup from 'src/server/services/cleanup'
import * as ftp from 'src/server/services/ftp'
import * as mqtt from 'src/server/services/mqtt'
import config from 'src/server/services/yaml'

export const startup = () => {
  config.load()
  db.initialize()
  fswatch.start()
  if (!process.env.NO_RECORD) ffmpeg.startRecordingAll()
  cleanup.start()
  ftp.start()
  mqtt.initialize()
}
