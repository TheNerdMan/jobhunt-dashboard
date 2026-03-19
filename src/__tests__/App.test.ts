import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { computed, ref } from 'vue'
import App from '../App.vue'
import type { JobApplication } from '../composables/useJobHuntData'

// Controllable state for the composable mock
const mockState = vi.hoisted(() => ({
  apps: [] as JobApplication[],
  actionItems: [] as { type: string; company: string; daysOverdue: number; description: string }[],
}))

vi.mock('../composables/useJobHuntData', () => ({
  useJobHuntData: () => ({
    apps: computed(() => mockState.apps),
    recruiters: ref([]),
    timeline: ref([]),
    notes: ref([]),
    settings: ref({ followUpDays: 7, staleDays: 14, recruiterCheckInDays: 30, sourceColors: {} }),
    demoMode: ref(false),
    dayCount: ref(0),
    weeksSince: ref('0'),
    metrics: computed(() => ({ total: 0, denied: 0, interviews: 0, offers: 0, active: 0, stale: 0, rate: 0 })),
    sourceLegend: ref([]),
    actionItems: computed(() => mockState.actionItems),
    refreshCharts: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
    resetToDefaults: vi.fn(),
    startUsing: vi.fn(),
    nextId: vi.fn(() => 1),
    addAutoTimelineEvent: vi.fn(),
    ensureSourceColor: vi.fn(),
    STALE_DAYS: 14,
  }),
}))

const today = new Date().toISOString().slice(0, 10)

const makeApp = (id: number, status: string): JobApplication => ({
  id,
  company: `Company ${id}`,
  title: 'Engineer',
  source: 'LinkedIn',
  status,
  location: 'Remote',
  salary: '£70k',
  date: today,
  link: '',
  notes: '',
})

describe('App.vue', () => {
  beforeEach(() => {
    mockState.apps = []
    mockState.actionItems = []
  })

  it('renders all 7 tab buttons', () => {
    const wrapper = shallowMount(App)
    const tabs = wrapper.findAll('.tab-btn')
    expect(tabs).toHaveLength(7)
    const labels = tabs.map(t => t.text().trim())
    expect(labels).toContain('Home')
    expect(labels).toContain('Applications')
    expect(labels).toContain('Timeline')
    expect(labels).toContain('Interviews')
    expect(labels).toContain('Recruiters')
    expect(labels).toContain('Actions')
    expect(labels).toContain('Settings')
  })

  it('defaults to the home tab with the active class', () => {
    const wrapper = shallowMount(App)
    const activeBtn = wrapper.find('.tab-btn.active')
    expect(activeBtn.exists()).toBe(true)
    expect(activeBtn.text()).toContain('Home')
  })

  it('renders MetricsGrid and ChartsGrid on the home tab by default', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.findComponent({ name: 'MetricsGrid' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ChartsGrid' }).exists()).toBe(true)
  })

  it('renders ApplicationsTable when the Applications tab is clicked', async () => {
    const wrapper = shallowMount(App)
    await wrapper.find('.tab-btn:nth-child(2)').trigger('click')
    expect(wrapper.findComponent({ name: 'ApplicationsTable' }).exists()).toBe(true)
  })

  it('renders TimelineCard when the Timeline tab is clicked', async () => {
    const wrapper = shallowMount(App)
    await wrapper.find('.tab-btn:nth-child(3)').trigger('click')
    expect(wrapper.findComponent({ name: 'TimelineCard' }).exists()).toBe(true)
  })

  it('renders InterviewsTab when the Interviews tab is clicked', async () => {
    const wrapper = shallowMount(App)
    await wrapper.find('.tab-btn:nth-child(4)').trigger('click')
    expect(wrapper.findComponent({ name: 'InterviewsTab' }).exists()).toBe(true)
  })

  it('renders RecruitersCard and NotesCard when the Recruiters tab is clicked', async () => {
    const wrapper = shallowMount(App)
    await wrapper.find('.tab-btn:nth-child(5)').trigger('click')
    expect(wrapper.findComponent({ name: 'RecruitersCard' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'NotesCard' }).exists()).toBe(true)
  })

  it('renders ActionsTab when the Actions tab is clicked', async () => {
    const wrapper = shallowMount(App)
    await wrapper.find('.tab-btn:nth-child(6)').trigger('click')
    expect(wrapper.findComponent({ name: 'ActionsTab' }).exists()).toBe(true)
  })

  it('renders SettingsPanel when the Settings tab is clicked', async () => {
    const wrapper = shallowMount(App)
    await wrapper.find('.tab-btn:nth-child(7)').trigger('click')
    expect(wrapper.findComponent({ name: 'SettingsPanel' }).exists()).toBe(true)
  })

  it('shows a badge on the Actions tab when there are action items', () => {
    mockState.actionItems = [{ type: 'follow-up', company: 'Acme', daysOverdue: 3, description: 'Follow up' }]
    const wrapper = shallowMount(App)
    expect(wrapper.find('.tab-badge').exists()).toBe(true)
    expect(wrapper.find('.tab-badge').text()).toBe('1')
  })

  it('does not show a badge on the Actions tab when there are no action items', () => {
    const wrapper = shallowMount(App)
    expect(wrapper.find('.tab-badge').exists()).toBe(false)
  })

  it('passes only Interview-status apps to InterviewsTab', async () => {
    mockState.apps = [
      makeApp(1, 'Interview'),
      makeApp(2, 'Applied'),
      makeApp(3, 'Interview'),
      makeApp(4, 'Offer'),
    ]
    const wrapper = shallowMount(App)
    await wrapper.find('.tab-btn:nth-child(4)').trigger('click')
    const interviewsTab = wrapper.findComponent({ name: 'InterviewsTab' })
    const passedApps = interviewsTab.props('apps') as JobApplication[]
    expect(passedApps).toHaveLength(2)
    expect(passedApps.every(a => a.status === 'Interview')).toBe(true)
  })
})
