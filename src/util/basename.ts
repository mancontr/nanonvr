declare const __CLIENT__: boolean, window: any

const basename = (__CLIENT__
  ? window.frameElement ? new URL(window.frameElement.src).pathname.slice(0, -1) : ''
  : process.env.APP_URL || ('http://localhost:' + (process.env.PORT || '3000'))
)

export default basename
