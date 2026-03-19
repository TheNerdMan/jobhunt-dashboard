import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecruitersCard from './RecruitersCard.vue'
import type { Recruiter } from '../../composables/useJobHuntData'

const sampleRecruiters: Recruiter[] = [
  { id: 1, name: 'James Thornton', company: 'TalentBridge', role: 'Senior Director', date: '2025-06-01', email: 'james@talentbridge.co.uk', phone: '0333 010 1234', notes: 'Very responsive.' },
  { id: 2, name: 'Sarah Mitchell', company: 'NextStep', role: 'Account Manager', date: '2025-06-10', email: '', phone: '', notes: '' },
]

describe('RecruitersCard', () => {
  it('renders the card title', () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: sampleRecruiters } })
    expect(wrapper.text()).toContain('Recruitment agents')
  })

  it('renders all recruiter names', () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: sampleRecruiters } })
    expect(wrapper.text()).toContain('James Thornton')
    expect(wrapper.text()).toContain('Sarah Mitchell')
  })

  it('renders company and role for each recruiter', () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: sampleRecruiters } })
    expect(wrapper.text()).toContain('TalentBridge')
    expect(wrapper.text()).toContain('Senior Director')
  })

  it('shows email when available', () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: sampleRecruiters } })
    expect(wrapper.text()).toContain('james@talentbridge.co.uk')
  })

  it('does not show email element when email is empty', () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: sampleRecruiters } })
    // Only one email should be shown (Sarah has no email)
    const emailTexts = wrapper.findAll('.rec-row').map(r => r.text())
    expect(emailTexts[1]).not.toContain('@')
  })

  it('renders initials avatar for each recruiter', () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: sampleRecruiters } })
    const avatars = wrapper.findAll('.avatar')
    expect(avatars.length).toBe(sampleRecruiters.length)
    expect(avatars[0].text()).toBe('JT')
    expect(avatars[1].text()).toBe('SM')
  })

  it('renders Edit and Del buttons for each recruiter', () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: sampleRecruiters } })
    expect(wrapper.findAll('.edit-btn').length).toBe(sampleRecruiters.length)
    expect(wrapper.findAll('.del-btn').length).toBe(sampleRecruiters.length)
  })

  it('emits "delete" with the correct index when Del is clicked', async () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: sampleRecruiters } })
    await wrapper.findAll('.del-btn')[0].trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0]).toEqual([0])
  })

  it('renders an empty list without errors', () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: [] } })
    expect(wrapper.find('.rec-row').exists()).toBe(false)
  })

  it('renders the "+ Add" button', () => {
    const wrapper = mount(RecruitersCard, { props: { recruiters: [] } })
    expect(wrapper.find('.add-btn').text()).toContain('Add')
  })
})
