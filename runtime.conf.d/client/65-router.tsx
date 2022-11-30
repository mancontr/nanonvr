import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { basename } from 'src/config'
import App from 'src/routes'



const routerRoot = () => {
  // Add basename
  console.log('Router basename:', basename)
  return (
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  )
}

export const reactRoot = routerRoot
