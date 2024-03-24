import React, { createContext, useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PlayPoint } from 'src/types'

const PlayPointContext = createContext<[PlayPoint, (p: PlayPoint) => void]>(null)

export const PlayPointProvider = ({ children }) => {
  const loc = useLocation<any>()
  const [playPoint, setPlayPoint] = useState<PlayPoint>(() => {
    if (loc.state?.camId && loc.state?.ts) return { camId: loc.state.camId, ts: parseInt(loc.state.ts) }
  })
  return (
    <PlayPointContext.Provider value={[playPoint, setPlayPoint]}>
      {children}
    </PlayPointContext.Provider>
  )
}

export const usePlayPoint = () => useContext(PlayPointContext)[0]
export const useSetPlayPoint = () => useContext(PlayPointContext)[1]
export const usePlayPointState = () => useContext(PlayPointContext)
