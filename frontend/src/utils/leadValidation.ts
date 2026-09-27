// Lenient on formatting (spaces, dashes, dots, brackets, leading +, optional "x123"/"ext 123" extension)
// but requires enough digits to be a real number.
const PHONE_PATTERN = /^\+?[\d\s().-]+(\s*(x|ext\.?)\s*\d+)?$/i
const PHONE_EXTENSION_PATTERN = /\s*(x|ext\.?)\s*\d+$/i
const MIN_PHONE_DIGITS = 7
const MAX_YEARS_AT_COMPANY = 100

export const isValidPhoneNumber = (value: string): boolean => {
  const trimmed = value.trim()
  const digitCount = trimmed.replace(PHONE_EXTENSION_PATTERN, '').replace(/\D/g, '').length
  return PHONE_PATTERN.test(trimmed) && digitCount >= MIN_PHONE_DIGITS
}

// Accepts a non-negative whole number (or a string of digits); returns null when invalid.
export const parseYearsAtCompany = (value: unknown): number | null => {
  const years =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^\d+$/.test(value.trim())
        ? Number(value.trim())
        : NaN
  return Number.isInteger(years) && years >= 0 && years <= MAX_YEARS_AT_COMPANY ? years : null
}

// Accepts linkedin.com/in/<profile> URLs with or without protocol or subdomain,
// and returns them as a full https URL; returns null when invalid.
export const normalizeLinkedinUrl = (value: string): string | null => {
  const trimmed = value.trim()
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }

  const host = url.hostname.toLowerCase()
  const isLinkedinHost = host === 'linkedin.com' || host.endsWith('.linkedin.com')
  if (!isLinkedinHost || !/^\/in\/[^/]+/.test(url.pathname)) {
    return null
  }

  url.protocol = 'https:'
  return url.toString()
}
