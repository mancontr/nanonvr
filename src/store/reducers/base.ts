import { REQUEST_INIT } from 'universal-scripts'

const base = (state: string = null, action: any) => {
  if (action.type === REQUEST_INIT) {
    const ingress = action.payload.headers['x-ingress-path']
    if (ingress) return ingress
  }
  return state
}

export default base
