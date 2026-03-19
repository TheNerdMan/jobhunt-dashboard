<template>
  <div class="card" style="margin-bottom:1rem;">
    <div class="section-head">
      <div class="card-title" style="margin-bottom:0;">Applications</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <!-- View toggle -->
        <div class="view-toggle">
          <button :class="['vt-btn', { active: viewMode === 'table' }]" @click="viewMode = 'table'">Table</button>
          <button :class="['vt-btn', { active: viewMode === 'board' }]" @click="viewMode = 'board'">Board</button>
        </div>
        <div v-if="viewMode === 'table'" class="filter-row">
          <button v-for="f in (['all','Applied','Interview','Offer','Stale','Denied','Withdrawn'] as const)"
                  :key="f"
                  class="filter-btn"
                  :class="{active:appFilter===f}"
                  @click="appFilter=f">
            {{ f==='all'?'All':f==='Denied'?'Declined':f }}
          </button>
        </div>
        <button class="add-btn" @click="openAppModal()">+ Add</button>
      </div>
    </div>

    <!-- Table view -->
    <div v-if="viewMode === 'table'" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="col in columns"
                :key="col.key"
                :class="{'sort-active':appSortKey===col.key}"
                @click="sortApps(col.key)">
              {{ col.label }}<i class="sort-icon">{{ sortIcon(col.key) }}</i>
            </th>
            <th class="no-sort"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(a, index) in filteredApps" :key="a.id" :class="rowClass(a)">
            <td class="primary">
              <a v-if="a.link" :href="a.link" target="_blank" style="color:var(--accent);text-decoration:none;">{{ a.company }}</a>
              <span v-else>{{ a.company }}</span>
              <span v-if="hasAppNotes(a)" class="notes-indicator" title="Has research notes">●</span>
            </td>
            <td>{{ a.title }}</td>
            <td><span style="font-size:11px;color:var(--text-muted);">{{ a.source }}</span></td>
            <td>{{ a.location }}</td>
            <td class="mono" style="font-size:12px;">{{ a.salary||'—' }}</td>
            <td class="mono" style="font-size:12px;">
              {{ fmtDate(a.date) }}
              <span v-if="appDays(a)!==null" style="color:var(--text-dim);margin-left:4px;">({{ appDays(a) }}d)</span>
            </td>
            <td>
              <span class="tag" :class="tagClass(a)"
                    :title="effStatus(a)==='Stale'?'Applied '+appDays(a)+'d ago — no response after '+STALE_DAYS+' days':''">
                {{ effStatus(a) }}
              </span>
            </td>
            <td style="white-space:nowrap;">
              <button class="edit-btn" style="margin-right:4px;" @click="openAppModal(getOriginalIndex(a))">Edit</button>
              <button class="del-btn" @click="$emit('delete', getOriginalIndex(a))">Del</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Kanban board view -->
    <div v-else class="kanban-board">
      <div
        v-for="col in kanbanColumns"
        :key="col.status"
        class="kanban-col"
        @dragover.prevent
        @drop="onDrop($event, col.status)"
      >
        <div class="kanban-col-header">
          <span class="kanban-col-title">{{ col.label }}</span>
          <span class="kanban-col-count">{{ col.apps.length }}</span>
        </div>
        <div class="kanban-cards">
          <div
            v-for="a in col.apps"
            :key="a.id"
            class="kanban-card"
            :class="kanbanCardClass(a)"
            draggable="true"
            @dragstart="onDragStart($event, a)"
          >
            <div class="kc-company">
              <a v-if="a.link" :href="a.link" target="_blank" class="kc-link">{{ a.company }}</a>
              <span v-else>{{ a.company }}</span>
              <span v-if="hasAppNotes(a)" class="notes-indicator" title="Has research notes">●</span>
            </div>
            <div class="kc-role">{{ a.title }}</div>
            <div class="kc-meta">
              <span class="kc-days">{{ appDays(a) }}d</span>
              <span v-if="a.salary" class="kc-salary">{{ a.salary }}</span>
            </div>
            <div class="kc-actions">
              <button class="edit-btn" @click="openAppModal(getOriginalIndex(a))">Edit</button>
              <button class="del-btn" @click="$emit('delete', getOriginalIndex(a))">Del</button>
            </div>
          </div>
          <div v-if="col.apps.length === 0" class="kanban-empty">No applications</div>
        </div>
      </div>
    </div>

    <ApplicationModal
      v-if="showAppModal"
      :appForm="appForm"
      :editIndex="appEditIdx"
      :previousStatus="previousStatus"
      @save="saveApp"
      @close="showAppModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useJobHuntData, type JobApplication } from '../../composables/useJobHuntData'
import ApplicationModal from '../ApplicationModal/ApplicationModal.vue'

interface Props {
  apps: JobApplication[]
}

interface Emits {
  save: [appData: Omit<JobApplication, 'id'>, editIndex: number | null, previousStatus: string | undefined]
  delete: [index: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { fmtDate, daysAgo, effectiveStatus, blankApp, blankAppNotes, STALE_DAYS, settings } = useJobHuntData()

// View mode persisted to localStorage
const savedView = localStorage.getItem('jhd_view_mode')
const viewMode = ref<'table' | 'board'>((savedView === 'board' ? 'board' : 'table'))
watch(viewMode, v => localStorage.setItem('jhd_view_mode', v))

// Table state
const appFilter = ref<'all' | 'Applied' | 'Interview' | 'Offer' | 'Stale' | 'Denied' | 'Withdrawn'>('all')
const appSortKey = ref<keyof JobApplication | 'status'>('date')
const appSortDir = ref<1 | -1>(1)

// Modal state
const showAppModal = ref(false)
const appEditIdx = ref<number | null>(null)
const appForm = reactive({ ...blankApp() })
const previousStatus = ref<string | undefined>(undefined)

const columns = [
  {key: 'company' as const, label: 'Company'},
  {key: 'title' as const, label: 'Role'},
  {key: 'source' as const, label: 'Source'},
  {key: 'location' as const, label: 'Location'},
  {key: 'salary' as const, label: 'Salary'},
  {key: 'date' as const, label: 'Date'},
  {key: 'status' as const, label: 'Status'}
]

type StatusTagClass = 'tag-applied' | 'tag-denied' | 'tag-interview' | 'tag-offer' | 'tag-withdrawn' | 'tag-stale'

const STATUS_TAG: Record<string, StatusTagClass> = {
  Applied: 'tag-applied',
  Denied: 'tag-denied',
  Interview: 'tag-interview',
  Offer: 'tag-offer',
  Withdrawn: 'tag-withdrawn',
  Stale: 'tag-stale'
}

const KANBAN_COLUMNS = [
  { status: 'Applied', label: 'Applied' },
  { status: 'Interview', label: 'Interview' },
  { status: 'Offer', label: 'Offer' },
  { status: 'Denied', label: 'Declined' },
  { status: 'Withdrawn', label: 'Withdrawn' },
]

// Computed properties
const filteredApps = computed(() => {
  const staleDays = settings.value.staleDays
  let list = appFilter.value === 'all' ?
    [...props.apps] :
    props.apps.filter(a => effectiveStatus(a, staleDays) === appFilter.value)

  list.sort((a, b) => {
    const getValueForSort = (app: JobApplication) => {
      return appSortKey.value === 'status' ? effectiveStatus(app, staleDays) : (app[appSortKey.value] || '')
    }

    const av = getValueForSort(a).toString().toLowerCase()
    const bv = getValueForSort(b).toString().toLowerCase()
    if (av < bv) return -appSortDir.value
    if (av > bv) return appSortDir.value
    return 0
  })
  return list
})

const kanbanColumns = computed(() =>
  KANBAN_COLUMNS.map(col => ({
    ...col,
    apps: props.apps.filter(a => a.status === col.status)
  }))
)

// Drag state
let draggedApp: JobApplication | null = null

function onDragStart(e: DragEvent, app: JobApplication) {
  draggedApp = app
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
  }
}

function onDrop(e: DragEvent, newStatus: string) {
  e.preventDefault()
  if (!draggedApp) return
  const idx = props.apps.indexOf(draggedApp)
  if (idx === -1) return
  const oldStatus = draggedApp.status
  if (oldStatus === newStatus) return
  // Emit save with updated status
  const updated: Omit<JobApplication, 'id'> = { ...draggedApp, status: newStatus as JobApplication['status'] }
  emit('save', updated, idx, oldStatus)
  draggedApp = null
}

// Methods
function sortApps(key: typeof appSortKey.value) {
  if (appSortKey.value === key) {
    appSortDir.value = appSortDir.value === 1 ? -1 : 1
  } else {
    appSortKey.value = key
    appSortDir.value = 1
  }
}

function sortIcon(key: string): string {
  if (appSortKey.value !== key) return '↕'
  return appSortDir.value === 1 ? '↑' : '↓'
}

function tagClass(a: JobApplication): StatusTagClass {
  const staleDays = settings.value.staleDays
  return STATUS_TAG[effectiveStatus(a, staleDays)] || 'tag-applied'
}

function rowClass(a: JobApplication): string {
  const staleDays = settings.value.staleDays
  const s = effectiveStatus(a, staleDays)
  return s === 'Denied' ? 'row-denied' : s === 'Stale' ? 'row-stale' : ''
}

function kanbanCardClass(a: JobApplication): string {
  const staleDays = settings.value.staleDays
  const s = effectiveStatus(a, staleDays)
  return s === 'Stale' ? 'kc-stale' : ''
}

function effStatus(a: JobApplication): string {
  return effectiveStatus(a, settings.value.staleDays)
}

function appDays(a: JobApplication): number | null {
  return daysAgo(a.date)
}

function hasAppNotes(a: JobApplication): boolean {
  if (!a.appNotes) return false
  return !!(a.appNotes.research || a.appNotes.interviewPrep || a.appNotes.questionsToAsk || a.appNotes.interviewNotes)
}

function getOriginalIndex(app: JobApplication): number {
  return props.apps.indexOf(app)
}

function openAppModal(idx: number | null = null) {
  appEditIdx.value = idx
  previousStatus.value = idx !== null ? props.apps[idx].status : undefined
  const base = blankApp()
  if (idx !== null) {
    const app = props.apps[idx]
    Object.assign(appForm, base, app, {
      appNotes: app.appNotes ? { ...app.appNotes } : blankAppNotes()
    })
  } else {
    Object.assign(appForm, base)
  }
  showAppModal.value = true
}

function saveApp(formData: Omit<JobApplication, 'id'>, prevStatus: string | undefined) {
  emit('save', formData, appEditIdx.value, prevStatus)
  showAppModal.value = false
}
</script>

<style scoped>
/* View toggle */
.view-toggle{
  display:flex;
  gap:0;
  border:1px solid var(--border-strong);
  border-radius:6px;
  overflow:hidden;
}

.vt-btn{
  padding:4px 12px;
  font-size:11px;
  font-family:'DM Sans',sans-serif;
  font-weight:500;
  background:transparent;
  border:none;
  color:var(--text-muted);
  cursor:pointer;
  transition:all 0.15s;
}

.vt-btn + .vt-btn{
  border-left:1px solid var(--border-strong);
}

.vt-btn.active{
  background:var(--accent-dim);
  color:var(--accent);
}

/* Notes indicator */
.notes-indicator{
  font-size:7px;
  color:var(--accent);
  margin-left:4px;
  vertical-align:middle;
}

/* Tag styles */
.tag{
  display:inline-block;
  font-size:10px;
  font-weight:500;
  padding:2px 7px;
  border-radius:4px;
  letter-spacing:0.04em;
  text-transform:uppercase;
}

.tag-applied{background:var(--accent-dim);color:var(--accent);}
.tag-denied{background:var(--red-dim);color:var(--red);}
.tag-interview{background:var(--green-dim);color:var(--green);}
.tag-offer{background:var(--amber-dim);color:var(--amber);}
.tag-withdrawn{background:var(--surface3);color:var(--text-muted);}
.tag-stale{background:var(--purple-dim);color:var(--purple);}

/* Table */
.table-wrap{
  overflow-x:auto;
}

table{
  width:100%;
  border-collapse:collapse;
  font-size:13px;
}

thead th{
  text-align:left;
  font-size:11px;
  font-weight:500;
  letter-spacing:0.06em;
  text-transform:uppercase;
  color:var(--text-dim);
  padding:8px 10px;
  border-bottom:1px solid var(--border);
  white-space:nowrap;
  cursor:pointer;
  user-select:none;
}

thead th:hover{
  color:var(--text-muted);
}

thead th.no-sort{
  cursor:default;
}

.sort-icon{
  display:inline-block;
  margin-left:4px;
  opacity:0.3;
  font-style:normal;
}

.sort-active .sort-icon{
  opacity:1;
  color:var(--accent);
}

tbody td{
  padding:9px 10px;
  border-bottom:1px solid var(--border);
  color:var(--text-muted);
  vertical-align:middle;
}

tbody td.primary{
  color:var(--text);
}

tbody tr:last-child td{
  border-bottom:none;
}

tbody tr:hover td{
  background:var(--surface2);
}

tbody tr.row-denied td{
  opacity:0.55;
}

tbody tr.row-stale td{
  opacity:0.7;
}

.filter-row{
  display:flex;
  gap:6px;
  flex-wrap:wrap;
}

.filter-btn{
  font-size:11px;
  padding:4px 12px;
  border-radius:6px;
  border:1px solid var(--border-strong);
  background:transparent;
  color:var(--text-muted);
  cursor:pointer;
  font-family:'DM Sans',sans-serif;
  transition:all 0.15s;
}

.filter-btn:hover{
  background:var(--surface2);
  color:var(--text);
}

.filter-btn.active{
  background:var(--accent-dim);
  color:var(--accent);
  border-color:rgba(79,142,247,0.3);
}

/* Kanban board */
.kanban-board{
  display:flex;
  gap:10px;
  overflow-x:auto;
  padding-bottom:6px;
}

.kanban-col{
  min-width:200px;
  flex:1;
  background:var(--surface2);
  border-radius:var(--radius);
  padding:10px;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.kanban-col-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:4px;
}

.kanban-col-title{
  font-size:11px;
  font-weight:500;
  text-transform:uppercase;
  letter-spacing:0.06em;
  color:var(--text-dim);
}

.kanban-col-count{
  font-size:11px;
  font-weight:500;
  font-family:'DM Mono',monospace;
  color:var(--text-muted);
  background:var(--surface3);
  padding:1px 6px;
  border-radius:10px;
}

.kanban-cards{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.kanban-card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--radius);
  padding:10px 10px 8px;
  cursor:grab;
  transition:border-color 0.15s, box-shadow 0.15s;
}

.kanban-card:hover{
  border-color:var(--border-strong);
  box-shadow:0 2px 8px rgba(0,0,0,0.3);
}

.kanban-card.kc-stale{
  border-color:rgba(167,139,250,0.25);
  background:rgba(167,139,250,0.04);
}

.kc-company{
  font-size:13px;
  font-weight:500;
  color:var(--text);
  margin-bottom:2px;
}

.kc-link{
  color:var(--accent);
  text-decoration:none;
}

.kc-link:hover{
  text-decoration:underline;
}

.kc-role{
  font-size:12px;
  color:var(--text-muted);
  margin-bottom:6px;
}

.kc-meta{
  display:flex;
  gap:8px;
  align-items:center;
  margin-bottom:6px;
}

.kc-days{
  font-size:10px;
  font-family:'DM Mono',monospace;
  color:var(--text-dim);
}

.kc-salary{
  font-size:10px;
  font-family:'DM Mono',monospace;
  color:var(--text-dim);
}

.kc-actions{
  display:flex;
  gap:4px;
}

.kanban-empty{
  font-size:11px;
  color:var(--text-dim);
  text-align:center;
  padding:12px 0;
}
</style>
