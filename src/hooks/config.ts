import { useSelector } from 'react-redux'

export const useBasePath = (): string => useSelector(s => s.base) || ''
