import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import basename from 'src/util/basename'
import App from 'src/routes'



const routerRoot = () => {
  // Add basename
  return (
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  )
}

export const reactRoot = routerRoot
