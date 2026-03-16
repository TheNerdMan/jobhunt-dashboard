<template>
  <div class="card" style="margin-bottom:1rem;">
    <div class="section-head">
      <div class="card-title" style="margin-bottom:0;">Applications</div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <div class="filter-row">
          <button v-for="f in ['all','Applied','Interview','Offer','Stale','Denied','Withdrawn']" 
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
    <div class="table-wrap">
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

    <ApplicationModal
      v-if="showAppModal"
      :appForm="appForm"
      :editIndex="appEditIdx"
      @save="saveApp"
      @close="showAppModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useJobHuntData, type JobApplication } from '../composables/useJobHuntData'
import ApplicationModal from './ApplicationModal.vue'

interface Props {
  apps: JobApplication[]
}

interface Emits {
  save: [appData: Omit<JobApplication, 'id'>, editIndex: number | null]
  delete: [index: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { fmtDate, daysAgo, effectiveStatus, blankApp, STALE_DAYS } = useJobHuntData()

// Table state
const appFilter = ref<'all' | 'Applied' | 'Interview' | 'Offer' | 'Stale' | 'Denied' | 'Withdrawn'>('all')
const appSortKey = ref<keyof JobApplication | 'status'>('date')
const appSortDir = ref<1 | -1>(1)

// Modal state
const showAppModal = ref(false)
const appEditIdx = ref<number | null>(null)
const appForm = reactive(blankApp())

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

// Computed properties
const filteredApps = computed(() => {
  let list = appFilter.value === 'all' ? 
    [...props.apps] : 
    props.apps.filter(a => effectiveStatus(a) === appFilter.value)
  
  list.sort((a, b) => {
    const getValueForSort = (app: JobApplication) => {
      return appSortKey.value === 'status' ? effectiveStatus(app) : (app[appSortKey.value] || '')
    }
    
    const av = getValueForSort(a).toString().toLowerCase()
    const bv = getValueForSort(b).toString().toLowerCase()
    if (av < bv) return -appSortDir.value
    if (av > bv) return appSortDir.value
    return 0
  })
  return list
})

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
  return STATUS_TAG[effectiveStatus(a)] || 'tag-applied'
}

function rowClass(a: JobApplication): string {
  const s = effectiveStatus(a)
  return s === 'Denied' ? 'row-denied' : s === 'Stale' ? 'row-stale' : ''
}

function effStatus(a: JobApplication): string {
  return effectiveStatus(a)
}

function appDays(a: JobApplication): number | null {
  return daysAgo(a.date)
}

function getOriginalIndex(app: JobApplication): number {
  return props.apps.indexOf(app)
}

function openAppModal(idx: number | null = null) {
  appEditIdx.value = idx
  Object.assign(appForm, blankApp(), idx !== null ? props.apps[idx] : {})
  showAppModal.value = true
}

function saveApp(formData: Omit<JobApplication, 'id'>) {
  emit('save', formData, appEditIdx.value)
  showAppModal.value = false
}
</script>

<style scoped>
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
</style>