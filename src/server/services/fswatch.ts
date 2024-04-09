import fs from 'fs'
import path from 'path'
import db from 'src/server/services/db'
import getMp4Length from 'src/util/getMp4Length'
import bus from './bus'
import { getConfig } from './config'

const start = () => {
  // The worker will be watching forever the data dir
  const worker = async () => {
    while(true) {
      try {
        await handleUpdateAll()
      } catch (e) {
        console.error(e)
      }
      await new Promise(resolve => setTimeout(resolve, 30000))
    }
  }
  setTimeout(worker, 1000)
}

/**
 * Loop through all the cameras, checking for updates with handleUpdate()
 */
 const handleUpdateAll = async (): Promise<void> => {
  const cams = getConfig().cameras
  for (const cam of cams) {
    await handleUpdate(cam.uuid)
  }
}

/**
 * Checks for updates on a single camera's folder
 * @param camId The target camera
 */
const handleUpdate = async (camId: string): Promise<void> => {
  const base = getConfig().folders.video

  // Get a list of pending files for this camera
  const folder = path.join(base, camId, 'temp')
  if (!fs.existsSync(folder)) return
  const files = getFolderFiles(folder)

  for (const file of files) {
    // Ignore files that might still be incomplete
    const isLatest = file === files[0]
    const isReady = !isLatest || file.age > 70000
    if (!isReady) continue
    // First move it to its final location
    const day = file.filename.substring(0, 10)
    const dstFolder = path.join(base, camId, day)
    const dstPath = path.join(dstFolder, file.filename)
    fs.mkdirSync(dstFolder, { recursive: true })
    fs.renameSync(file.filepath, dstPath)
    file.filepath = dstPath
    // Add it to the DB
    db.addTrack(camId, {
      ...file,
      uuid: camId,
      length: await getMp4Length(file.filepath)
    })
  }

  // Also check if some old ones need to be deleted
  db.getTracks(camId)
    .filter(track => !fs.existsSync(path.join(base, camId, track.filename.substring(0, 10), track.filename)))
    .forEach(track => db.removeTrack(camId, track.filename))
}

interface TrackFileInfo {
  filename: string
  filepath: string
  filesize: number
  age: number
}

const getFolderFiles = (folder: string): TrackFileInfo[] =>
  fs.readdirSync(folder)
    .filter(filename => filename.endsWith('.mp4')) // Only videos
    .sort((a, b) => a < b ? 1 : -1) // newest first
    .map(filename => {
      const filepath = path.join(folder, filename)
      const stats = fs.statSync(filepath)
      return {
        filename,
        filepath,
        filesize: stats.size,
        age: Date.now() - stats.mtime.valueOf()
      }
    })

bus.once('configLoaded', start)
