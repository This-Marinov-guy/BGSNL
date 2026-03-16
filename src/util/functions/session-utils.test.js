import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../defines/common', () => ({
  PERSISTENT_SESSION: false,
  LOCAL_STORAGE_SESSION_LIFE: 'session_life',
}))

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })

import {
  isPersistentSessionEnabled,
  getSessionExpiration,
  isSessionValid,
} from './session-utils'

describe('isPersistentSessionEnabled', () => {
  it('returns false when PERSISTENT_SESSION is false', () => {
    expect(isPersistentSessionEnabled()).toBe(false)
  })
})

describe('getSessionExpiration', () => {
  beforeEach(() => { localStorageMock.clear(); vi.clearAllMocks() })

  it('returns null when no session stored', () => {
    localStorageMock.getItem.mockReturnValueOnce(null)
    expect(getSessionExpiration()).toBeNull()
  })

  it('returns parsed integer from localStorage', () => {
    const future = Date.now() + 100000
    localStorageMock.getItem.mockReturnValueOnce(future.toString())
    expect(getSessionExpiration()).toBe(future)
  })
})

describe('isSessionValid', () => {
  beforeEach(() => { localStorageMock.clear(); vi.clearAllMocks() })

  it('returns false when no expiration stored', () => {
    localStorageMock.getItem.mockReturnValueOnce(null)
    expect(isSessionValid()).toBe(false)
  })

  it('returns true when expiration is in the future', () => {
    const future = Date.now() + 100000
    localStorageMock.getItem.mockReturnValueOnce(future.toString())
    expect(isSessionValid()).toBe(true)
  })

  it('returns false when expiration is in the past', () => {
    const past = Date.now() - 100000
    localStorageMock.getItem.mockReturnValueOnce(past.toString())
    expect(isSessionValid()).toBe(false)
  })
})
