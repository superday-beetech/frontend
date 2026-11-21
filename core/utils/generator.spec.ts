import { describe, expect, it } from 'vitest'
import { generateCode, generateSKU, generateUUID } from './generator'

describe('generator', () => {
  it('generateCode: PREFIX-YYYYMMDD-NNNN', () => {
    expect(generateCode('POS', new Date(2026, 10, 17))).toMatch(/^POS-20261117-\d{4}$/)
  })
  it('generateSKU: PREFIX-XXXX-XXXX', () => {
    expect(generateSKU('MED')).toMatch(/^MED-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  })
  it('generateUUID: format v4', () => {
    expect(generateUUID()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })
})
