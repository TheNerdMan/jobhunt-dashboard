import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimelineCard from './TimelineCard.vue'
import type { TimelineEvent } from '../../composables/useJobHuntData'

const sampleEvents: TimelineEvent[] = [
  { id: 1, date: '01 Mar', text: 'Started job search', type: 'act' },
  { id: 2, date: '05 Mar', text: 'Got an interview', type: 'win' },
  { id: 3, date: '10 Mar', text: 'Application declined', type: 'warn', auto: true },
]

describe('TimelineCard', () => {
  it('renders the card title', () => {
    const wrapper = mount(TimelineCard, { props: { timeline: sampleEvents } })
    expect(wrapper.text()).toContain('Timeline')
  })

  it('renders all timeline events', () => {
    const wrapper = mount(TimelineCard, { props: { timeline: sampleEvents } })
    expect(wrapper.text()).toContain('Started job search')
    expect(wrapper.text()).toContain('Got an interview')
    expect(wrapper.text()).toContain('Application declined')
  })

  it('renders the correct dates for each event', () => {
    const wrapper = mount(TimelineCard, { props: { timeline: sampleEvents } })
    expect(wrapper.text()).toContain('01 Mar')
    expect(wrapper.text()).toContain('05 Mar')
    expect(wrapper.text()).toContain('10 Mar')
  })

  it('shows the "auto" tag for auto-generated events', () => {
    const wrapper = mount(TimelineCard, { props: { timeline: sampleEvents } })
    expect(wrapper.find('.tl-auto-tag').exists()).toBe(true)
    expect(wrapper.find('.tl-auto-tag').text()).toBe('auto')
  })

  it('does not show "auto" tags when no events have auto:true', () => {
    const manualEvents: TimelineEvent[] = [
      { id: 1, date: '01 Mar', text: 'Manual event', type: 'act' }
    ]
    const wrapper = mount(TimelineCard, { props: { timeline: manualEvents } })
    expect(wrapper.find('.tl-auto-tag').exists()).toBe(false)
  })

  it('renders a Del button per event', () => {
    const wrapper = mount(TimelineCard, { props: { timeline: sampleEvents } })
    const delButtons = wrapper.findAll('.del-btn')
    expect(delButtons.length).toBe(sampleEvents.length)
  })

  it('emits "delete" with the correct index when Del is clicked', async () => {
    const wrapper = mount(TimelineCard, { props: { timeline: sampleEvents } })
    await wrapper.findAll('.del-btn')[1].trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0]).toEqual([1])
  })

  it('renders an empty timeline without errors', () => {
    const wrapper = mount(TimelineCard, { props: { timeline: [] } })
    expect(wrapper.find('.tl-item').exists()).toBe(false)
  })

  it('renders the "+ Add event" button', () => {
    const wrapper = mount(TimelineCard, { props: { timeline: sampleEvents } })
    expect(wrapper.find('.add-btn').exists()).toBe(true)
    expect(wrapper.find('.add-btn').text()).toContain('Add event')
  })
})
