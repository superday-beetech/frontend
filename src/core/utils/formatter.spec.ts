import { describe, expect, it } from 'vitest'
import { formatDate, formatIDR, formatNumber } from './formatter'

// Intl menyisipkan spasi tak-putus (U+00A0) pada format mata uang; normalkan agar assert stabil.
const norm = (s: string) => s.replace(/ /g, ' ')

describe('formatIDR', () => {
  it('memformat rupiah tanpa desimal', () => {
    expect(norm(formatIDR(1750500))).toBe('Rp 1.750.500')
  })
  it('menganggap null/undefined/NaN/teks acak sebagai 0', () => {
    expect(norm(formatIDR(null))).toBe('Rp 0')
    expect(norm(formatIDR(undefined))).toBe('Rp 0')
    expect(norm(formatIDR(Number.NaN))).toBe('Rp 0')
    expect(norm(formatIDR('abc'))).toBe('Rp 0')
  })
})

describe('formatNumber', () => {
  it('memakai pemisah ribuan id-ID', () => {
    expect(formatNumber(1234567)).toBe('1.234.567')
  })
})

describe('formatDate', () => {
  it('mengembalikan "-" untuk kosong atau tidak valid (tidak melempar)', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate('')).toBe('-')
    expect(formatDate('bukan-tanggal')).toBe('-')
  })
  it('YYYY-MM-DD diparse sebagai tanggal lokal (tidak mundur sehari)', () => {
    expect(formatDate('2026-11-17')).toContain('17')
  })
})
