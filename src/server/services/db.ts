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
      name TEXT,
      stream TEXT
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

  async addCamera(name: string, stream: string): Promise<Camera> {
    const id = uuid()
    await new Promise((resolve, reject) => {
      this.db
        .prepare(`INSERT INTO cam(uuid, name, stream) values (?, ?, ?)`)
        .run(
          [id, name, stream],
          function (err) { err ? reject(err) : resolve(null)}
        )
    })
    return { uuid: id, name, stream }
  }

  async updateCamera(id: string, name: string, stream: string): Promise<Camera> {
    await new Promise((resolve, reject) => {
      this.db
        .prepare(`UPDATE cam SET name = ?, stream = ? WHERE uuid = ?`)
        .run(
          [name, stream, id],
          function (err) { err ? reject(err) : resolve(null)}
        )
    })
    return { uuid: id, name, stream }
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
