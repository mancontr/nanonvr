// The light build of hls.js shares the types of the full one
declare module 'hls.js/light' {
  export * from 'hls.js'
  export { default } from 'hls.js'
}
