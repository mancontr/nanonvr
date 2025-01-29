import { RequestHandler } from 'express'
import path from 'path'
import { getConfig } from '../services/config'

export const serveTrack: RequestHandler = async (req, res) => {
  const { camId, track } = req.params
  const target = [camId, track.substring(0, 10), track].join('/')
  const filePath = path.join(getConfig().folders.video, target)
  res.sendFile(filePath)
}

export const serveEvent: RequestHandler = async (req, res) => {
  const { camId, event } = req.params
  const target = camId + '/events/' + event
  const filePath = path.join(getConfig().folders.video, target)
  res.sendFile(filePath)
}
