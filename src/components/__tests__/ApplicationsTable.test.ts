import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ApplicationsTable from '../ApplicationsTable.vue'
import type { JobApplication } from '../../composables/useJobHuntData'

const today = new Date().toISOString().slice(0, 10)

const sampleApps: JobApplication[] = [
  { id: 1, company: 'Acme', title: 'Engineer', source: 'LinkedIn', status: 'Applied', location: 'Remote', salary: '£60k', date: today, link: '', notes: '' },
  { id: 2, company: 'BetaCorp', title: 'Developer', source: 'Direct', status: 'Interview', location: 'London', salary: '£80k', date: today, link: '', notes: '' },
  { id: 3, company: 'GammaTech', title: 'Architect', source: 'Recruiter', status: 'Denied', location: 'Manchester', salary: '£90k', date: today, link: '', notes: '' },
]

describe('ApplicationsTable', () => {
  beforeEach(() => {
    // Reset view mode so each test starts from a clean table view
    localStorage.removeItem('jhd_view_mode')
  })
  it('renders the Applications card title', () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    expect(wrapper.text()).toContain('Applications')
  })

  it('renders a row for each application in table view', () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(sampleApps.length)
  })

  it('renders company names in the table', () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    expect(wrapper.text()).toContain('Acme')
    expect(wrapper.text()).toContain('BetaCorp')
    expect(wrapper.text()).toContain('GammaTech')
  })

  it('renders the status tag for each application', () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    const tags = wrapper.findAll('.tag')
    expect(tags.length).toBeGreaterThanOrEqual(sampleApps.length)
  })

  it('shows Table and Board toggle buttons', () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    expect(wrapper.text()).toContain('Table')
    expect(wrapper.text()).toContain('Board')
  })

  it('shows status filter buttons in table view', () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    expect(wrapper.text()).toContain('All')
    expect(wrapper.text()).toContain('Applied')
    expect(wrapper.text()).toContain('Interview')
  })

  it('switches to board view when Board button is clicked', async () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    const boardBtn = wrapper.findAll('.vt-btn').find(b => b.text() === 'Board')
    await boardBtn!.trigger('click')
    expect(wrapper.find('.kanban-board').exists()).toBe(true)
    expect(wrapper.find('.table-wrap').exists()).toBe(false)
  })

  it('renders kanban columns in board view', async () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    await wrapper.findAll('.vt-btn').find(b => b.text() === 'Board')!.trigger('click')
    expect(wrapper.findAll('.kanban-col').length).toBeGreaterThan(0)
  })

  it('emits "delete" with the correct index when Del is clicked', async () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    await wrapper.findAll('.del-btn')[0].trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')![0]).toEqual([0])
  })

  it('renders the "+ Add" button', () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    expect(wrapper.find('.add-btn').text()).toContain('Add')
  })

  it('renders an empty table when no apps are passed', () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: [] } })
    expect(wrapper.findAll('tbody tr').length).toBe(0)
  })

  it('shows all column headers in table view', () => {
    const wrapper = mount(ApplicationsTable, { props: { apps: sampleApps } })
    const headers = ['Company', 'Role', 'Source', 'Location', 'Salary', 'Date', 'Status']
    headers.forEach(h => expect(wrapper.text()).toContain(h))
  })
})
