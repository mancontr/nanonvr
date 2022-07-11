import chokidar from 'chokidar'
import { Stats } from 'graceful-fs'
import { dataDir } from 'src/config'
import db from 'src/server/services/db'
import * as ffmpeg from 'src/server/services/ffmpeg'
import { Track } from 'src/types'

export const start = () => {
  let initialFiles = []
  let isReady = false

  chokidar
    .watch(dataDir, { alwaysStat: true })
    .on('ready', () => {
      isReady = true
      // TODO: Do something with these files
      initialFiles = null // Clean up list
    })
    .on('add', (path, stat) => {
      if (!path.endsWith('.mp4')) return // Only watch for videos
      if (isReady) {
        handleFile(path, stat)
          .catch(e => console.warn(e))
      } else {
        initialFiles.push([path, stat])
      }
    })
}

const handleFile = async (path: string, stat: Stats) => {
  // First, try to find it on the DB.
  const cam = path.substring(path.length - 60, 41)
  const date = path.substring(path.length - 23)
  const existing = db.getTrack(cam, date)

  if (existing && existing.filesize === stat.size) return // Nothing changed

  const update: Track = {
    uuid: cam,
    filename: date,
    filesize: stat.size,
    length: await ffmpeg.getVideoLength(path)
  }

  if (existing) {
    db.updateTrack(cam, date, update)
  } else {
    db.addTrack(cam, update)
  }
}
