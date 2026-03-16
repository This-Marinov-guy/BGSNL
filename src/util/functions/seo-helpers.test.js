import { describe, it, expect } from 'vitest'
import { getSocialPlatformName, getSocialAriaLabel } from './seo-helpers'

describe('getSocialPlatformName', () => {
  it('returns "Social Media" for falsy input', () => {
    expect(getSocialPlatformName(null)).toBe('Social Media')
    expect(getSocialPlatformName('')).toBe('Social Media')
    expect(getSocialPlatformName(undefined)).toBe('Social Media')
  })

  it('detects Instagram', () => {
    expect(getSocialPlatformName('https://www.instagram.com/bgsnl')).toBe('Instagram')
  })

  it('detects Facebook', () => {
    expect(getSocialPlatformName('https://www.facebook.com/bgsnl')).toBe('Facebook')
  })

  it('detects LinkedIn', () => {
    expect(getSocialPlatformName('https://www.linkedin.com/company/bgsnl')).toBe('LinkedIn')
  })

  it('detects Twitter by twitter.com', () => {
    expect(getSocialPlatformName('https://twitter.com/bgsnl')).toBe('Twitter')
  })

  it('detects Twitter by x.com', () => {
    expect(getSocialPlatformName('https://x.com/bgsnl')).toBe('Twitter')
  })

  it('detects YouTube', () => {
    expect(getSocialPlatformName('https://www.youtube.com/@bgsnl')).toBe('YouTube')
  })

  it('detects WhatsApp', () => {
    expect(getSocialPlatformName('https://whatsapp.com/channel/bgsnl')).toBe('WhatsApp')
  })

  it('detects Email via mailto', () => {
    expect(getSocialPlatformName('mailto:info@bgsnl.nl')).toBe('Email')
  })

  it('returns "Social Media" for unknown url', () => {
    expect(getSocialPlatformName('https://unknown-platform.com')).toBe('Social Media')
  })

  it('is case insensitive', () => {
    expect(getSocialPlatformName('https://INSTAGRAM.COM/bgsnl')).toBe('Instagram')
  })
})

describe('getSocialAriaLabel', () => {
  it('generates label with platform name', () => {
    const label = getSocialAriaLabel('https://facebook.com/bgsnl')
    expect(label).toBe('Visit Bulgarian Society on Facebook')
  })

  it('includes region when provided', () => {
    const label = getSocialAriaLabel('https://instagram.com/bgsnl', 'netherlands')
    expect(label).toContain('netherlands')
    expect(label).toContain('Instagram')
  })

  it('replaces underscore in region with space', () => {
    const label = getSocialAriaLabel('https://linkedin.com/bgsnl', 'the_netherlands')
    expect(label).toContain('the netherlands')
  })

  it('handles missing url gracefully', () => {
    const label = getSocialAriaLabel(null)
    expect(label).toBe('Visit Bulgarian Society on Social Media')
  })
})
