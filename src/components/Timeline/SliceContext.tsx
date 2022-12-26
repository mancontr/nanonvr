import React, { createContext, useContext, useState } from 'react'
import { getDayPeriod } from 'src/util/dates'

type Slice = [number, number]

const SliceContext = createContext<[Slice, (p: Slice) => void]>(null)

export const SliceProvider = ({ children }) => {
  const [slice, setSlice] = useState<Slice>(getDayPeriod)
  return (
    <SliceContext.Provider value={[slice, setSlice]}>
      {children}
    </SliceContext.Provider>
  )
}

export const useSlice = () => useContext(SliceContext)[0]
export const useSetSlice = () => useContext(SliceContext)[1]
export const useSliceState = () => useContext(SliceContext)
