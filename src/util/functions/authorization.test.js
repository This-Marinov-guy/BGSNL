import { describe, it, expect, vi } from 'vitest'

vi.mock('./helpers', () => ({
  hasOverlap: (a, b) => a.some(item => b.includes(item)),
}))

import { decodeJWT, checkAuthorization } from './authorization'

// Helper to create a fake JWT with given payload
const makeJWT = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fakesignature`
}

describe('decodeJWT', () => {
  it('decodes a valid JWT payload', () => {
    const payload = { sub: '123', roles: ['admin'], exp: 9999999999 }
    const token = makeJWT(payload)
    const decoded = decodeJWT(token)
    expect(decoded.sub).toBe('123')
    expect(decoded.roles).toEqual(['admin'])
  })

  it('returns null for invalid token', () => {
    expect(decodeJWT('not.a.token')).toBeNull()
    expect(decodeJWT('')).toBeNull()
    expect(decodeJWT(null)).toBeNull()
  })

  it('returns null for malformed token segments', () => {
    expect(decodeJWT('invalid')).toBeNull()
  })
})

describe('checkAuthorization', () => {
  it('returns false when token is null', () => {
    expect(checkAuthorization(null, ['admin'])).toBe(false)
  })

  it('returns false when token is empty string', () => {
    expect(checkAuthorization('', ['admin'])).toBe(false)
  })

  it('returns true when user has required role', () => {
    const token = makeJWT({ roles: ['admin', 'member'], exp: 9999999999 })
    expect(checkAuthorization(token, ['admin'])).toBe(true)
  })

  it('returns false when user lacks required role', () => {
    const token = makeJWT({ roles: ['member'], exp: 9999999999 })
    expect(checkAuthorization(token, ['admin'])).toBe(false)
  })

  it('returns true for any matching role in list', () => {
    const token = makeJWT({ roles: ['editor'], exp: 9999999999 })
    expect(checkAuthorization(token, ['admin', 'editor'])).toBe(true)
  })
})
