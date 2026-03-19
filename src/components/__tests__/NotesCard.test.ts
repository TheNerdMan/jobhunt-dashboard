import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotesCard from '../NotesCard.vue'
import type { Note } from '../../composables/useJobHuntData'

const sampleNotes: Note[] = [
  { id: 1, source: 'James Thornton', text: 'Keep your CV concise.' },
  { id: 2, source: 'Alice Martin', text: 'Research the company beforehand.' },
]

describe('NotesCard', () => {
  it('renders the card title', () => {
    const wrapper = mount(NotesCard, { props: { notes: sampleNotes } })
    expect(wrapper.text()).toContain('Notes & tips')
  })

  it('renders all notes', () => {
    const wrapper = mount(NotesCard, { props: { notes: sampleNotes } })
    expect(wrapper.text()).toContain('Keep your CV concise.')
    expect(wrapper.text()).toContain('Research the company beforehand.')
  })

  it('renders note sources', () => {
    const wrapper = mount(NotesCard, { props: { notes: sampleNotes } })
    expect(wrapper.text()).toContain('James Thornton')
    expect(wrapper.text()).toContain('Alice Martin')
  })

  it('renders numbered labels padded to 2 digits', () => {
    const wrapper = mount(NotesCard, { props: { notes: sampleNotes } })
    const noteNums = wrapper.findAll('.note-num')
    expect(noteNums[0].text()).toBe('01')
    expect(noteNums[1].text()).toBe('02')
  })

  it('renders a Del button per note', () => {
    const wrapper = mount(NotesCard, { props: { notes: sampleNotes } })
    expect(wrapper.findAll('.del-btn').length).toBe(sampleNotes.length)
  })

  it('emits "delete" with the correct index when Del is clicked', async () => {
    const wrapper = mount(NotesCard, { props: { notes: sampleNotes } })
    await wrapper.findAll('.del-btn')[0].trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0]).toEqual([0])
  })

  it('renders an empty list without errors', () => {
    const wrapper = mount(NotesCard, { props: { notes: [] } })
    expect(wrapper.find('.note-item').exists()).toBe(false)
  })

  it('renders the "+ Add" button', () => {
    const wrapper = mount(NotesCard, { props: { notes: sampleNotes } })
    expect(wrapper.find('.add-btn').exists()).toBe(true)
    expect(wrapper.find('.add-btn').text()).toContain('Add')
  })
})
