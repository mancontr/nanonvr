const enhancer = (_, config) => {
  if (config.target === 'node') {
    // Contrary to what universal usually does,
    // we want to bundle all dev dependencies on Node too
    config.externals = [
      require('webpack-node-externals')({
        modulesFromFile: {
          includeInBundle: ['devDependencies'],
          excludeFromBundle: ['dependencies']
        },
      })
    ]
  }
  return config
}

module.exports = {
  webpack: enhancer
}
