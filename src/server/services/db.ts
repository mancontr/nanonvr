import path from 'path'
import sqlite3 from 'sqlite3'
import { v4 as uuid } from 'uuid'
import { Camera } from 'src/types'
import { dataDir } from 'src/config'

const defaultPath = path.join(dataDir, 'data.db')

export class Database {
  db: sqlite3.Database = null

  constructor(altPath: string = defaultPath) {
    this.db = new sqlite3.Database(altPath)
    this.initialize()
  }

  initialize() {
    this.db.run(`CREATE TABLE IF NOT EXISTS cam (
      uuid TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      streamMain TEXT NOT NULL,
      streamSub TEXT,
      snapshot TEXT
    )`)
  }

  getCameras(): Promise<Camera[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM cam', (err, rows) => {
        err ? reject(err) : resolve(rows)
      })
    })
  }

  getCamera(id: string): Promise<Camera> {
    return new Promise((resolve, reject) => {
      this.db
        .prepare('SELECT * FROM cam WHERE uuid = ?')
        .get([id], (err, row) => {
          err ? reject(err) : resolve(row)
        })
    })
  }

  async addCamera(cam: Camera): Promise<Camera> {
    const id = uuid()
    await new Promise((resolve, reject) => {
      this.db
        .prepare(`INSERT INTO cam(uuid, name, streamMain, streamSub, snapshot) values (?, ?, ?, ?, ?)`)
        .run(
          [id, cam.name, cam.streamMain, cam.streamSub, cam.snapshot],
          function (err) { err ? reject(err) : resolve(null)}
        )
    })
    return { ...cam, uuid: id }
  }

  async updateCamera(id: string, cam: Camera): Promise<Camera> {
    await new Promise((resolve, reject) => {
      this.db
        .prepare(`UPDATE cam SET name = ?, streamMain = ?, streamSub = ?, snapshot = ? WHERE uuid = ?`)
        .run(
          [cam.name, cam.streamMain, cam.streamSub, cam.snapshot, id],
          function (err) { err ? reject(err) : resolve(null)}
        )
    })
    return { ...cam, uuid: id }
  }

  async removeCamera(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db
        .prepare('DELETE FROM cam WHERE uuid = ?')
        .get([id], (err) => {
          err ? reject(err) : resolve(null)
        })
    })
  }

}

const db = new Database()
export default db
