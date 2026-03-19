import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ApplicationModal from './ApplicationModal.vue'
import type { JobApplication } from '../../composables/useJobHuntData'

const blankForm: Omit<JobApplication, 'id'> = {
  company: '',
  title: '',
  source: '',
  status: 'Applied',
  location: '',
  salary: '',
  date: new Date().toISOString().slice(0, 10),
  link: '',
  notes: '',
  appNotes: { research: '', interviewPrep: '', questionsToAsk: '', interviewNotes: '' }
}

const filledForm: Omit<JobApplication, 'id'> = {
  ...blankForm,
  company: 'Acme Corp',
  title: 'Senior Engineer',
  source: 'LinkedIn',
  status: 'Applied',
  location: 'Remote',
  salary: '£70k',
}

describe('ApplicationModal', () => {
  it('shows "Add application" title when editIndex is null', () => {
    const wrapper = mount(ApplicationModal, {
      props: { appForm: blankForm, editIndex: null }
    })
    expect(wrapper.text()).toContain('Add application')
  })

  it('shows "Edit application" title when editIndex is set', () => {
    const wrapper = mount(ApplicationModal, {
      props: { appForm: blankForm, editIndex: 0 }
    })
    expect(wrapper.text()).toContain('Edit application')
  })

  it('shows the URL quick-add field only when adding (editIndex is null)', () => {
    const addWrapper = mount(ApplicationModal, {
      props: { appForm: blankForm, editIndex: null }
    })
    expect(addWrapper.find('.quick-add').exists()).toBe(true)

    const editWrapper = mount(ApplicationModal, {
      props: { appForm: blankForm, editIndex: 0 }
    })
    expect(editWrapper.find('.quick-add').exists()).toBe(false)
  })

  it('pre-fills company and title fields from appForm prop', () => {
    const wrapper = mount(ApplicationModal, {
      props: { appForm: filledForm, editIndex: null }
    })
    const inputs = wrapper.findAll('input')
    const companyInput = inputs.find(
      i => (i.element as HTMLInputElement).placeholder === 'Acme Corp'
    )
    // Check that a company input exists and its value is correct
    const companyEl = wrapper.find('input[placeholder="Acme Corp"]')
    expect(companyEl.exists()).toBe(true)
    expect((companyEl.element as HTMLInputElement).value).toBe('Acme Corp')
  })

  it('emits "close" when Cancel is clicked', async () => {
    const wrapper = mount(ApplicationModal, {
      props: { appForm: blankForm, editIndex: null }
    })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit "save" when company is empty', async () => {
    const wrapper = mount(ApplicationModal, {
      props: { appForm: blankForm, editIndex: null }
    })
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('emits "save" with form data when company is provided', async () => {
    const wrapper = mount(ApplicationModal, {
      props: { appForm: filledForm, editIndex: null }
    })
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeTruthy()
    const [payload] = wrapper.emitted('save')![0] as [Omit<JobApplication, 'id'>, string | undefined]
    expect(payload.company).toBe('Acme Corp')
    expect(payload.title).toBe('Senior Engineer')
  })

  it('passes previousStatus through the save emit', async () => {
    const wrapper = mount(ApplicationModal, {
      props: { appForm: filledForm, editIndex: 0, previousStatus: 'Applied' }
    })
    await wrapper.find('.btn-save').trigger('click')
    const [, prevStatus] = wrapper.emitted('save')![0] as [Omit<JobApplication, 'id'>, string | undefined]
    expect(prevStatus).toBe('Applied')
  })

  it('renders notes tabs', () => {
    const wrapper = mount(ApplicationModal, {
      props: { appForm: blankForm, editIndex: null }
    })
    expect(wrapper.text()).toContain('Notes')
    expect(wrapper.text()).toContain('Research')
    expect(wrapper.text()).toContain('Interview Prep')
  })

  it('emits "close" when clicking the overlay backdrop', async () => {
    const wrapper = mount(ApplicationModal, {
      props: { appForm: blankForm, editIndex: null }
    })
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
