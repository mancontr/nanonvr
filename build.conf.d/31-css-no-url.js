const CssLoader = require.resolve('css-loader')

const enhancer = (opts = {}, config) => {
  const cssLoader = config.module.rules
    .find(rule => rule.use?.some(loader => loader.loader === CssLoader))
    .use.find(loader => loader.loader === CssLoader)

  cssLoader.options.url = false
  return config
}

module.exports = {
  webpack: enhancer
}
