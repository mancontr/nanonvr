import fs from 'fs'
import path from 'path'
import { dataDir } from 'src/config'
import db from 'src/server/services/db'
import { Track } from 'src/types'
import getMp4Length from 'src/util/getMp4Length'

export const start = () => {
  // We're the first service, so ensure the dataDir exists already
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  // The worker will be watching forever the data dir
  const worker = async () => {
    while(true) {
      try {
        await handleUpdateAll()
      } catch (e) {
        console.error(e)
      }
      await new Promise(resolve => setTimeout(resolve, 10000))
    }
  }
  setTimeout(worker, 1000)
}

/**
 * Loop through all the cameras, checking for updates with handleUpdate()
 */
 const handleUpdateAll = async (): Promise<void> => {
  const cams = db.getCameras()
  for (const cam of cams) {
    await handleUpdate(cam.uuid)
  }
}

/**
 * Checks for updates on a single camera's folder
 * @param camId The target camera
 */
const handleUpdate = async (camId: string): Promise<void> => {

  // Get a list of known tracks for this camera
  const known = db.getTracks(camId)

  // Get a list of current files for this camera
  const folder = path.join(dataDir, camId)
  const files = getFolderFiles(folder)

  // Create some fast lookup maps/sets
  const dbMap = new Map<string, Track>(known.map(track => [track.filename, track]))
  const fileSet = new Set<string>(files.map(file => file.filename))

  // Check what needs to be updated ...
  const added = files.filter(file => !dbMap.has(file.filename))
  const removed = known.filter(track => !fileSet.has(track.filename))
  const updated = files.filter(file => dbMap.has(file.filename) && file.filesize !== dbMap.get(file.filename).filesize)

  // Perform the updates
  for (const track of removed) {
    db.removeTrack(camId, track.filename)
  }
  for (const file of added) {
    db.addTrack(camId, {
      ...file,
      uuid: camId,
      length: await getMp4Length(file.filepath)
    })
  }
  for (const file of updated) {
    db.updateTrack(camId, file.filename, {
      ...file,
      uuid: camId,
      length: await getMp4Length(file.filepath)
    })
  }
}

interface TrackFileInfo {
  filename: string
  filepath: string
  filesize: number
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
      }
    })
