/**
 * Returns a "debounced" copy of callback.
 * This new function cannot be run twice at the same time, and when called,
 * the new execution will only start after delay ms have passed since the
 * previous execution finished.
 * Only one call can be queued at a given time; extra calls will be ignored.
 * @param callback The function to debounce
 * @param delay The minimum delay between runs
 */
const debounce = <T extends Array<any>> (callback: (...args: T) => void, delay: number = 1000): ((...args: T) => void) => {
  let promise = null
  let queued = false

  const debounced = (...args: T) => {
    if (!promise) {
      // We can start running
      promise = Promise.resolve(callback(...args))
        .then(() => sleep(delay))
        .then(() => {
          promise = null
          if (queued) {
            queued = false
            debounced(...args) // Recursively run again
          }
        })
    } else {
      queued = true
    }
  }
  return debounced
}

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

export default debounce
