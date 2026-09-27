import { describe, it, expect } from 'vitest'
import { ISO_COUNTRY_CODES, isValidCountryCode, normalizeCountryCode } from './countryCodes'

describe('ISO_COUNTRY_CODES', () => {
  it('should contain all 249 officially assigned ISO 3166-1 alpha-2 codes', () => {
    expect(ISO_COUNTRY_CODES.size).toBe(249)
  })
})

describe('normalizeCountryCode', () => {
  it('should trim and uppercase the value', () => {
    expect(normalizeCountryCode(' us ')).toBe('US')
    expect(normalizeCountryCode('Gb')).toBe('GB')
  })
})

describe('isValidCountryCode', () => {
  it('should return true for valid ISO codes regardless of case or whitespace', () => {
    expect(isValidCountryCode('US')).toBe(true)
    expect(isValidCountryCode('GB')).toBe(true)
    expect(isValidCountryCode('ES')).toBe(true)
    expect(isValidCountryCode('ax')).toBe(true)
    expect(isValidCountryCode(' zw ')).toBe(true)
  })

  it('should return false for invalid codes', () => {
    expect(isValidCountryCode('')).toBe(false)
    expect(isValidCountryCode('XX')).toBe(false)
    expect(isValidCountryCode('XXX')).toBe(false)
    expect(isValidCountryCode('UK')).toBe(false)
    expect(isValidCountryCode('USA')).toBe(false)
    expect(isValidCountryCode('12')).toBe(false)
  })
})
