import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecruiterModal from './RecruiterModal.vue'
import type { Recruiter } from '../../composables/useJobHuntData'

const blankForm: Omit<Recruiter, 'id'> = {
  name: '',
  company: '',
  role: '',
  date: '',
  email: '',
  phone: '',
  notes: ''
}

const filledForm: Omit<Recruiter, 'id'> = {
  name: 'Jane Smith',
  company: 'TalentBridge',
  role: 'Senior Consultant',
  date: '2025-06-01',
  email: 'jane@talentbridge.co.uk',
  phone: '07700 900000',
  notes: 'Great contact'
}

describe('RecruiterModal', () => {
  it('shows "Add recruiter" title when editIndex is null', () => {
    const wrapper = mount(RecruiterModal, {
      props: { recForm: blankForm, editIndex: null }
    })
    expect(wrapper.text()).toContain('Add recruiter')
  })

  it('shows "Edit recruiter" title when editIndex is set', () => {
    const wrapper = mount(RecruiterModal, {
      props: { recForm: blankForm, editIndex: 0 }
    })
    expect(wrapper.text()).toContain('Edit recruiter')
  })

  it('pre-fills fields from recForm prop', () => {
    const wrapper = mount(RecruiterModal, {
      props: { recForm: filledForm, editIndex: null }
    })
    const inputs = wrapper.findAll('input')
    const nameInput = inputs[0].element as HTMLInputElement
    expect(nameInput.value).toBe('Jane Smith')
  })

  it('emits "close" when Cancel is clicked', async () => {
    const wrapper = mount(RecruiterModal, {
      props: { recForm: blankForm, editIndex: null }
    })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit "save" when name is empty', async () => {
    const wrapper = mount(RecruiterModal, {
      props: { recForm: blankForm, editIndex: null }
    })
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('emits "save" with form data when name is provided', async () => {
    const wrapper = mount(RecruiterModal, {
      props: { recForm: filledForm, editIndex: null }
    })
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeTruthy()
    const [payload] = wrapper.emitted('save')![0] as [Omit<Recruiter, 'id'>]
    expect(payload.name).toBe('Jane Smith')
    expect(payload.company).toBe('TalentBridge')
  })

  it('emits "close" when clicking the overlay backdrop', async () => {
    const wrapper = mount(RecruiterModal, {
      props: { recForm: blankForm, editIndex: null }
    })
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
