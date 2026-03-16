import { describe, it, expect } from 'vitest'
import {
  dateConvertor,
  formatMsToTimer,
  yearsSinceBirthday,
} from './date'

describe('dateConvertor', () => {
  it('returns ISO string by default', () => {
    const result = dateConvertor('2024-06-15', '10:30')
    expect(typeof result).toBe('string')
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('returns timestamp when getAsValue is true', () => {
    const result = dateConvertor('2024-06-15', '10:30', true)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThan(0)
  })

  it('combines date and time correctly', () => {
    const result = dateConvertor('2024-01-01', '12:00')
    expect(result).toContain('2024-01-01')
    expect(result).toContain('12:00')
  })
})

describe('formatMsToTimer', () => {
  it('formats zero ms as 00:00', () => {
    expect(formatMsToTimer(0)).toBe('00:00')
  })

  it('formats 60 seconds', () => {
    expect(formatMsToTimer(60000)).toBe('01:00')
  })

  it('formats 90 seconds', () => {
    expect(formatMsToTimer(90000)).toBe('01:30')
  })

  it('formats 5 minutes 5 seconds', () => {
    expect(formatMsToTimer(305000)).toBe('05:05')
  })

  it('pads single digit minutes and seconds', () => {
    const result = formatMsToTimer(9000) // 9 seconds
    expect(result).toBe('00:09')
  })
})

describe('yearsSinceBirthday', () => {
  it('returns a non-negative number', () => {
    const result = yearsSinceBirthday('1990-01-01')
    expect(result).toBeGreaterThanOrEqual(0)
  })

  it('calculates age correctly for a past date', () => {
    const thirtyYearsAgo = new Date()
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30)
    const result = yearsSinceBirthday(thirtyYearsAgo.toISOString())
    expect(result).toBe(30)
  })
})
