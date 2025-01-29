const enhancer = (opts = {}, config) => {
  const cssLoader = config.module.rules
    .find(rule => rule.use?.some(loader => loader.loader === 'css-loader'))
    .use.find(loader => loader.loader === 'css-loader')

  cssLoader.options.url = false
  return config
}

module.exports = {
  webpack: enhancer
}
