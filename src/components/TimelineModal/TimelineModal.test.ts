import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimelineModal from './TimelineModal.vue'
import type { TimelineEvent } from '../../composables/useJobHuntData'

const defaultTlForm: Omit<TimelineEvent, 'id'> = { date: '', text: '', type: 'act' }

describe('TimelineModal', () => {
  it('renders the modal title', () => {
    const wrapper = mount(TimelineModal, { props: { tlForm: defaultTlForm } })
    expect(wrapper.text()).toContain('Add timeline event')
  })

  it('renders date, type and description fields', () => {
    const wrapper = mount(TimelineModal, { props: { tlForm: defaultTlForm } })
    expect(wrapper.findAll('input').length).toBeGreaterThanOrEqual(1)
    expect(wrapper.find('select').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('pre-fills the form from the tlForm prop', () => {
    const form: Omit<TimelineEvent, 'id'> = { date: '15 Mar', text: 'Interview booked', type: 'win' }
    const wrapper = mount(TimelineModal, { props: { tlForm: form } })
    const dateInput = wrapper.find('input')
    expect((dateInput.element as HTMLInputElement).value).toBe('15 Mar')
    const textarea = wrapper.find('textarea')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('Interview booked')
  })

  it('emits "close" when Cancel is clicked', async () => {
    const wrapper = mount(TimelineModal, { props: { tlForm: defaultTlForm } })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit "save" when date or text is empty', async () => {
    const wrapper = mount(TimelineModal, { props: { tlForm: defaultTlForm } })
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('does not emit "save" when only date is provided', async () => {
    const wrapper = mount(TimelineModal, {
      props: { tlForm: { date: '15 Mar', text: '', type: 'act' } }
    })
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('emits "save" with form data when both date and text are provided', async () => {
    const form: Omit<TimelineEvent, 'id'> = { date: '15 Mar', text: 'Applied to Acme', type: 'act' }
    const wrapper = mount(TimelineModal, { props: { tlForm: form } })
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeTruthy()
    const [payload] = wrapper.emitted('save')![0] as [Omit<TimelineEvent, 'id'>]
    expect(payload.date).toBe('15 Mar')
    expect(payload.text).toBe('Applied to Acme')
    expect(payload.type).toBe('act')
  })

  it('emits "close" when clicking the overlay backdrop', async () => {
    const wrapper = mount(TimelineModal, { props: { tlForm: defaultTlForm } })
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
