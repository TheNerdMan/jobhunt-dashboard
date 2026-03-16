<template>
  <div class="container">
    <DashboardHeader
      :dayCount="dayCount"
      :weeksSince="weeksSince"
      :demoMode="demoMode"
      @export="exportData"
      @import="importData"
      @reset="resetToDefaults"
      @startUsing="startUsing"
    />

    <!-- Tab Navigation -->
    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.id === 'actions' && actionItems.length > 0" class="tab-badge">{{ actionItems.length }}</span>
      </button>
    </nav>

    <!-- Home: Metrics + Charts -->
    <template v-if="activeTab === 'home'">
      <MetricsGrid
        :metrics="metrics"
        :recruiterCount="recruiters.length"
        :stale-days="settings.staleDays"
      />
      <ChartsGrid
        :sourceLegend="sourceLegend"
        @refresh="refreshCharts"
      />
    </template>

    <!-- Applications -->
    <template v-else-if="activeTab === 'applications'">
      <ApplicationsTable
        :apps="apps"
        @save="saveApp"
        @delete="deleteApp"
      />
    </template>

    <!-- Timeline -->
    <template v-else-if="activeTab === 'timeline'">
      <TimelineCard
        :timeline="timeline"
        @save="saveTimelineEvent"
        @delete="deleteTimelineEvent"
      />
    </template>

    <!-- Interviews: dedicated interview cards with inline notes -->
    <template v-else-if="activeTab === 'interviews'">
      <InterviewsTab
        ref="interviewsTabRef"
        :apps="interviewApps"
        @save="saveInterviewApp"
        @delete="deleteInterviewApp"
      />
    </template>

    <!-- Recruiters + Notes -->
    <template v-else-if="activeTab === 'recruiters'">
      <div class="grid-2">
        <RecruitersCard
          :recruiters="recruiters"
          @save="saveRecruiter"
          @delete="deleteRecruiter"
        />
        <NotesCard
          :notes="notes"
          @save="saveNote"
          @delete="deleteNote"
        />
      </div>
    </template>

    <!-- Actions tab -->
    <template v-else-if="activeTab === 'actions'">
      <ActionsTab @go-to-app="goToApp" />
    </template>

    <!-- Settings tab -->
    <template v-else-if="activeTab === 'settings'">
      <SettingsPanel @color-changed="refreshCharts" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useJobHuntData, type JobApplication, type Recruiter, type TimelineEvent, type Note } from './composables/useJobHuntData'
import DashboardHeader from './components/DashboardHeader.vue'
import MetricsGrid from './components/MetricsGrid.vue'
import ChartsGrid from './components/ChartsGrid.vue'
import ApplicationsTable from './components/ApplicationsTable.vue'
import InterviewsTab from './components/InterviewsTab.vue'
import RecruitersCard from './components/RecruitersCard.vue'
import NotesCard from './components/NotesCard.vue'
import TimelineCard from './components/TimelineCard.vue'
import ActionsTab from './components/ActionsTab.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const {
  apps,
  recruiters,
  timeline,
  notes,
  settings,
  demoMode,
  dayCount,
  weeksSince,
  metrics,
  sourceLegend,
  actionItems,
  refreshCharts,
  exportData,
  importData,
  resetToDefaults,
  startUsing,
  nextId,
  addAutoTimelineEvent,
  ensureSourceColor,
  STALE_DAYS
} = useJobHuntData()

// Tabs
const tabs = [
  { id: 'home',         label: 'Home' },
  { id: 'applications', label: 'Applications' },
  { id: 'timeline',     label: 'Timeline' },
  { id: 'interviews',   label: 'Interviews' },
  { id: 'recruiters',   label: 'Recruiters' },
  { id: 'actions',      label: 'Actions' },
  { id: 'settings',     label: 'Settings' },
]
const activeTab = ref('home')

// Ref to InterviewsTab so we can programmatically highlight/expand a card
const interviewsTabRef = ref<InstanceType<typeof InterviewsTab> | null>(null)

// Filtered apps for Interviews tab
const interviewApps = computed(() =>
  apps.value.filter(a => a.status === 'Interview')
)

// Translate a filtered-list index back to an index in the full apps array
function resolveAppIndex(filteredApps: typeof apps.value, filteredIndex: number | null): number | null {
  if (filteredIndex === null) return null
  const item = filteredApps[filteredIndex]
  if (!item) return null
  return apps.value.indexOf(item)
}

function saveInterviewApp(appData: Omit<JobApplication, 'id'>, editIndex: number | null = null, previousStatus?: string): void {
  saveApp(appData, resolveAppIndex(interviewApps.value, editIndex), previousStatus)
}

function deleteInterviewApp(filteredIndex: number): void {
  deleteApp(resolveAppIndex(interviewApps.value, filteredIndex) ?? filteredIndex)
}

// Watch for chart updates
watch(apps, refreshCharts, { deep: true })
watch(activeTab, (tab) => {
  if (tab === 'home') refreshCharts()
})

// Navigate to an application (from actions tab) — switches to Interviews tab,
// expands the card, scrolls it into view, and flashes a highlight ring
function goToApp(appId: number | undefined) {
  if (!appId) return
  activeTab.value = 'interviews'
  nextTick(() => {
    interviewsTabRef.value?.highlightApp(appId)
  })
}

// CRUD operations for apps
// Now receives previousStatus so we can auto-log timeline events
function saveApp(appData: Omit<JobApplication, 'id'>, editIndex: number | null = null, previousStatus?: string): void {
  if (!appData.company.trim()) return

  // Assign a colour to this source if it's new
  if (appData.source) ensureSourceColor(appData.source)

  const obj = { ...appData }
  if (editIndex !== null) {
    const updatedApp: JobApplication = { ...obj, id: apps.value[editIndex].id }
    apps.value.splice(editIndex, 1, updatedApp)

    // Auto-log timeline if status changed
    if (previousStatus && previousStatus !== appData.status) {
      addAutoTimelineEvent(
        `${appData.company} — status changed from ${previousStatus} to ${appData.status}`,
        appData.status === 'Offer' ? 'win' : appData.status === 'Denied' || appData.status === 'Withdrawn' ? 'warn' : 'act'
      )
    }
  } else {
    const newApp: JobApplication = { ...obj, id: nextId(apps.value) }
    apps.value.push(newApp)
    addAutoTimelineEvent(`Applied to ${appData.company} — ${appData.title}`)
  }
}

function deleteApp(index: number): void {
  if (!confirm('Remove this application?')) return
  apps.value.splice(index, 1)
}

// CRUD operations for recruiters
function saveRecruiter(recData: Omit<Recruiter, 'id'>, editIndex: number | null = null): void {
  if (!recData.name.trim()) return

  const obj = { ...recData }
  if (editIndex !== null) {
    const updatedRec: Recruiter = { ...obj, id: recruiters.value[editIndex].id }
    recruiters.value.splice(editIndex, 1, updatedRec)
  } else {
    const newRec: Recruiter = { ...obj, id: nextId(recruiters.value) }
    recruiters.value.push(newRec)
  }
}

function deleteRecruiter(index: number): void {
  if (!confirm('Remove this recruiter?')) return
  recruiters.value.splice(index, 1)
}

// CRUD operations for timeline
function saveTimelineEvent(tlData: Omit<TimelineEvent, 'id'>): void {
  if (!tlData.date.trim() || !tlData.text.trim()) return
  const newEvent: TimelineEvent = { ...tlData, id: nextId(timeline.value) }
  timeline.value.push(newEvent)
}

function deleteTimelineEvent(index: number): void {
  if (!confirm('Remove this event?')) return
  timeline.value.splice(index, 1)
}

// CRUD operations for notes
function saveNote(noteData: Omit<Note, 'id'>): void {
  if (!noteData.text.trim()) return
  const newNote: Note = { ...noteData, id: nextId(notes.value) }
  notes.value.push(newNote)
}

function deleteNote(index: number): void {
  if (!confirm('Remove this note?')) return
  notes.value.splice(index, 1)
}
</script>

<style>
.tab-nav {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tab-btn {
  position: relative;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: var(--text);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--amber);
  color: #000;
  font-size: 9px;
  font-weight: 700;
  margin-left: 5px;
  vertical-align: middle;
  font-family: 'DM Mono', monospace;
}
</style>
