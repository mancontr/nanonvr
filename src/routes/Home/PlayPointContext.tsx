import React, { createContext, useContext, useState } from 'react'
import { PlayPoint } from 'src/types'

const PlayPointContext = createContext<[PlayPoint, (p: PlayPoint) => void]>(null)

export const PlayPointProvider = ({ children }) => {
  const [playPoint, setPlayPoint] = useState<PlayPoint>()
  return (
    <PlayPointContext.Provider value={[playPoint, setPlayPoint]}>
      {children}
    </PlayPointContext.Provider>
  )
}

export const usePlayPoint = () => useContext(PlayPointContext)[0]
export const useSetPlayPoint = () => useContext(PlayPointContext)[1]
export const usePlayPointState = () => useContext(PlayPointContext)
