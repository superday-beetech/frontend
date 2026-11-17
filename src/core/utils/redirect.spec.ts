import { describe, expect, it } from 'vitest'
import { isSafeRedirect } from './redirect'

describe('isSafeRedirect', () => {
  it('menerima path internal', () => {
    expect(isSafeRedirect('/')).toBe(true)
    expect(isSafeRedirect('/finance/cashflow?x=1')).toBe(true)
  })
  it('menolak URL eksternal dan variasinya (open redirect)', () => {
    for (const bad of ['//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '', null, undefined, 42]) {
      expect(isSafeRedirect(bad)).toBe(false)
    }
  })
})
