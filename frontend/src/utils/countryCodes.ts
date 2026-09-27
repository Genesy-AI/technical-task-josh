// ISO 3166-1 alpha-2 officially assigned codes, grouped by first letter.
// Each entry maps a first letter to the valid second letters, e.g. 'U' -> 'AGMSYZ' => UA, UG, UM, US, UY, UZ.
const CODES_BY_FIRST_LETTER: Record<string, string> = {
  A: 'DEFGILMOQRSTUWXZ',
  B: 'ABDEFGHIJLMNOQRSTVWYZ',
  C: 'ACDFGHIKLMNORUVWXYZ',
  D: 'EJKMOZ',
  E: 'CEGHRST',
  F: 'IJKMOR',
  G: 'ABDEFGHILMNPQRSTUWY',
  H: 'KMNRTU',
  I: 'DELMNOQRST',
  J: 'EMOP',
  K: 'EGHIMNPRWYZ',
  L: 'ABCIKRSTUVY',
  M: 'ACDEFGHKLMNOPQRSTUVWXYZ',
  N: 'ACEFGILOPRUZ',
  O: 'M',
  P: 'AEFGHKLMNRSTWY',
  Q: 'A',
  R: 'EOSUW',
  S: 'ABCDEGHIJKLMNORSTVXYZ',
  T: 'CDFGHJKLMNORTVWZ',
  U: 'AGMSYZ',
  V: 'ACEGINU',
  W: 'FS',
  Y: 'ET',
  Z: 'AMW',
}

export const ISO_COUNTRY_CODES: ReadonlySet<string> = new Set(
  Object.entries(CODES_BY_FIRST_LETTER).flatMap(([first, seconds]) =>
    seconds.split('').map((second) => first + second)
  )
)

export const normalizeCountryCode = (value: string): string => value.trim().toUpperCase()

export const isValidCountryCode = (value: string): boolean =>
  ISO_COUNTRY_CODES.has(normalizeCountryCode(value))
