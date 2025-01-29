import { RequestHandler } from 'express';
import db from '../services/db'

export const getEvents: RequestHandler = (_, res) => {
  const events = db.getEvents()
  res.send(events)
}
