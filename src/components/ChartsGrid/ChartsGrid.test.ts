import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ChartsGrid from './ChartsGrid.vue'
import type { SourceLegendItem } from '../../composables/useJobHuntData'

const sampleLegend: SourceLegendItem[] = [
  { label: 'LinkedIn', count: 5, color: '#4f8ef7' },
  { label: 'Direct', count: 3, color: '#3fcf8e' },
]

describe('ChartsGrid', () => {
  it('renders the chart section titles', () => {
    const wrapper = mount(ChartsGrid, { props: { sourceLegend: sampleLegend } })
    expect(wrapper.text()).toContain('Applications by date')
    expect(wrapper.text()).toContain('By source')
  })

  it('renders legend items for each source', () => {
    const wrapper = mount(ChartsGrid, { props: { sourceLegend: sampleLegend } })
    expect(wrapper.text()).toContain('LinkedIn')
    expect(wrapper.text()).toContain('Direct')
  })

  it('renders legend counts for each source', () => {
    const wrapper = mount(ChartsGrid, { props: { sourceLegend: sampleLegend } })
    expect(wrapper.text()).toContain('5')
    expect(wrapper.text()).toContain('3')
  })

  it('applies the correct background color to legend dots', () => {
    const wrapper = mount(ChartsGrid, { props: { sourceLegend: sampleLegend } })
    const dots = wrapper.findAll('.legend-dot')
    expect(dots.length).toBe(sampleLegend.length)
    expect((dots[0].element as HTMLElement).style.background).toBe('#4f8ef7')
    expect((dots[1].element as HTMLElement).style.background).toBe('#3fcf8e')
  })

  it('renders two canvas elements for the charts', () => {
    const wrapper = mount(ChartsGrid, { props: { sourceLegend: sampleLegend } })
    expect(wrapper.findAll('canvas').length).toBe(2)
  })

  it('renders an empty legend when sourceLegend is empty', () => {
    const wrapper = mount(ChartsGrid, { props: { sourceLegend: [] } })
    expect(wrapper.findAll('.legend-item').length).toBe(0)
  })

  it('emits "refresh" when mounted', () => {
    const wrapper = mount(ChartsGrid, { props: { sourceLegend: sampleLegend } })
    expect(wrapper.emitted('refresh')).toBeTruthy()
  })
})
