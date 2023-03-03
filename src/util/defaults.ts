export const mergeDefaults = <T> (value: T, def: T): T => {
  if (Array.isArray(value)) return value
  if (typeof value === 'object') {
    const merge: any = { ...def }
    for (const k in value) {
      merge[k] = mergeDefaults(value[k], def[k])
    }
    return merge
  }
  return value || def
}

// Cleanup any values which are "defaults"
export const cleanDefaults = <T> (value: T, def: T): T => {
  if (Array.isArray(value)) {
    // We assume there are no arrays on the defaults,
    // so it's a default if and only if value is empty
    return value.length ? value : undefined
  }
  if (typeof value === 'object') {
    // Objects are processed recursively
    // If all keys are gone, the object can be gone too
    let anyNonDefault = false
    const clean: any = { }
    for (const k in value) {
      const v = cleanDefaults(value[k], def[k])
      if (v !== null && v !== undefined) {
        anyNonDefault = true
        clean[k] = v
      }
    }
    return anyNonDefault ? clean : undefined
  }
  return value !== def ? value : undefined
}
