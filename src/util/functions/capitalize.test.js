import { describe, it, expect } from 'vitest'
import {
  capitalizeFirstLetter,
  capitalizeAfterSpace,
  replaceSpaceWithNewLine,
} from './capitalize'

describe('capitalizeFirstLetter', () => {
  it('capitalizes first letter of each word and replaces underscores by default', () => {
    expect(capitalizeFirstLetter('hello_world')).toBe('Hello World')
  })

  it('capitalizes without replacing underscores when flag is false', () => {
    expect(capitalizeFirstLetter('hello world', false)).toBe('Hello world')
  })

  it('returns empty string for falsy input', () => {
    expect(capitalizeFirstLetter('')).toBe('')
    expect(capitalizeFirstLetter(null)).toBe('')
    expect(capitalizeFirstLetter(undefined)).toBe('')
  })

  it('handles multi-word strings', () => {
    expect(capitalizeFirstLetter('foo bar baz', false)).toBe('Foo bar baz')
  })

  it('capitalizes all words when underscores replaced', () => {
    expect(capitalizeFirstLetter('one_two_three')).toBe('One Two Three')
  })
})

describe('capitalizeAfterSpace', () => {
  it('capitalizes every word', () => {
    expect(capitalizeAfterSpace('hello world')).toBe('Hello World')
  })

  it('returns empty string for falsy input', () => {
    expect(capitalizeAfterSpace('')).toBe('')
    expect(capitalizeAfterSpace(null)).toBe('')
  })

  it('handles single word', () => {
    expect(capitalizeAfterSpace('amsterdam')).toBe('Amsterdam')
  })

  it('preserves already capitalized words', () => {
    expect(capitalizeAfterSpace('Hello World')).toBe('Hello World')
  })
})

describe('replaceSpaceWithNewLine', () => {
  it('replaces underscores with spaces', () => {
    expect(replaceSpaceWithNewLine('hello_world')).toBe('hello world')
  })

  it('returns empty string for falsy input', () => {
    expect(replaceSpaceWithNewLine('')).toBe('')
    expect(replaceSpaceWithNewLine(null)).toBe('')
  })

  it('leaves strings without underscores unchanged', () => {
    expect(replaceSpaceWithNewLine('no underscores here')).toBe('no underscores here')
  })
})
