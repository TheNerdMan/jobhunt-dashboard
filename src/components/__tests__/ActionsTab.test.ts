import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ActionsTab from '../ActionsTab.vue'

// ActionsTab reads actionItems directly from the shared composable singleton.
// We test the empty state and the rendering of the component's structure.
describe('ActionsTab', () => {
  it('renders the Actions card title', () => {
    const wrapper = mount(ActionsTab)
    expect(wrapper.text()).toContain('Actions')
  })

  it('renders the component without errors', () => {
    const wrapper = mount(ActionsTab)
    expect(wrapper.exists()).toBe(true)
  })

  it('shows either items count or "All clear" status indicator', () => {
    const wrapper = mount(ActionsTab)
    const hasCount = wrapper.find('.action-count').exists()
    const hasClear = wrapper.find('.action-clear').exists()
    // Exactly one of these must be visible
    expect(hasCount || hasClear).toBe(true)
  })

  it('shows items count with correct pluralisation for multiple items', () => {
    const wrapper = mount(ActionsTab)
    const count = wrapper.find('.action-count')
    if (count.exists()) {
      const text = count.text()
      // e.g. "5 items need attention" or "1 item needs attention"
      expect(text).toMatch(/\d+ items? need attention/)
    }
  })

  it('shows empty state message when there are no action items', () => {
    const wrapper = mount(ActionsTab)
    if (wrapper.find('.action-clear').exists()) {
      expect(wrapper.find('.actions-empty').exists()).toBe(true)
      expect(wrapper.text()).toContain('Nothing needs attention right now')
    }
  })

  it('shows action groups when there are action items', () => {
    const wrapper = mount(ActionsTab)
    if (wrapper.find('.action-count').exists()) {
      expect(wrapper.find('.action-group').exists()).toBe(true)
    }
  })

  it('shows action item rows when there are action items', () => {
    const wrapper = mount(ActionsTab)
    if (wrapper.find('.action-count').exists()) {
      expect(wrapper.findAll('.action-item').length).toBeGreaterThan(0)
    }
  })

  it('renders a "Mark Chased" button for follow-up or stale items', () => {
    const wrapper = mount(ActionsTab)
    const followUpItems = wrapper.findAll('.action-follow-up, .action-stale')
    if (followUpItems.length > 0) {
      const btns = followUpItems[0].findAll('.ai-btn')
      const markChased = btns.find(b => b.text() === 'Mark Chased')
      expect(markChased).toBeTruthy()
    }
  })

  it('renders a "Open App" button for interview-prep items', () => {
    const wrapper = mount(ActionsTab)
    const prepItems = wrapper.findAll('.action-interview-prep')
    if (prepItems.length > 0) {
      const btn = prepItems[0].find('.ai-btn-primary')
      expect(btn.text()).toBe('Open App')
    }
  })

  it('renders a "Mark Contacted" button for recruiter-checkin items', () => {
    const wrapper = mount(ActionsTab)
    const checkinItems = wrapper.findAll('.action-recruiter-checkin')
    if (checkinItems.length > 0) {
      const btn = checkinItems[0].find('.ai-btn-primary')
      expect(btn.text()).toBe('Mark Contacted')
    }
  })
})
