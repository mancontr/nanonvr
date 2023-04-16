import { mkdirSync } from 'fs'
import path from 'path'
import SqliteDatabase from 'better-sqlite3'
import { Track, Event, Config } from 'src/types'
import bus from './bus'

export class Database {
  db: SqliteDatabase = null

  initialize(dbPath: string) {
    mkdirSync(path.dirname(dbPath), { recursive: true })
    this.db = new SqliteDatabase(dbPath)

    // Create tables
    this.db.prepare(`CREATE TABLE IF NOT EXISTS track (
      uuid TEXT NOT NULL,
      filename TEXT NOT NULL,
      filesize INTEGER NOT NULL,
      length INTEGER NOT NULL
    )`).run()

    this.db.prepare(`CREATE TABLE IF NOT EXISTS event (
      uuid TEXT NOT NULL,
      filename TEXT NOT NULL,
      filesize INTEGER NOT NULL,
      originalName TEXT NOT NULL,
      isVideo BOOLEAN NOT NULL DEFAULT FALSE
    )`).run()
  }

  // --- Tracks ---

  getTracks(camId: string): Track[] {
    return this.db
      .prepare('SELECT * FROM track WHERE uuid = ? ORDER BY filename DESC')
      .all([camId])
  }

  getTrack(camId: string, filename: string): Track {
    return this.db
      .prepare('SELECT * FROM track WHERE uuid = ? AND filename = ?')
      .get([camId, filename])
  }

  addTrack(camId: string, track: Track): Track {
    this.db
      .prepare('INSERT INTO track(uuid, filename, filesize, length) values (?, ?, ?, ?)')
      .run([camId, track.filename, track.filesize, track.length])
    return { ...track, uuid: camId }
  }

  updateTrack(camId: string, filename: string, track: Track): Track {
    this.db
      .prepare('UPDATE track SET filesize = ?, length = ? WHERE uuid = ? AND filename = ?')
      .run([track.filesize, track.length, camId, filename])
    return { ...track, uuid: camId, filename }
  }

  removeTrack(camId: string, filename: string): void {
    this.db
      .prepare('DELETE FROM track WHERE uuid = ? AND filename = ?')
      .run([camId, filename])
  }

  getTotalSize(): number {
    return this.db
      .prepare('SELECT SUM(filesize) AS size FROM track')
      .get()
      .size
  }

  getOldestTracks(): Track[] {
    return this.db
      .prepare('SELECT * FROM track ORDER BY filename ASC')
      .all()
  }

  // --- Events ---

  addEvent(camId: string, event: Event): Event {
    this.db
      .prepare('INSERT INTO event(uuid, filename, filesize, originalName, isVideo) values (?, ?, ?, ?, ?)')
      .run([camId, event.filename, event.filesize, event.originalName, event.isVideo ? 1 : 0])
    return { ...event, uuid: camId }
  }

  removeEvent(camId: string, filename: string): void {
    this.db
      .prepare('DELETE FROM event WHERE uuid = ? AND filename = ?')
      .run([camId, filename])
  }

  getEvents(): Event[] {
    return this.db
      .prepare('SELECT * FROM event ORDER BY filename DESC LIMIT 100')
      .all()
  }

}

const db = new Database()

bus.once('configLoaded', (conf: Config) =>
  db.initialize(path.join(conf.folders.video, 'data.db'))
)

export default db
