import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InterviewsTab from '../InterviewsTab.vue'
import type { JobApplication } from '../../composables/useJobHuntData'

const today = new Date().toISOString().slice(0, 10)

const sampleApps: JobApplication[] = [
  { id: 1, company: 'Acme', title: 'Engineer', source: 'LinkedIn', status: 'Interview', location: 'Remote', salary: '£70k', date: today, link: '', notes: '' },
  { id: 2, company: 'BetaCorp', title: 'Developer', source: 'Direct', status: 'Interview', location: 'London', salary: '£80k', date: today, link: '', notes: '' },
]

describe('InterviewsTab', () => {
  it('renders the Interviews heading', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: sampleApps } })
    expect(wrapper.text()).toContain('Interviews')
  })

  it('displays the count of interview applications', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: sampleApps } })
    expect(wrapper.find('.interview-count').text()).toBe('2')
  })

  it('renders an InterviewCard for each app', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: sampleApps } })
    expect(wrapper.findAll('.interview-card').length).toBe(sampleApps.length)
  })

  it('shows empty state when there are no interview apps', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: [] } })
    expect(wrapper.text()).toContain('No active interviews')
    expect(wrapper.text()).toContain('Applications with Interview status will appear here.')
  })

  it('does not show empty state when apps are present', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: sampleApps } })
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('shows a count of 0 when no apps are present', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: [] } })
    expect(wrapper.find('.interview-count').text()).toBe('0')
  })

  it('renders the "+ Add" button', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: sampleApps } })
    expect(wrapper.find('.add-btn').text()).toContain('Add')
  })
})
