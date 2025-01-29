import { RequestHandler } from 'express'
import compactTracks from 'src/util/compactTracks'
import db from '../services/db'

export const getTracks: RequestHandler = (req, res) => {
  const cam = req.params.id
  const tracks = db.getTracks(cam)
  res.send(compactTracks(tracks))
}
