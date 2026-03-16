<template>
  <div class="container">
    <DashboardHeader
      :dayCount="dayCount"
      :weeksSince="weeksSince"
      @export="exportData"
      @import="importData"
      @reset="resetToDefaults"
    />

    <!-- Tab Navigation -->
    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >{{ tab.label }}</button>
    </nav>

    <!-- Home: Metrics + Charts -->
    <template v-if="activeTab === 'home'">
      <MetricsGrid
        :metrics="metrics"
        :recruiterCount="recruiters.length"
        :stale-days="STALE_DAYS"
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

    <!-- Interviews: applications filtered to Interview status -->
    <template v-else-if="activeTab === 'interviews'">
      <ApplicationsTable
        :apps="interviewApps"
        @save="saveApp"
        @delete="deleteApp"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useJobHuntData, type JobApplication, type Recruiter, type TimelineEvent, type Note } from './composables/useJobHuntData'
import DashboardHeader from './components/DashboardHeader.vue'
import MetricsGrid from './components/MetricsGrid.vue'
import ChartsGrid from './components/ChartsGrid.vue'
import ApplicationsTable from './components/ApplicationsTable.vue'
import RecruitersCard from './components/RecruitersCard.vue'
import NotesCard from './components/NotesCard.vue'
import TimelineCard from './components/TimelineCard.vue'

const {
  apps,
  recruiters,
  timeline,
  notes,
  dayCount,
  weeksSince,
  metrics,
  sourceLegend,
  refreshCharts,
  exportData,
  importData,
  resetToDefaults,
  nextId,
  STALE_DAYS
} = useJobHuntData()

// Tabs
const tabs = [
  { id: 'home',         label: 'Home' },
  { id: 'applications', label: 'Applications' },
  { id: 'timeline',     label: 'Timeline' },
  { id: 'interviews',   label: 'Interviews' },
  { id: 'recruiters',   label: 'Recruiters' },
]
const activeTab = ref('home')

// Filtered apps for Interviews tab
const interviewApps = computed(() =>
  apps.value.filter(a => a.status === 'Interview')
)

// Watch for chart updates
watch(apps, refreshCharts, { deep: true })
watch(activeTab, (tab) => {
  if (tab === 'home') refreshCharts()
})

// CRUD operations for apps
function saveApp(appData: Omit<JobApplication, 'id'>, editIndex: number | null = null): void {
  if (!appData.company.trim()) return
  
  const obj = { ...appData }
  if (editIndex !== null) {
    const updatedApp: JobApplication = { ...obj, id: apps.value[editIndex].id }
    apps.value.splice(editIndex, 1, updatedApp)
  } else {
    const newApp: JobApplication = { ...obj, id: nextId(apps.value) }
    apps.value.push(newApp)
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
}

.tab-btn {
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
</style>
