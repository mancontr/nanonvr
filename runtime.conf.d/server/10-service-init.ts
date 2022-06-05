import db from 'src/server/services/db'
import * as fswatch from 'src/server/services/fswatch'
import * as ffmpeg from 'src/server/services/ffmpeg'

export const startup = () => {
  db.initialize()
  fswatch.start()
  if (false) ffmpeg.startRecordingAll()
}
