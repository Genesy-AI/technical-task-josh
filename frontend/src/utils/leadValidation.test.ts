import { describe, it, expect } from 'vitest'
import { isValidPhoneNumber, normalizeLinkedinUrl, parseYearsAtCompany } from './leadValidation'

describe('isValidPhoneNumber', () => {
  it('should accept common formats, including extensions', () => {
    expect(isValidPhoneNumber('+1-280-754-0462x2154')).toBe(true)
    expect(isValidPhoneNumber('001-464-312-8555')).toBe(true)
    expect(isValidPhoneNumber('(731)123-9702')).toBe(true)
    expect(isValidPhoneNumber('063.430.8860x4762')).toBe(true)
    expect(isValidPhoneNumber('7549075690')).toBe(true)
    expect(isValidPhoneNumber('+44 20 7946 0958')).toBe(true)
    expect(isValidPhoneNumber('555-123-4567 ext. 89')).toBe(true)
  })

  it('should reject values that are not phone numbers', () => {
    expect(isValidPhoneNumber('')).toBe(false)
    expect(isValidPhoneNumber('call me')).toBe(false)
    expect(isValidPhoneNumber('555-CALL-NOW')).toBe(false)
    expect(isValidPhoneNumber('12345')).toBe(false)
    expect(isValidPhoneNumber('12345x6789')).toBe(false)
  })
})

describe('parseYearsAtCompany', () => {
  it('should parse non-negative whole numbers', () => {
    expect(parseYearsAtCompany('0')).toBe(0)
    expect(parseYearsAtCompany(' 15 ')).toBe(15)
    expect(parseYearsAtCompany(10)).toBe(10)
    expect(parseYearsAtCompany('100')).toBe(100)
  })

  it('should return null for invalid values', () => {
    expect(parseYearsAtCompany('')).toBeNull()
    expect(parseYearsAtCompany('-1')).toBeNull()
    expect(parseYearsAtCompany('2.5')).toBeNull()
    expect(parseYearsAtCompany('ten')).toBeNull()
    expect(parseYearsAtCompany('101')).toBeNull()
    expect(parseYearsAtCompany(2.5)).toBeNull()
    expect(parseYearsAtCompany(null)).toBeNull()
    expect(parseYearsAtCompany(undefined)).toBeNull()
  })
})

describe('normalizeLinkedinUrl', () => {
  it('should accept profile URLs and return them as https', () => {
    expect(normalizeLinkedinUrl('https://www.linkedin.com/in/ada-lovelace')).toBe(
      'https://www.linkedin.com/in/ada-lovelace'
    )
    expect(normalizeLinkedinUrl('linkedin.com/in/ada-lovelace')).toBe('https://linkedin.com/in/ada-lovelace')
    expect(normalizeLinkedinUrl('http://uk.linkedin.com/in/ada/')).toBe('https://uk.linkedin.com/in/ada/')
  })

  it('should return null for non-profile or non-LinkedIn URLs', () => {
    expect(normalizeLinkedinUrl('')).toBeNull()
    expect(normalizeLinkedinUrl('not a url')).toBeNull()
    expect(normalizeLinkedinUrl('https://www.linkedin.com/company/enginy')).toBeNull()
    expect(normalizeLinkedinUrl('https://www.linkedin.com/in/')).toBeNull()
    expect(normalizeLinkedinUrl('https://linkedin.com.evil.com/in/ada')).toBeNull()
    expect(normalizeLinkedinUrl('https://notlinkedin.com/in/ada')).toBeNull()
    expect(normalizeLinkedinUrl('ftp://linkedin.com/in/ada')).toBeNull()
  })
})
