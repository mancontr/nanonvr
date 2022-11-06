import db from 'src/server/services/db'
import * as fswatch from 'src/server/services/fswatch'
import * as ffmpeg from 'src/server/services/ffmpeg'
import * as cleanup from 'src/server/services/cleanup'
import * as ftp from 'src/server/services/ftp'

export const startup = () => {
  db.initialize()
  fswatch.start()
  if (!process.env.NO_RECORD) ffmpeg.startRecordingAll()
  cleanup.start()
  ftp.start()
}
