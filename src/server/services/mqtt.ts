import { getMqttInfo } from "./hass"
import * as mqtt from 'async-mqtt'
import yaml from './yaml'

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
  const cameras = yaml.getCameras()
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
    await client.publish(topic, body, { qos: 2, retain: true })
  }
}

export const resetCameras = async () => {
  if (!client) return
  const cameras = yaml.getCameras()
  for (const camera of cameras) {
    await client.publish(
      `nanonvr/cams/${camera.uuid}`,
      JSON.stringify({ 'state': 'OFF' }),
      { qos: 2 }
    )
  }
}

const timerMap = new Map<string, NodeJS.Timeout>()

const motionDuration = 60 * 1000

// Send a motion event, and reset it after motionDuration ms (unless we get another event)
export const sendEvent = async (camId: string) => {
  if (!client) return
  if (timerMap.has(camId)) {
    // Already has motion; replace existing timer (and don't send anything)
    global.clearTimeout(timerMap.get(camId))
  } else {
    // No motion before; send status change
    try {
      await client.publish(
        `nanonvr/cams/${camId}`,
        JSON.stringify({ 'state': 'ON' }),
        { qos: 2 }
      )
    } catch (e) {
      console.warn('[MQTT] Could not send event:', e)
      throw e
    }
  }
  // In both cases, set the reset timer
  const reset = () => {
    timerMap.delete(camId)
    client.publish(
      `nanonvr/cams/${camId}`,
      JSON.stringify({ 'state': 'OFF' }),
      { qos: 2 })
  }
  const newTimer = global.setTimeout(reset, motionDuration)
  timerMap.set(camId, newTimer)
}
