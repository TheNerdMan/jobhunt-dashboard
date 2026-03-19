import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InterviewCard from './InterviewCard.vue'
import type { JobApplication } from '../../composables/useJobHuntData'

const today = new Date().toISOString().slice(0, 10)

const sampleApp: JobApplication = {
  id: 1,
  company: 'Acme Corp',
  title: 'Senior Engineer',
  source: 'LinkedIn',
  status: 'Interview',
  location: 'Remote',
  salary: '£75k',
  date: today,
  link: '',
  notes: 'Some general notes',
  appNotes: { research: 'Some research', interviewPrep: '', questionsToAsk: '', interviewNotes: '' }
}

describe('InterviewCard', () => {
  it('renders the company name', () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: null }
    })
    expect(wrapper.text()).toContain('Acme Corp')
  })

  it('renders the job title', () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: null }
    })
    expect(wrapper.text()).toContain('Senior Engineer')
  })

  it('renders salary and location chips', () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: null }
    })
    expect(wrapper.text()).toContain('£75k')
    expect(wrapper.text()).toContain('Remote')
  })

  it('renders the company as a link when app.link is provided', () => {
    const appWithLink = { ...sampleApp, link: 'https://example.com/job' }
    const wrapper = mount(InterviewCard, {
      props: { app: appWithLink, idx: 0, highlightedId: null }
    })
    const link = wrapper.find('.ic-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://example.com/job')
  })

  it('renders company as plain text when app.link is empty', () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: null }
    })
    expect(wrapper.find('.ic-link').exists()).toBe(false)
  })

  it('renders note pills (N, R, P, Q, D)', () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: null }
    })
    const pills = wrapper.findAll('.ic-pill')
    expect(pills.length).toBe(5)
  })

  it('marks the Research pill as filled when research notes exist', () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: null }
    })
    const pills = wrapper.findAll('.ic-pill')
    const rPill = pills.find(p => p.text() === 'R')
    expect(rPill!.classes()).toContain('filled')
  })

  it('expands the card when the header is clicked', async () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: null }
    })
    expect(wrapper.find('.ic-detail').exists()).toBe(false)
    await wrapper.find('.ic-header').trigger('click')
    expect(wrapper.find('.ic-detail').exists()).toBe(true)
  })

  it('emits "delete" when Remove button is clicked (quick actions)', async () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: null }
    })
    await wrapper.find('.ic-btn-delete').trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0]).toEqual([0])
  })

  it('emits "edit" when Edit button is clicked in quick actions', async () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: null }
    })
    await wrapper.find('.ic-btn-edit').trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
  })

  it('applies the highlighted class when highlightedId matches app.id', () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: sampleApp.id }
    })
    expect(wrapper.find('.interview-card').classes()).toContain('highlighted')
  })

  it('does not apply the highlighted class when highlightedId does not match', () => {
    const wrapper = mount(InterviewCard, {
      props: { app: sampleApp, idx: 0, highlightedId: 999 }
    })
    expect(wrapper.find('.interview-card').classes()).not.toContain('highlighted')
  })
})
