import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NoteModal from '../NoteModal.vue'

const defaultNoteForm = { source: '', text: '' }

describe('NoteModal', () => {
  it('renders the modal title', () => {
    const wrapper = mount(NoteModal, { props: { noteForm: defaultNoteForm } })
    expect(wrapper.text()).toContain('Add note / tip')
  })

  it('renders source and note input fields', () => {
    const wrapper = mount(NoteModal, { props: { noteForm: defaultNoteForm } })
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('pre-fills fields from noteForm prop', () => {
    const wrapper = mount(NoteModal, {
      props: { noteForm: { source: 'John', text: 'A useful tip' } }
    })
    const input = wrapper.find('input')
    const textarea = wrapper.find('textarea')
    expect((input.element as HTMLInputElement).value).toBe('John')
    expect((textarea.element as HTMLTextAreaElement).value).toBe('A useful tip')
  })

  it('emits "close" when Cancel is clicked', async () => {
    const wrapper = mount(NoteModal, { props: { noteForm: defaultNoteForm } })
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('does not emit "save" when text is empty', async () => {
    const wrapper = mount(NoteModal, { props: { noteForm: defaultNoteForm } })
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeFalsy()
  })

  it('emits "save" with form data when text is provided', async () => {
    const wrapper = mount(NoteModal, {
      props: { noteForm: { source: 'Alice', text: 'Remember this tip' } }
    })
    await wrapper.find('.btn-save').trigger('click')
    expect(wrapper.emitted('save')).toBeTruthy()
    const [payload] = wrapper.emitted('save')![0] as [{ source: string; text: string }]
    expect(payload.source).toBe('Alice')
    expect(payload.text).toBe('Remember this tip')
  })

  it('emits "close" when clicking the overlay backdrop', async () => {
    const wrapper = mount(NoteModal, { props: { noteForm: defaultNoteForm } })
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
