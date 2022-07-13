import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from 'src/routes'

declare var window: any

const routerRoot = () => {
  // Add basename if we got any
  const basename = window.___INITIAL_STATE__?.base || undefined
  return (
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  )
}

export const reactRoot = routerRoot
