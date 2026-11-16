import { promises as fs } from 'fs'

type FileHandle = Awaited<ReturnType<typeof fs.open>>

// Boxes we need to look inside of
const containers = new Set(['moov', 'trak', 'mdia', 'mvex', 'moof', 'traf'])
// Boxes whose contents we need to read (all of them are small)
const leaves = new Set(['tkhd', 'mdhd', 'hdlr', 'trex', 'tfhd', 'tfdt', 'trun'])
const MAX_LEAF_SIZE = 4 * 1024 * 1024

interface TrackInfo {
  timescale: number
  duration: number // From mdhd (non-fragmented files only)
  handler: string
  defaultDuration: number // From trex
  defaultFlags: number // From trex
  fragmentEnd: number // End time of the latest fragment
  keyframes: number[] // Decode times of sync samples (fragmented files only)
}

export interface Mp4Info {
  /** Length in seconds (0 if it could not be read) */
  length: number
  /** Time of each keyframe, in seconds since the start (fragmented files only) */
  keyframes: number[]
}

const NON_SYNC_SAMPLE = 0x10000

/**
 * Gets the length and keyframe times of an MP4 video, without invoking
 * external tools.
 *
 * Supports both regular MP4 files (using the track header duration) and
 * fragmented ones (using the end time of the last fragment, which includes
 * any initial offset). Only the video track is measured, so audio tracks do
 * not get in the way.
 *
 * It just walks the box headers, skipping the media data, so it only needs
 * to read a few KB, even for big files.
 * @param filename The video file
 */
export async function getMp4Info (filename: string): Promise<Mp4Info> {
  const tracks = new Map<number, TrackInfo>()
  let currentTrack: TrackInfo = null // While inside a trak
  let currentTrafTrack: TrackInfo = null // While inside a traf
  let trafDefaultDuration = 0
  let trafDefaultFlags = 0
  let trafCursor = 0 // Decode time of the next sample in the current traf

  const getTrack = (id: number) => {
    if (!tracks.has(id)) {
      tracks.set(id, { timescale: 0, duration: 0, handler: '', defaultDuration: 0, defaultFlags: 0, fragmentEnd: 0, keyframes: [] })
    }
    return tracks.get(id)
  }

  const handleLeaf = (type: string, b: Buffer) => {
    const version = b.readUInt8(0)
    const flags = b.readUInt32BE(0) & 0xffffff
    switch (type) {
      case 'tkhd': {
        // Always comes before mdia, so the following boxes will belong to this track
        currentTrack = getTrack(b.readUInt32BE(version === 1 ? 20 : 12))
        break
      }
      case 'mdhd': {
        currentTrack ??= getTrack(-1)
        if (version === 1) {
          currentTrack.timescale = b.readUInt32BE(20)
          currentTrack.duration = Number(b.readBigUInt64BE(24))
        } else {
          currentTrack.timescale = b.readUInt32BE(12)
          currentTrack.duration = b.readUInt32BE(16)
        }
        break
      }
      case 'hdlr': {
        currentTrack ??= getTrack(-1)
        currentTrack.handler = b.toString('latin1', 8, 12)
        break
      }
      case 'trex': {
        const track = getTrack(b.readUInt32BE(4))
        track.defaultDuration = b.readUInt32BE(12)
        track.defaultFlags = b.readUInt32BE(20)
        break
      }
      case 'tfhd': {
        currentTrafTrack = getTrack(b.readUInt32BE(4))
        let offset = 8
        if (flags & 0x01) offset += 8 // base-data-offset
        if (flags & 0x02) offset += 4 // sample-description-index
        trafDefaultDuration = (flags & 0x08) ? b.readUInt32BE(offset) : currentTrafTrack.defaultDuration
        if (flags & 0x08) offset += 4 // default-sample-duration
        if (flags & 0x10) offset += 4 // default-sample-size
        trafDefaultFlags = (flags & 0x20) ? b.readUInt32BE(offset) : currentTrafTrack.defaultFlags
        trafCursor = currentTrafTrack.fragmentEnd // In case there is no tfdt
        break
      }
      case 'tfdt': {
        trafCursor = version === 1 ? Number(b.readBigUInt64BE(4)) : b.readUInt32BE(4)
        break
      }
      case 'trun': {
        if (!currentTrafTrack) break
        const count = b.readUInt32BE(4)
        let offset = 8
        if (flags & 0x01) offset += 4 // data-offset
        const firstFlags = (flags & 0x04) ? b.readUInt32BE(offset) : null
        if (flags & 0x04) offset += 4 // first-sample-flags
        // Each entry has these optional fields, in this order
        const hasDuration = !!(flags & 0x100)
        const flagsPos = 4 * [0x100, 0x200].filter(f => flags & f).length
        const stride = 4 * [0x100, 0x200, 0x400, 0x800].filter(f => flags & f).length
        for (let i = 0; i < count; i++) {
          const entry = offset + i * stride
          const sampleFlags = (flags & 0x400) ? b.readUInt32BE(entry + flagsPos)
            : (i === 0 && firstFlags !== null) ? firstFlags
            : trafDefaultFlags
          if (!(sampleFlags & NON_SYNC_SAMPLE)) currentTrafTrack.keyframes.push(trafCursor)
          trafCursor += hasDuration ? b.readUInt32BE(entry) : trafDefaultDuration
        }
        currentTrafTrack.fragmentEnd = Math.max(currentTrafTrack.fragmentEnd, trafCursor)
        break
      }
    }
  }

  const walk = async (file: FileHandle, start: number, end: number) => {
    const header = Buffer.alloc(16)
    let pos = start
    while (pos + 8 <= end) {
      const { bytesRead } = await file.read(header, 0, 16, pos)
      if (bytesRead < 8) break
      let size = header.readUInt32BE(0)
      const type = header.toString('latin1', 4, 8)
      let headerSize = 8
      if (size === 1) {
        if (bytesRead < 16) break
        size = Number(header.readBigUInt64BE(8))
        headerSize = 16
      } else if (size === 0) {
        size = end - pos // Box extends to the end of the file
      }
      if (size < headerSize) break // Corrupt

      const contentStart = pos + headerSize
      const contentEnd = Math.min(pos + size, end)

      if (containers.has(type)) {
        if (type === 'trak') currentTrack = null
        if (type === 'traf') currentTrafTrack = null
        await walk(file, contentStart, contentEnd)
      } else if (leaves.has(type) && contentEnd - contentStart <= MAX_LEAF_SIZE) {
        const content = Buffer.alloc(contentEnd - contentStart)
        const res = await file.read(content, 0, content.length, contentStart)
        if (res.bytesRead === content.length) handleLeaf(type, content)
      }

      pos += size
    }
  }

  let file: FileHandle = null
  try {
    file = await fs.open(filename, 'r')
    const { size } = await file.stat()
    await walk(file, 0, size)
  } catch (e) {
    console.warn(e)
    return { length: 0, keyframes: [] }
  } finally {
    await file?.close()
  }

  // Measure the video track (or the first one, if there is no video)
  const all = Array.from(tracks.values()).filter(t => t.timescale)
  const track = all.find(t => t.handler === 'vide') || all[0]
  if (!track) return { length: 0, keyframes: [] }
  const units = track.fragmentEnd || track.duration
  return {
    length: units / track.timescale,
    keyframes: track.keyframes.map(k => k / track.timescale),
  }
}

/**
 * Gets the length of an MP4 video, in seconds (0 if it could not be read).
 */
const getMp4Length = async (filename: string): Promise<number> =>
  (await getMp4Info(filename)).length

export default getMp4Length
