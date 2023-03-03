import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import db from 'src/server/services/db'
import { Track } from 'src/types'
import { getConfig } from './config'
import bus from './bus'

let hdSize: number = 0

const start = () => {
  const worker = async () => {
    hdSize = await getHdSize()
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

const getHdSize = async (): Promise<number> => {
  const config = getConfig()
  const cmd = `df -P "${config.folders.video}"`
  const out: string = await new Promise((resolve, reject) =>
    exec(cmd, (err, text) => err ? reject(err) : resolve(text))
  )
  const size = out.split('\n')[1].split(/ +/)[1] // in K
  const bytes = 1024 * parseFloat(size)
  return bytes
}

/**
 * Checks if a video cleanup is required, according to the configuration.
 */
const doCleanup = async (): Promise<void> => {
  const config = getConfig()
  const totalSize = db.getTotalSize()
  const maxPercent = config.storage.maxPercent || 85
  const maxSize = maxPercent * hdSize / 100
  // console.log('We can use up to', maxSize, 'bytes, of which we are using', totalSize, 'bytes')
  if (maxSize > 0 && totalSize > maxSize) {
    const removeBytes = totalSize - maxSize
    const tracks = getUptoBytes(db.getOldestTracks(), removeBytes)
    for (const track of tracks) {
      const file = path.join(config.folders.video, track.uuid, track.filename)
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

bus.once('configLoaded', start)
