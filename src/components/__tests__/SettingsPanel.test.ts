import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SettingsPanel from '../SettingsPanel.vue'

// hex-color-picker is a native custom element — tell Vue Test Utils to skip resolution
const mountOptions = {
  global: {
    config: { isCustomElement: (tag: string) => tag.includes('-') }
  }
}

// SettingsPanel uses the shared composable singleton and the vanilla-colorful
// web component. We test structural rendering and numeric settings controls.
describe('SettingsPanel', () => {
  it('renders the Settings card title', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    expect(wrapper.text()).toContain('Settings')
  })

  it('renders the Follow-up reminder setting row', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    expect(wrapper.text()).toContain('Follow-up reminder')
  })

  it('renders the Stale threshold setting row', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    expect(wrapper.text()).toContain('Stale threshold')
  })

  it('renders the Recruiter check-in setting row', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    expect(wrapper.text()).toContain('Recruiter check-in')
  })

  it('renders three number inputs for the three settings', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    const inputs = wrapper.findAll('input[type="number"]')
    expect(inputs.length).toBe(3)
  })

  it('renders the Source colours section title', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    expect(wrapper.text()).toContain('Source colours')
  })

  it('renders the "Reset to defaults" button', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    expect(wrapper.find('.btn-reset-defaults').exists()).toBe(true)
    expect(wrapper.find('.btn-reset-defaults').text()).toBe('Reset to defaults')
  })

  it('renders descriptions for each setting', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    expect(wrapper.text()).toContain('Days after applying before a follow-up action appears')
    expect(wrapper.text()).toContain('Days after applying before an application is marked stale')
    expect(wrapper.text()).toContain('Days since last contact before a recruiter check-in appears')
  })

  it('shows "days" unit label for each input', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    const unitLabels = wrapper.findAll('.setting-unit')
    expect(unitLabels.length).toBeGreaterThanOrEqual(3)
    unitLabels.slice(0, 3).forEach(u => expect(u.text()).toBe('days'))
  })

  it('shows "no sources" message or source rows depending on app data', () => {
    const wrapper = mount(SettingsPanel, mountOptions)
    const noSources = wrapper.find('.no-sources').exists()
    const hasSources = wrapper.find('.source-color-row').exists()
    expect(noSources || hasSources).toBe(true)
  })
})
