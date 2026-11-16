import fs from 'fs'
import path from 'path'
import db from 'src/server/services/db'
import getMp4Length from 'src/util/getMp4Length'
import bus from './bus'
import { getConfig } from './config'
import { sendRecording } from './mqtt'

// MediaMTX writes to the current segment every second, so a file that has not
// been modified for a while is complete (or its stream died, which also ends it)
const COMPLETE_AFTER = 20000
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/

const fullyScanned = new Set<string>()

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
 * Registers any complete recording not yet on the DB, for a single camera.
 *
 * The first time, all day folders are checked (to recover from downtime).
 * After that, only the last two ones are, which covers day changes.
 * @param camId The target camera
 */
const handleUpdate = async (camId: string): Promise<void> => {
  const base = getConfig().folders.video
  const camFolder = path.join(base, camId)
  if (!fs.existsSync(camFolder)) return

  await migrateLegacyTemp(camId)

  const days = fs.readdirSync(camFolder).filter(d => DAY_RE.test(d)).sort()
  const toScan = fullyScanned.has(camId) ? days.slice(-2) : days
  let added = 0

  for (const day of toScan) {
    const dayFolder = path.join(camFolder, day)
    const known = new Set(db.getTracksInRange(camId, day, day + '~').map(t => t.filename))
    const files = fs.readdirSync(dayFolder).filter(f => f.endsWith('.mp4') && !known.has(f))
    for (const filename of files) {
      const filepath = path.join(dayFolder, filename)
      const stats = fs.statSync(filepath)
      if (Date.now() - stats.mtime.valueOf() < COMPLETE_AFTER) continue // Still recording
      db.addTrack(camId, {
        uuid: camId,
        filename,
        filesize: stats.size,
        length: await getMp4Length(filepath),
      })
      added++
    }
  }
  fullyScanned.add(camId)
  if (added) sendRecording(camId)

  // Also check if some old ones need to be deleted
  db.getTracks(camId)
    .filter(track => !fs.existsSync(path.join(camFolder, track.filename.substring(0, 10), track.filename)))
    .forEach(track => db.removeTrack(camId, track.filename))
}

/**
 * Moves into their day folders any leftovers from the ffmpeg recorder, which
 * used a temp folder. They will be registered on the next scan.
 */
const migrateLegacyTemp = async (camId: string): Promise<void> => {
  const camFolder = path.join(getConfig().folders.video, camId)
  const tempFolder = path.join(camFolder, 'temp')
  if (!fs.existsSync(tempFolder)) return
  for (const filename of fs.readdirSync(tempFolder)) {
    if (!filename.endsWith('.mp4')) continue
    const dstFolder = path.join(camFolder, filename.substring(0, 10))
    fs.mkdirSync(dstFolder, { recursive: true })
    fs.renameSync(path.join(tempFolder, filename), path.join(dstFolder, filename))
  }
  if (fs.readdirSync(tempFolder).length === 0) fs.rmdirSync(tempFolder)
  fullyScanned.delete(camId) // Ensure they get registered, whatever their day
}

bus.once('configLoaded', start)
