import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MetricsGrid from './MetricsGrid.vue'
import type { Metrics } from '../../composables/useJobHuntData'

const defaultMetrics: Metrics = {
  total: 20,
  denied: 3,
  interviews: 2,
  offers: 1,
  active: 12,
  stale: 2,
  rate: 15
}

describe('MetricsGrid', () => {
  it('renders the total applications count', () => {
    const wrapper = mount(MetricsGrid, {
      props: { metrics: defaultMetrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('20')
  })

  it('renders the active count', () => {
    const wrapper = mount(MetricsGrid, {
      props: { metrics: defaultMetrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('12')
  })

  it('renders the interviews count', () => {
    const wrapper = mount(MetricsGrid, {
      props: { metrics: defaultMetrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('2')
  })

  it('renders the denied count', () => {
    const wrapper = mount(MetricsGrid, {
      props: { metrics: defaultMetrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('3')
  })

  it('displays the recruiter count with singular label when count is 1', () => {
    const wrapper = mount(MetricsGrid, {
      props: { metrics: defaultMetrics, recruiterCount: 1, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('1 recruiter engaged')
  })

  it('displays the recruiter count with plural label when count is not 1', () => {
    const wrapper = mount(MetricsGrid, {
      props: { metrics: defaultMetrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('5 recruiters engaged')
  })

  it('displays stale count and staleDays in the active metric sub-text', () => {
    const wrapper = mount(MetricsGrid, {
      props: { metrics: defaultMetrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('2 stale')
    expect(wrapper.text()).toContain('14d')
  })

  it('displays singular "offer" when offers count is 1', () => {
    const metrics = { ...defaultMetrics, offers: 1 }
    const wrapper = mount(MetricsGrid, {
      props: { metrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('1 offer')
    expect(wrapper.text()).not.toContain('1 offers')
  })

  it('displays plural "offers" when offers count is not 1', () => {
    const metrics = { ...defaultMetrics, offers: 3 }
    const wrapper = mount(MetricsGrid, {
      props: { metrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('3 offers')
  })

  it('displays the decline rate', () => {
    const wrapper = mount(MetricsGrid, {
      props: { metrics: defaultMetrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.text()).toContain('15% decline rate')
  })

  it('renders four metric cards', () => {
    const wrapper = mount(MetricsGrid, {
      props: { metrics: defaultMetrics, recruiterCount: 5, staleDays: 14 }
    })
    expect(wrapper.findAll('.metric').length).toBe(4)
  })
})
