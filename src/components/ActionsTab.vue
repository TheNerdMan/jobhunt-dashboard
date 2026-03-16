<template>
  <div class="card">
    <div class="section-head" style="margin-bottom:16px;">
      <div class="card-title" style="margin-bottom:0;">Actions</div>
      <span v-if="actionItems.length" class="action-count">{{ actionItems.length }} item{{ actionItems.length !== 1 ? 's' : '' }} need attention</span>
      <span v-else class="action-clear">All clear</span>
    </div>

    <!-- Empty state -->
    <div v-if="actionItems.length === 0" class="actions-empty">
      <div class="actions-empty-icon">✓</div>
      <div class="actions-empty-title">Nothing needs attention right now</div>
      <div class="actions-empty-sub">Follow-up reminders and interview prep prompts will appear here automatically.</div>
    </div>

    <!-- Action items grouped by type -->
    <template v-else>
      <div v-for="group in groupedActions" :key="group.type" class="action-group">
        <div class="action-group-label">{{ group.label }}</div>
        <div v-for="item in group.items" :key="itemKey(item)" class="action-item" :class="'action-' + item.type">
          <div class="ai-icon" :class="'ai-icon-' + item.type">{{ actionIcon(item.type) }}</div>
          <div class="ai-body">
            <div class="ai-company">{{ item.company }}
              <span v-if="item.role" class="ai-role">— {{ item.role }}</span>
            </div>
            <div class="ai-desc">{{ item.description }}</div>
            <div v-if="item.daysOverdue > 0" class="ai-overdue">{{ item.daysOverdue }}d overdue</div>
          </div>
          <div class="ai-actions">
            <!-- Follow-up: Mark Chased or Withdraw -->
            <template v-if="item.type === 'follow-up' || item.type === 'stale'">
              <button class="ai-btn ai-btn-primary" @click="markChased(item)">Mark Chased</button>
              <button class="ai-btn ai-btn-danger" @click="withdrawApp(item)">Withdraw</button>
            </template>
            <!-- Interview prep: go to app -->
            <template v-else-if="item.type === 'interview-prep'">
              <button class="ai-btn ai-btn-primary" @click="$emit('go-to-app', item.appId)">Open App</button>
            </template>
            <!-- Recruiter check-in -->
            <template v-else-if="item.type === 'recruiter-checkin'">
              <button class="ai-btn ai-btn-primary" @click="markRecruiterContacted(item)">Mark Contacted</button>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJobHuntData, type ActionItem } from '../composables/useJobHuntData'

interface Emits {
  'go-to-app': [appId: number | undefined]
}

const emit = defineEmits<Emits>()

const { actionItems, apps, recruiters, addAutoTimelineEvent } = useJobHuntData()

type GroupType = {
  type: ActionItem['type']
  label: string
  items: ActionItem[]
}

const GROUP_ORDER: ActionItem['type'][] = ['interview-prep', 'follow-up', 'stale', 'recruiter-checkin']
const GROUP_LABELS: Record<ActionItem['type'], string> = {
  'interview-prep': 'Interview Preparation',
  'follow-up': 'Follow-up Needed',
  'stale': 'Stale Applications',
  'recruiter-checkin': 'Recruiter Check-ins',
}

const groupedActions = computed<GroupType[]>(() => {
  const map = new Map<ActionItem['type'], ActionItem[]>()
  for (const item of actionItems.value) {
    if (!map.has(item.type)) map.set(item.type, [])
    map.get(item.type)!.push(item)
  }
  return GROUP_ORDER
    .filter(t => map.has(t))
    .map(t => ({ type: t, label: GROUP_LABELS[t], items: map.get(t)! }))
})

function itemKey(item: ActionItem): string {
  return `${item.type}-${item.appId ?? item.recruiterId}`
}

function actionIcon(type: ActionItem['type']): string {
  if (type === 'follow-up') return '→'
  if (type === 'stale') return '◌'
  if (type === 'interview-prep') return '★'
  if (type === 'recruiter-checkin') return '◎'
  return '!'
}

function markChased(item: ActionItem) {
  const app = apps.value.find(a => a.id === item.appId)
  if (!app) return
  addAutoTimelineEvent(`Chased ${app.company} re: ${app.title}`)
  // Reset the application date to today to snooze the reminder
  const idx = apps.value.indexOf(app)
  if (idx !== -1) {
    apps.value.splice(idx, 1, { ...app, date: new Date().toISOString().slice(0, 10) })
  }
}

function withdrawApp(item: ActionItem) {
  const app = apps.value.find(a => a.id === item.appId)
  if (!app) return
  if (!confirm(`Withdraw application to ${app.company}?`)) return
  const idx = apps.value.indexOf(app)
  if (idx !== -1) {
    apps.value.splice(idx, 1, { ...app, status: 'Withdrawn' })
    addAutoTimelineEvent(`Withdrew application to ${app.company} (${app.title})`)
  }
}

function markRecruiterContacted(item: ActionItem) {
  const rec = recruiters.value.find(r => r.id === item.recruiterId)
  if (!rec) return
  const idx = recruiters.value.indexOf(rec)
  if (idx !== -1) {
    recruiters.value.splice(idx, 1, { ...rec, date: new Date().toISOString().slice(0, 10) })
    addAutoTimelineEvent(`Checked in with ${rec.name} at ${rec.company}`)
  }
}
</script>

<style scoped>
.action-count{
  font-size:12px;
  color:var(--amber);
  font-weight:500;
}

.action-clear{
  font-size:12px;
  color:var(--green);
  font-weight:500;
}

.actions-empty{
  text-align:center;
  padding:2.5rem 1rem;
}

.actions-empty-icon{
  font-size:28px;
  color:var(--green);
  margin-bottom:10px;
}

.actions-empty-title{
  font-size:14px;
  font-weight:500;
  color:var(--text);
  margin-bottom:6px;
}

.actions-empty-sub{
  font-size:12px;
  color:var(--text-dim);
  max-width:340px;
  margin:0 auto;
  line-height:1.6;
}

.action-group{
  margin-bottom:1.25rem;
}

.action-group:last-child{
  margin-bottom:0;
}

.action-group-label{
  font-size:10px;
  font-weight:500;
  text-transform:uppercase;
  letter-spacing:0.08em;
  color:var(--text-dim);
  margin-bottom:8px;
}

.action-item{
  display:flex;
  gap:12px;
  align-items:flex-start;
  padding:10px 12px;
  border-radius:var(--radius);
  border:1px solid var(--border);
  margin-bottom:6px;
  background:var(--surface2);
  transition:border-color 0.15s;
}

.action-item:last-child{
  margin-bottom:0;
}

.action-item:hover{
  border-color:var(--border-strong);
}

.action-follow-up{
  border-left:3px solid var(--amber);
}

.action-stale{
  border-left:3px solid var(--purple);
}

.action-interview-prep{
  border-left:3px solid var(--green);
}

.action-recruiter-checkin{
  border-left:3px solid var(--teal);
}

.ai-icon{
  width:28px;
  height:28px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:13px;
  flex-shrink:0;
  margin-top:1px;
}

.ai-icon-follow-up{background:var(--amber-dim);color:var(--amber);}
.ai-icon-stale{background:var(--purple-dim);color:var(--purple);}
.ai-icon-interview-prep{background:var(--green-dim);color:var(--green);}
.ai-icon-recruiter-checkin{background:rgba(45,212,191,0.12);color:var(--teal);}

.ai-body{
  flex:1;
  min-width:0;
}

.ai-company{
  font-size:13px;
  font-weight:500;
  color:var(--text);
  margin-bottom:2px;
}

.ai-role{
  font-weight:400;
  color:var(--text-muted);
}

.ai-desc{
  font-size:12px;
  color:var(--text-muted);
  margin-bottom:2px;
}

.ai-overdue{
  font-size:10px;
  font-family:'DM Mono',monospace;
  color:var(--red);
  margin-top:2px;
}

.ai-actions{
  display:flex;
  flex-direction:column;
  gap:4px;
  flex-shrink:0;
}

.ai-btn{
  font-size:11px;
  padding:4px 10px;
  border-radius:5px;
  border:1px solid var(--border-strong);
  background:transparent;
  color:var(--text-muted);
  cursor:pointer;
  font-family:'DM Sans',sans-serif;
  white-space:nowrap;
  transition:all 0.15s;
}

.ai-btn-primary{
  border-color:rgba(79,142,247,0.3);
  background:var(--accent-dim);
  color:var(--accent);
}

.ai-btn-primary:hover{
  background:rgba(79,142,247,0.2);
}

.ai-btn-danger{
  border-color:rgba(247,97,79,0.2);
  color:var(--red);
}

.ai-btn-danger:hover{
  background:var(--red-dim);
}
</style>
