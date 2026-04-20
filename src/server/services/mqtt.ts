import { getMqttInfo } from "./hass"
import * as mqtt from 'async-mqtt'
import bus from "./bus"
import { getConfig } from "./config"
import pkg from '../../../package.json'

let client = null

const initialize = async () => {
  let url: string
  try {
    const data = await getMqttInfo()
    url = `mqtt://${data.username}:${data.password}@${data.host}:${data.port}`
  } catch (e) {
    // Ignore silently (not on HASS?)
    return
  }
  try {
    client = mqtt.connect(url)
  } catch (e) {
    console.error('[MQTT] Cannot connect to server:', e)
    return
  }
  client.on('connect', async () => {
    console.log('[MQTT] Connected to server.')
    try {
      await syncDevices()
      await syncStates()
    } catch (e) {
      console.error('[MQTT] Error syncing initial state:', e.message)
    }
  })
}

// Sync device definitions
export const syncDevices = async () => {
  if (!client) return

  // Create the NVR device itself
  await client.publish(
    'homeassistant/device/nanonvr/server/config',
    JSON.stringify({
      device: {
        name: 'NanoNVR Server',
        identifiers: 'nanonvr_server',
        manufacturer: 'NanoNVR',
        sw_version: pkg.version,
      },
      origin: {
        name: 'nanonvr',
        sw_version: pkg.version
      },
      components: {
        state: {
          platform: 'sensor',
          name: 'Status',
          unique_id: "nanonvr_server_status",
        }
      },
      state_topic: 'nanonvr/server/state'
    }),
    { qos: 2, retain: true }
  )

  // Create each camera device
  const cameras = getConfig().cameras
  for (const camera of cameras) {
    await client.publish(
      `homeassistant/device/nanonvr/cam_${camera.uuid}/config`,
      JSON.stringify({
        device: {
          name: `Camera ${camera.name}`,
          manufacturer: 'NanoNVR',
          identifiers: `nanonvr_cam_${camera.uuid}`,
          via_device: 'nanonvr_server'
        },
        origin: {
          name: 'nanonvr',
          sw_version: pkg.version
        },
        components: {
          motion: {
            platform: 'binary_sensor',
            device_class: 'motion',
            name: `Triggered`,
            unique_id: `nanonvr_cam_${camera.uuid}_motion`,
            value_template: "{{ value_json.motion }}"
          },
          recording: {
            platform: 'binary_sensor',
            device_class: 'running',
            name: `Recording`,
            unique_id: `nanonvr_cam_${camera.uuid}_recording`,
            value_template: "{{ value_json.recording }}"
          }
        },
        state_topic: `nanonvr/cams/${camera.uuid}/state`,
      }),
      { qos: 2, retain: true }
    )
  }
}

// Hold each camera status here for simple state sync
interface CamStatus {
  values: { [k: string]: 'ON' | 'OFF' }
  timers: { [k: string]: NodeJS.Timeout }
}
const statusMap = new Map<string, CamStatus>()
const motionDuration = 60 * 1000
const recordingDuration = 180 * 1000

const getStatus = (camId: string) => {
  if (!statusMap.has(camId)) {
    statusMap.set(camId, {
      values: {
        motion: 'OFF',
        recording: 'OFF',
      },
      timers: {}
    })
  }
  return statusMap.get(camId)
}

// Toggles ON a status field with auto-reset
const updateStatus = async (camId: string, field: string, durationMs: number) => {
  const topic = `nanonvr/cams/${camId}/state`
  const status: CamStatus = getStatus(camId)

  if (status.timers[field]) {
    global.clearTimeout(status.timers[field])
  }

  if (status.values[field] !== 'ON') {
    status.values[field] = 'ON'
    try {
      await client.publish(
        topic,
        JSON.stringify(status.values),
        { qos: 2 }
      )
    } catch (e) {
      console.warn('[MQTT] Could not send event:', e)
      throw e
    }
  }

  status.timers[field] = setTimeout(async () => {
    status.values[field] = 'OFF'
    try {
      await client.publish(
        topic,
        JSON.stringify(status.values),
        { qos: 2 }
      )
    } catch (e) {
      console.warn('[MQTT] Could not send event:', e)
      throw e
    }
  }, durationMs)
}

// Sync every device states
export const syncStates = async () => {
  if (!client) return
  const cameras = getConfig().cameras
  for (const camera of cameras) {
    const status = getStatus(camera.uuid)
    await client.publish(
      `nanonvr/cams/${camera.uuid}/state`,
      JSON.stringify(status.values),
      { qos: 2, retain: true }
    )
  }
}

// Send a motion event
export const sendEvent = async (camId: string) => {
  if (!client) return
  updateStatus(camId, 'motion', motionDuration)
}

// Send a recording event
export const sendRecording = async (camId: string) => {
  if (!client) return
  updateStatus(camId, 'recording', recordingDuration)
}

bus.once('configLoaded', initialize)
