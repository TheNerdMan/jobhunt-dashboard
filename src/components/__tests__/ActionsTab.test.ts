import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { ActionItem } from '../../composables/useJobHuntData'
import ActionsTab from '../ActionsTab.vue'

// Controllable state shared with the vi.mock factory via vi.hoisted
const mockState = vi.hoisted(() => ({ items: [] as ActionItem[] }))

vi.mock('../../composables/useJobHuntData', async () => {
  const { ref, computed } = await import('vue')
  return {
    useJobHuntData: () => ({
      actionItems: computed(() => mockState.items),
      apps: ref([]),
      recruiters: ref([]),
      addAutoTimelineEvent: vi.fn(),
    }),
  }
})

const makeItem = (id: number, type: ActionItem['type'] = 'follow-up'): ActionItem => ({
  type,
  appId: type !== 'recruiter-checkin' ? id : undefined,
  recruiterId: type === 'recruiter-checkin' ? id : undefined,
  company: `Company ${id}`,
  daysOverdue: 1,
  description: 'Follow up needed',
})

describe('ActionsTab', () => {
  beforeEach(() => {
    mockState.items = []
  })

  it('renders the Actions card title', () => {
    const wrapper = mount(ActionsTab)
    expect(wrapper.text()).toContain('Actions')
  })

  it('renders the component without errors', () => {
    const wrapper = mount(ActionsTab)
    expect(wrapper.exists()).toBe(true)
  })

  it('shows "All clear" indicator and hides count when there are no items', () => {
    const wrapper = mount(ActionsTab)
    expect(wrapper.find('.action-clear').exists()).toBe(true)
    expect(wrapper.find('.action-count').exists()).toBe(false)
  })

  it('uses singular form ("1 item") when there is exactly 1 action item', () => {
    mockState.items = [makeItem(1)]
    const wrapper = mount(ActionsTab)
    expect(wrapper.find('.action-count').text()).toBe('1 item need attention')
  })

  it('uses plural form ("N items") when there are multiple action items', () => {
    mockState.items = [makeItem(1), makeItem(2)]
    const wrapper = mount(ActionsTab)
    expect(wrapper.find('.action-count').text()).toBe('2 items need attention')
  })

  it('shows empty state message when there are no action items', () => {
    const wrapper = mount(ActionsTab)
    expect(wrapper.find('.actions-empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('Nothing needs attention right now')
  })

  it('shows action groups when there are action items', () => {
    mockState.items = [makeItem(1)]
    const wrapper = mount(ActionsTab)
    expect(wrapper.find('.action-group').exists()).toBe(true)
  })

  it('shows action item rows when there are action items', () => {
    mockState.items = [makeItem(1), makeItem(2)]
    const wrapper = mount(ActionsTab)
    expect(wrapper.findAll('.action-item').length).toBe(2)
  })

  it('renders a "Mark Chased" button for follow-up items', () => {
    mockState.items = [makeItem(1, 'follow-up')]
    const wrapper = mount(ActionsTab)
    const followUpItem = wrapper.find('.action-follow-up')
    expect(followUpItem.exists()).toBe(true)
    const btn = followUpItem.findAll('.ai-btn').find(b => b.text() === 'Mark Chased')
    expect(btn).toBeTruthy()
  })

  it('renders a "Open App" button for interview-prep items', () => {
    mockState.items = [makeItem(1, 'interview-prep')]
    const wrapper = mount(ActionsTab)
    const prepItem = wrapper.find('.action-interview-prep')
    expect(prepItem.exists()).toBe(true)
    expect(prepItem.find('.ai-btn-primary').text()).toBe('Open App')
  })

  it('renders a "Mark Contacted" button for recruiter-checkin items', () => {
    mockState.items = [makeItem(1, 'recruiter-checkin')]
    const wrapper = mount(ActionsTab)
    const checkinItem = wrapper.find('.action-recruiter-checkin')
    expect(checkinItem.exists()).toBe(true)
    expect(checkinItem.find('.ai-btn-primary').text()).toBe('Mark Contacted')
  })
})
