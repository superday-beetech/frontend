import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, getErrorStatus, getFieldErrors, isCancelledError } from './errors'

const apiError = (status: number, data: object) => ({ response: { status, data } })

describe('error helpers', () => {
  it('membaca status & pesan dari respons API', () => {
    const err = apiError(422, { message: 'Validasi gagal' })
    expect(getErrorStatus(err)).toBe(422)
    expect(getApiErrorMessage(err)).toBe('Validasi gagal')
  })
  it('memakai fallback bila bukan error API', () => {
    expect(getErrorStatus(new Error('x'))).toBeUndefined()
    expect(getApiErrorMessage(null, 'Gagal')).toBe('Gagal')
  })
  it('mengambil pesan pertama per field', () => {
    const err = apiError(422, { errors: { email: ['Email wajib.', 'Format salah.'], password: 'Wajib.' } })
    expect(getFieldErrors(err)).toEqual({ email: 'Email wajib.', password: 'Wajib.' })
    expect(getFieldErrors(undefined)).toEqual({})
  })
  it('mengenali request yang dibatalkan', () => {
    expect(isCancelledError({ code: 'ERR_CANCELED' })).toBe(true)
    expect(isCancelledError(new Error('x'))).toBe(false)
  })
})
