const objectKeyTransform = (transform: (a: string) => string) => {
  const recursive = (val: any): any => {
    if (Array.isArray(val)) return val.map(recursive)
    if (typeof val === 'object') {
      const n = {}
      for (const k in val) {
        const newKey = transform(k)
        n[newKey] = recursive(val[k])
      }
      return n
    }
    return val
  }
  return recursive
}

export default objectKeyTransform
