<template>
  <div>
    <!-- Header card -->
    <div class="card" style="margin-bottom:1rem;">
      <div class="section-head">
        <div class="card-title" style="margin-bottom:0;">Interviews
          <span class="interview-count">{{ apps.length }}</span>
        </div>
        <button class="add-btn" @click="openModal()">+ Add</button>
      </div>

      <div v-if="apps.length === 0" class="empty-state">
        <div class="empty-icon">★</div>
        <div class="empty-title">No active interviews</div>
        <div class="empty-sub">Applications with Interview status will appear here.</div>
      </div>
    </div>

    <!-- Interview cards -->
    <div class="interviews-grid">
      <div
        v-for="(app, idx) in apps"
        :key="app.id"
        class="interview-card"
        :class="{ expanded: expandedId === app.id, highlighted: highlightedId === app.id }"
        :data-app-id="app.id"
      >
        <!-- Card header -->
        <div class="ic-header" @click="toggleExpand(app.id)">
          <div class="ic-left">
            <div class="ic-company">
              <a v-if="app.link" :href="app.link" target="_blank" class="ic-link" @click.stop>{{ app.company }}</a>
              <span v-else>{{ app.company }}</span>
            </div>
            <div class="ic-role">{{ app.title }}</div>
            <div class="ic-meta">
              <span v-if="app.salary" class="ic-meta-chip">{{ app.salary }}</span>
              <span v-if="app.location" class="ic-meta-chip">{{ app.location }}</span>
              <span class="ic-meta-chip ic-days">{{ appDays(app) !== null ? appDays(app) + 'd' : '' }}</span>
            </div>
          </div>
          <div class="ic-right">
            <!-- Note filled indicators -->
            <div class="ic-note-pills">
              <span
                v-for="tab in notesTabs"
                :key="tab.key"
                class="ic-pill"
                :class="{ filled: isTabFilled(app, tab.key), active: expandedId === app.id && activeNoteTab[app.id] === tab.key }"
                :title="tab.label"
                @click.stop="selectTab(app.id, tab.key)"
              >{{ tab.short }}</span>
            </div>
            <div class="ic-chevron" :class="{ open: expandedId === app.id }">›</div>
          </div>
        </div>

        <!-- Expanded notes detail -->
        <div v-if="expandedId === app.id" class="ic-detail">
          <!-- Tab bar -->
          <div class="ic-tabs">
            <button
              v-for="tab in notesTabs"
              :key="tab.key"
              class="ic-tab-btn"
              :class="{ active: activeNoteTab[app.id] === tab.key, filled: isTabFilled(app, tab.key) }"
              @click="activeNoteTab[app.id] = tab.key"
            >
              {{ tab.label }}
              <span v-if="isTabFilled(app, tab.key)" class="ic-tab-dot"></span>
            </button>
          </div>

          <!-- Note content (read-only display) -->
          <div class="ic-note-body">
            <div v-if="currentNote(app, activeNoteTab[app.id] || 'general')" class="ic-note-text">
              {{ currentNote(app, activeNoteTab[app.id] || 'general') }}
            </div>
            <div v-else class="ic-note-empty">
              No {{ noteLabel(activeNoteTab[app.id] || 'general') }} yet — click Edit to add notes.
            </div>
          </div>

          <!-- Card actions -->
          <div class="ic-actions">
            <button class="ic-btn ic-btn-edit" @click="openModal(idx)">Edit</button>
            <button class="ic-btn ic-btn-delete" @click="$emit('delete', idx)">Remove</button>
          </div>
        </div>

        <!-- Collapsed quick-actions -->
        <div v-else class="ic-quick-actions">
          <button class="ic-btn ic-btn-edit" @click.stop="openModal(idx)">Edit</button>
          <button class="ic-btn ic-btn-delete" @click.stop="$emit('delete', idx)">Remove</button>
        </div>
      </div>
    </div>

    <!-- Application modal (reused) -->
    <ApplicationModal
      v-if="showModal"
      :appForm="appForm"
      :editIndex="editIndex"
      :previousStatus="previousStatus"
      @save="saveApp"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { useJobHuntData, type JobApplication } from '../composables/useJobHuntData'
import ApplicationModal from './ApplicationModal.vue'

interface Props {
  apps: JobApplication[]
}

interface Emits {
  save: [appData: Omit<JobApplication, 'id'>, editIndex: number | null, previousStatus: string | undefined]
  delete: [index: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { daysAgo, blankApp, blankAppNotes } = useJobHuntData()

// Expanded state: which card is open
const expandedId = ref<number | null>(null)
// Active notes tab per card
const activeNoteTab = reactive<Record<number, string>>({})
// Highlighted card id (brief flash on programmatic navigation)
const highlightedId = ref<number | null>(null)

// Modal state
const showModal = ref(false)
const editIndex = ref<number | null>(null)
const appForm = reactive({ ...blankApp() })
const previousStatus = ref<string | undefined>(undefined)

const notesTabs = [
  { key: 'general',    label: 'Notes',            short: 'N' },
  { key: 'research',   label: 'Research',          short: 'R' },
  { key: 'prep',       label: 'Interview Prep',    short: 'P' },
  { key: 'questions',  label: 'Questions to Ask',  short: 'Q' },
  { key: 'debrief',    label: 'Debrief',           short: 'D' },
]

function appDays(app: JobApplication): number | null {
  return daysAgo(app.date)
}

function toggleExpand(id: number) {
  if (expandedId.value === id) {
    expandedId.value = null
  } else {
    expandedId.value = id
    if (!activeNoteTab[id]) activeNoteTab[id] = 'general'
  }
}

function selectTab(appId: number, tabKey: string) {
  if (expandedId.value !== appId) {
    expandedId.value = appId
  }
  activeNoteTab[appId] = tabKey
}

function isTabFilled(app: JobApplication, key: string): boolean {
  if (key === 'general') return !!app.notes?.trim()
  if (!app.appNotes) return false
  if (key === 'research')  return !!app.appNotes.research?.trim()
  if (key === 'prep')      return !!app.appNotes.interviewPrep?.trim()
  if (key === 'questions') return !!app.appNotes.questionsToAsk?.trim()
  if (key === 'debrief')   return !!app.appNotes.interviewNotes?.trim()
  return false
}

function currentNote(app: JobApplication, key: string): string {
  if (key === 'general') return app.notes?.trim() || ''
  if (!app.appNotes) return ''
  if (key === 'research')  return app.appNotes.research?.trim() || ''
  if (key === 'prep')      return app.appNotes.interviewPrep?.trim() || ''
  if (key === 'questions') return app.appNotes.questionsToAsk?.trim() || ''
  if (key === 'debrief')   return app.appNotes.interviewNotes?.trim() || ''
  return ''
}

function noteLabel(key: string): string {
  return notesTabs.find(t => t.key === key)?.label.toLowerCase() || 'notes'
}

function openModal(idx: number | null = null) {
  editIndex.value = idx
  previousStatus.value = idx !== null ? props.apps[idx].status : undefined
  const base = blankApp()
  if (idx !== null) {
    const app = props.apps[idx]
    Object.assign(appForm, base, app, {
      appNotes: app.appNotes ? { ...app.appNotes } : blankAppNotes()
    })
  } else {
    Object.assign(appForm, base, { status: 'Interview' })
  }
  showModal.value = true
}

function saveApp(formData: Omit<JobApplication, 'id'>, prevStatus: string | undefined) {
  emit('save', formData, editIndex.value, prevStatus)
  showModal.value = false
}

// Called by App.vue when "Open App" is clicked in the Actions tab.
// Switches to the card, expands its detail panel, scrolls it into view,
// and briefly highlights it so the user knows exactly which one opened.
async function highlightApp(appId: number) {
  const app = props.apps.find(a => a.id === appId)
  if (!app) return

  // Expand the card
  expandedId.value = appId
  if (!activeNoteTab[appId]) activeNoteTab[appId] = 'general'

  // Wait for the DOM to update with the expanded card
  await nextTick()

  const el = document.querySelector<HTMLElement>(`[data-app-id="${appId}"]`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Flash highlight
  highlightedId.value = appId
  setTimeout(() => { highlightedId.value = null }, 1200)
}

// Expose openModal for + Add triggered from App-level and highlightApp for Actions nav
defineExpose({ openModal, highlightApp })
</script>

<style scoped>
.interview-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--green-dim);
  color: var(--green);
  font-size: 10px;
  font-weight: 700;
  margin-left: 8px;
  font-family: 'DM Mono', monospace;
  vertical-align: middle;
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
}

.empty-icon {
  font-size: 28px;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.empty-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 6px;
}

.empty-sub {
  font-size: 12px;
  color: var(--text-dim);
  max-width: 300px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Grid of interview cards */
.interviews-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Individual interview card */
.interview-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.15s;
  border-left: 3px solid var(--green);
}

.interview-card:hover {
  border-color: var(--border-strong);
  border-left-color: var(--green);
}

.interview-card.expanded {
  border-color: var(--border-strong);
  border-left-color: var(--green);
}

@keyframes card-highlight {
  0%   { box-shadow: 0 0 0 0 rgba(79, 142, 247, 0.5); }
  40%  { box-shadow: 0 0 0 5px rgba(79, 142, 247, 0.25); }
  100% { box-shadow: 0 0 0 0 rgba(79, 142, 247, 0); }
}

.interview-card.highlighted {
  animation: card-highlight 1.2s ease-out forwards;
}

/* Card header (always visible) */
.ic-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 14px;
  cursor: pointer;
  gap: 12px;
}

.ic-header:hover .ic-chevron {
  color: var(--text);
}

.ic-left {
  flex: 1;
  min-width: 0;
}

.ic-company {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 2px;
}

.ic-link {
  color: var(--accent);
  text-decoration: none;
}

.ic-link:hover {
  text-decoration: underline;
}

.ic-role {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.ic-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.ic-meta-chip {
  font-size: 10px;
  font-family: 'DM Mono', monospace;
  color: var(--text-dim);
  background: var(--surface2);
  padding: 2px 6px;
  border-radius: 4px;
}

.ic-days {
  color: var(--text-dim);
}

.ic-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* Note pills (one per notes tab) */
.ic-note-pills {
  display: flex;
  gap: 4px;
}

.ic-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  font-family: 'DM Mono', monospace;
  background: var(--surface2);
  color: var(--text-dim);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.12s;
  user-select: none;
}

.ic-pill.filled {
  background: var(--accent-dim);
  color: var(--accent);
  border-color: rgba(79, 142, 247, 0.3);
}

.ic-pill.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.ic-chevron {
  font-size: 18px;
  color: var(--text-dim);
  transition: transform 0.2s, color 0.15s;
  line-height: 1;
}

.ic-chevron.open {
  transform: rotate(90deg);
  color: var(--text-muted);
}

/* Quick actions strip (collapsed state) */
.ic-quick-actions {
  display: flex;
  gap: 6px;
  padding: 0 14px 10px;
}

/* Expanded detail panel */
.ic-detail {
  border-top: 1px solid var(--border);
  background: var(--surface2);
}

.ic-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: var(--surface3);
  overflow-x: auto;
}

.ic-tab-btn {
  position: relative;
  padding: 8px 12px;
  font-size: 11px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
  margin-bottom: -1px;
}

.ic-tab-btn:hover {
  color: var(--text);
}

.ic-tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.ic-tab-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent);
  margin-left: 4px;
  vertical-align: middle;
}

.ic-note-body {
  padding: 14px 16px;
  min-height: 80px;
}

.ic-note-text {
  font-size: 13px;
  color: var(--text);
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

.ic-note-empty {
  font-size: 12px;
  color: var(--text-dim);
  font-style: italic;
}

.ic-actions {
  display: flex;
  gap: 6px;
  padding: 10px 14px 12px;
  border-top: 1px solid var(--border);
}

/* Buttons */
.ic-btn {
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 5px;
  border: 1px solid var(--border-strong);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.15s;
}

.ic-btn-edit {
  border-color: rgba(79, 142, 247, 0.3);
  background: var(--accent-dim);
  color: var(--accent);
}

.ic-btn-edit:hover {
  background: rgba(79, 142, 247, 0.2);
}

.ic-btn-delete {
  border-color: rgba(247, 97, 79, 0.2);
  color: var(--red);
}

.ic-btn-delete:hover {
  background: var(--red-dim);
}
</style>
