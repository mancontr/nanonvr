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
  syncCameras()
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
    await client.publish(`nanonvr/cams/${camera.uuid}`, JSON.stringify({ 'state': 'OFF' }))
  }
}

export const sendEvent = () => {
  if (!client) return
  // TODO ...
}
