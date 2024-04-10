import React, { createContext, useContext, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PlayPoint } from 'src/types'

interface PlayPointContextType {
  playPoint: PlayPoint
  setPlayPoint: (p: PlayPoint) => void
  playbackTs: number
  setPlaybackTs: (p: number) => void
}

const PlayPointContext = createContext<PlayPointContextType>(null)

export const PlayPointProvider = ({ children }) => {
  const loc = useLocation<any>()
  const [playPoint, setPlayPointInternal] = useState<PlayPoint>(() => {
    if (loc.state?.camId && loc.state?.ts) return { camId: loc.state.camId, ts: parseInt(loc.state.ts) }
  })
  const [playbackTs, setPlaybackTs] = useState<number>()
  const setPlayPoint: (p: PlayPoint) => void = p => {
    setPlayPointInternal(p)
    setPlaybackTs(null)
  }
  return (
    <PlayPointContext.Provider value={{ playPoint, setPlayPoint, playbackTs, setPlaybackTs }}>
      {children}
    </PlayPointContext.Provider>
  )
}

export const usePlayPoint = () => useContext(PlayPointContext).playPoint
export const useSetPlayPoint = () => useContext(PlayPointContext).setPlayPoint
export const usePlaybackTs = () => useContext(PlayPointContext).playbackTs
export const useSetPlaybackTs = () => useContext(PlayPointContext).setPlaybackTs
export const usePlayPointState = () => useContext(PlayPointContext)
