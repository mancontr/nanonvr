import { getMqttInfo } from "./hass"
import * as mqtt from 'async-mqtt'
import db from './db'

let client = null

export const initialize = async () => {
  let url: string
  try {
    const data = await getMqttInfo()
    url = `mqtt://${data.username}:${data.password}@${data.host}:${data.port}`
  } catch (e) {
    // Ignore silently (not on HASS?)
    return
  }
  try {
    client = await mqtt.connectAsync(url)
  } catch (e) {
    console.error('[MQTT] Cannot connect to server:', e)
    return
  }
  await syncCameras()
  await resetCameras()
}

export const syncCameras = async () => {
  if (!client) return
  const cameras = db.getCameras()
  for (const camera of cameras) {
    const topic = `homeassistant/binary_sensor/nanonvr/${camera.uuid}/config`
    const body = JSON.stringify({
      device_class: 'motion',
      name: `Camera ${camera.name} Triggered`,
      state_topic: `nanonvr/cams/${camera.uuid}`,
      unique_id: `nanonvr-${camera.uuid}`,
      device: {
        name: 'NanoNVR',
        manufacturer: 'NanoNVR',
        identifiers: ['nanonvr'],
      },
      value_template: "{{ value_json.state }}"
    })
    await client.publish(topic, body)
  }
}

export const resetCameras = async () => {
  if (!client) return
  const cameras = db.getCameras()
  for (const camera of cameras) {
    await client.publish(`nanonvr/cams/${camera.uuid}`, JSON.stringify({ 'state': 'OFF' }))
  }
}

const timerMap = new Map<string, NodeJS.Timeout>()

const motionDuration = 60 * 1000

// Send a motion event, and reset it after motionDuration ms (unless we get another event)
export const sendEvent = (camId: string) => {
  if (!client) return
  if (timerMap.has(camId)) {
    // Already has motion; replace existing timer (and don't send anything)
    clearTimeout(timerMap.get(camId))
  } else {
    // No motion before; send status change
    client.publish(`nanonvr/cams/${camId}`, JSON.stringify({ 'state': 'ON' }))
  }
  // In both cases, set the reset timer
  const reset = () => {
    timerMap.delete(camId)
    client.publish(`nanonvr/cams/${camId}`, JSON.stringify({ 'state': 'OFF' }))
  }
  const newTimer = setTimeout(reset, motionDuration)
  timerMap.set(camId, newTimer)
}