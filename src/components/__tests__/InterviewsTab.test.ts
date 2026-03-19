import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InterviewsTab from '../InterviewsTab.vue'
import type { JobApplication } from '../../composables/useJobHuntData'

const today = new Date().toISOString().slice(0, 10)

// Mix of statuses — only Interview ones should be counted/rendered by the parent before passing to this component
const allApps: JobApplication[] = [
  { id: 1, company: 'Acme', title: 'Engineer', source: 'LinkedIn', status: 'Interview', location: 'Remote', salary: '£70k', date: today, link: '', notes: '' },
  { id: 2, company: 'BetaCorp', title: 'Developer', source: 'Direct', status: 'Interview', location: 'London', salary: '£80k', date: today, link: '', notes: '' },
  { id: 3, company: 'GammaCo', title: 'Designer', source: 'Indeed', status: 'Applied', location: 'Remote', salary: '£60k', date: today, link: '', notes: '' },
  { id: 4, company: 'DeltaTech', title: 'PM', source: 'LinkedIn', status: 'Offer', location: 'Manchester', salary: '£90k', date: today, link: '', notes: '' },
]

// Simulate what the parent (App.vue) does: pass only Interview apps to this component
const interviewApps = allApps.filter(a => a.status === 'Interview')

describe('InterviewsTab', () => {
  it('renders the Interviews heading', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: interviewApps } })
    expect(wrapper.text()).toContain('Interviews')
  })

  it('displays the count of interview applications, not the total app count', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: interviewApps } })
    // interviewApps has 2 entries; allApps has 4 — count must reflect only what was passed
    expect(wrapper.find('.interview-count').text()).toBe('2')
    expect(interviewApps.length).toBeLessThan(allApps.length)
  })

  it('renders an InterviewCard for each app', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: interviewApps } })
    expect(wrapper.findAll('.interview-card').length).toBe(interviewApps.length)
  })

  it('shows empty state when there are no interview apps', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: [] } })
    expect(wrapper.text()).toContain('No active interviews')
    expect(wrapper.text()).toContain('Applications with Interview status will appear here.')
  })

  it('does not show empty state when apps are present', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: interviewApps } })
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('shows a count of 0 when no apps are present', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: [] } })
    expect(wrapper.find('.interview-count').text()).toBe('0')
  })

  it('renders the "+ Add" button', () => {
    const wrapper = mount(InterviewsTab, { props: { apps: interviewApps } })
    expect(wrapper.find('.add-btn').text()).toContain('Add')
  })
})
