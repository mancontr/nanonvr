import debounce, { sleep } from './debounce'

describe('debounce', () => {
  test('runs immediately when there is no queue', async () => {
    let count = 0
    const cb = () => count++
    const debounced = debounce(cb, 100)

    expect(count).toBe(0)
    debounced()
    expect(count).toBe(1)
  })

  test('calls during delay are queued', async () => {
    let count = 0
    const cb = () => count++
    const debounced = debounce(cb, 100)

    debounced()
    debounced()
    expect(count).toBe(1)
    await sleep(110)
    expect(count).toBe(2)
  })

  test('calls during run are queued', async () => {
    let count = 0
    const cb = async () => {
      await sleep(100)
      count++
    }
    const debounced = debounce(cb, 100)

    debounced()
    expect(count).toBe(0)
    debounced()
    expect(count).toBe(0)
    await sleep(110)
    expect(count).toBe(1)
    await sleep(220) // 100 delay plus 100 before count increase
    expect(count).toBe(2)
  })

  test('multiple queued calls collapse into a single one', async () => {
    let count = 0
    const cb = () => count++
    const debounced = debounce(cb, 100)

    debounced()
    debounced()
    debounced()
    expect(count).toBe(1)
    await sleep(330)
    expect(count).toBe(2)
  })

})
