import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardHeader from './DashboardHeader.vue'

describe('DashboardHeader', () => {
  it('renders the dashboard title', () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 10, weeksSince: '1.4', demoMode: false }
    })
    expect(wrapper.text()).toContain('Job Hunt Dashboard')
  })

  it('displays the correct day count', () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 42, weeksSince: '6.0', demoMode: false }
    })
    expect(wrapper.text()).toContain('42')
  })

  it('displays the correct weeks since value', () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 14, weeksSince: '2.0', demoMode: false }
    })
    expect(wrapper.text()).toContain('2.0')
  })

  it('shows "Start using" button in demo mode', () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 1, weeksSince: '0.1', demoMode: true }
    })
    expect(wrapper.find('.start-using-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('Start using')
  })

  it('hides "Start using" button outside of demo mode', () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 1, weeksSince: '0.1', demoMode: false }
    })
    expect(wrapper.find('.start-using-btn').exists()).toBe(false)
  })

  it('shows "Reset to defaults" button when not in demo mode', () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 1, weeksSince: '0.1', demoMode: false }
    })
    expect(wrapper.text()).toContain('Reset to defaults')
  })

  it('emits "export" event when Export JSON button is clicked', async () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 1, weeksSince: '0.1', demoMode: false }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('export')).toBeTruthy()
  })

  it('emits "startUsing" event when Start using button is clicked', async () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 1, weeksSince: '0.1', demoMode: true }
    })
    await wrapper.find('.start-using-btn').trigger('click')
    expect(wrapper.emitted('startUsing')).toBeTruthy()
  })

  it('emits "reset" event when Reset to defaults button is clicked', async () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 1, weeksSince: '0.1', demoMode: false }
    })
    const buttons = wrapper.findAll('button')
    const resetBtn = buttons.find(b => b.text() === 'Reset to defaults')
    await resetBtn!.trigger('click')
    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('contains a link to the GitHub repository', () => {
    const wrapper = mount(DashboardHeader, {
      props: { dayCount: 1, weeksSince: '0.1', demoMode: false }
    })
    const link = wrapper.find('a.github-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toContain('github.com/TheNerdMan/jobhunt-dashboard')
  })
})
