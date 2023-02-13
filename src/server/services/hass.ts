import fetch from 'node-fetch'

const token: string = process.env.SUPERVISOR_TOKEN

export const apiCall = async (route: string) => {
  if (!token) throw new Error('[HASS] No token available')
  const response = await fetch('http://supervisor' + route, {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  if (!response.ok) throw new Error('[HASS] Bad response: ' + response.status)
  const data = await response.json()
  return data.data || data
}

export interface HassSelfInfo {
  ingress_url: string
  // ... and many more
}

export const getSelfInfo = (): Promise<HassSelfInfo> => apiCall('/addons/self/info')

export interface HassMqtt {
  host: string
  port: number
  username: string
  password: string
}

export const getMqttInfo = (): Promise<HassMqtt> => apiCall('/services/mqtt')

export interface HassHAInfo {
  internal_url: string
  // ... and many more
}

export const getHaInfo = (): Promise<HassHAInfo> => apiCall('/core/api/config')
