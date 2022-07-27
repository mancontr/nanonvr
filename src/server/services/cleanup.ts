import fs from 'fs'
import path from 'path'
import { dataDir, maxSize } from 'src/config'
import db from 'src/server/services/db'
import { Track } from 'src/types'

export const start = () => {
  const worker = async () => {
    while(true) {
      try {
        await doCleanup()
      } catch (e) {
        console.error(e)
      }
      await new Promise(resolve => setTimeout(resolve, 60 * 60 * 1000))
    }
  }
  setTimeout(worker, 1000)
}

/**
 * Checks if a video cleanup is required, according to the configuration.
 */
const doCleanup = async (): Promise<void> => {
  const totalSize = db.getTotalSize()
  if (maxSize > 0 && totalSize > maxSize) {
    const removeBytes = totalSize - maxSize
    const tracks = getUptoBytes(db.getOldestTracks(), removeBytes)
    for (const track of tracks) {
      const file = path.join(dataDir, track.uuid, track.filename)
      fs.unlinkSync(file)
    }
  }
}

// Returns the first tracks adding up to the requested amount of bytes
const getUptoBytes = (tracks: Track[], bytes: number): Track[] => {
  const list = []
  let accum = 0
  for (let i = 0; i < tracks.length; i++) {
    accum += tracks[i].filesize
    list.push(tracks[i])
    if (accum >= bytes) break
  }
  return list
}
