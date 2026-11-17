import { describe, expect, it } from 'vitest'
import { can, filterMenus } from './permissions'
import type { DynamicMenu } from '../types'

const menu = (over: Partial<DynamicMenu> & Pick<DynamicMenu, 'id' | 'name'>): DynamicMenu => ({
  parent_id: null,
  title: over.name,
  path: '/' + over.name,
  component_key: null,
  ...over,
})

describe('can', () => {
  it('cocok bila izin dimiliki', () => {
    expect(can(['a.view'], 'a.view')).toBe(true)
    expect(can(['a.view'], 'a.edit')).toBe(false)
  })
  it('daftar izin: salah satu cukup', () => {
    expect(can(['a.view'], ['x', 'a.view'])).toBe(true)
    expect(can([], ['x', 'y'])).toBe(false)
  })
  it('wildcard * = semua akses', () => {
    expect(can(['*'], 'apa.saja')).toBe(true)
  })
})

describe('filterMenus', () => {
  const allowed = (granted: string[]) => (required: string[]) => can(granted, required)

  it('menyembunyikan item tanpa izin', () => {
    const items = [menu({ id: 1, name: 'A', component_key: 'a/AView' }), menu({ id: 2, name: 'B', component_key: 'b/BView', permissions: ['b.view'] })]
    expect(filterMenus(items, allowed([])).map((m) => m.name)).toEqual(['A'])
    expect(filterMenus(items, allowed(['b.view'])).map((m) => m.name)).toEqual(['A', 'B'])
  })
  it('membuang cabang yang semua anaknya tersembunyi', () => {
    const items = [menu({ id: 1, name: 'Grup', children: [menu({ id: 2, name: 'Anak', component_key: 'g/Anak', permissions: ['g.view'] })] })]
    expect(filterMenus(items, allowed([]))).toEqual([])
    expect(filterMenus(items, allowed(['g.view']))[0]?.children?.map((m) => m.name)).toEqual(['Anak'])
  })
  it('cabang yang punya halaman sendiri tetap tampil meski anaknya kosong', () => {
    const items = [menu({ id: 1, name: 'Induk', component_key: 'i/Induk', children: [menu({ id: 2, name: 'X', permissions: ['x'] })] })]
    expect(filterMenus(items, allowed([]))[0]?.children).toEqual([])
  })
})
