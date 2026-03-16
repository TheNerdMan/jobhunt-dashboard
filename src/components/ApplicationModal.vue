<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>{{ editIndex !== null ? 'Edit application' : 'Add application' }}</h3>

      <!-- URL Quick-Add -->
      <div v-if="editIndex === null" class="quick-add">
        <label>Paste job URL to auto-fill link</label>
        <div class="quick-add-row">
          <input
            v-model="quickUrl"
            type="text"
            placeholder="https://jobs.example.com/..."
            @paste="onUrlPaste"
          >
          <button v-if="quickUrl" class="btn-clear-url" @click="quickUrl = ''; localForm.link = ''">✕</button>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:0;">
        <div class="field">
          <label>Company</label>
          <input v-model="localForm.company" type="text" placeholder="Acme Corp">
        </div>
        <div class="field">
          <label>Job title</label>
          <input v-model="localForm.title" type="text" placeholder="Senior .NET Developer">
        </div>
      </div>
      <div class="grid-2" style="margin-bottom:0;">
        <div class="field">
          <label>Source</label>
          <input v-model="localForm.source" type="text" placeholder="JackAndJill / LinkedIn / ...">
        </div>
        <div class="field">
          <label>Status</label>
          <select v-model="localForm.status">
            <option v-for="s in ['Applied','Interview','Offer','Denied','Withdrawn']" :key="s">{{ s }}</option>
          </select>
        </div>
      </div>
      <div class="grid-2" style="margin-bottom:0;">
        <div class="field">
          <label>Location</label>
          <input v-model="localForm.location" type="text" placeholder="Remote / London">
        </div>
        <div class="field">
          <label>Salary range</label>
          <input v-model="localForm.salary" type="text" placeholder="£60k–£80k">
        </div>
      </div>
      <div class="grid-2" style="margin-bottom:0;">
        <div class="field">
          <label>Date applied</label>
          <input v-model="localForm.date" type="date">
        </div>
        <div class="field">
          <label>Job posting link</label>
          <input v-model="localForm.link" type="text" placeholder="https://...">
        </div>
      </div>

      <!-- Notes tabs -->
      <div class="notes-panel">
        <div class="notes-tabs">
          <button
            v-for="tab in notesTabs"
            :key="tab.key"
            class="notes-tab-btn"
            :class="{ active: activeNotesTab === tab.key, filled: isTabFilled(tab.key) }"
            @click="activeNotesTab = tab.key"
          >
            {{ tab.label }}
            <span v-if="isTabFilled(tab.key)" class="tab-dot"></span>
          </button>
        </div>

        <div class="notes-tab-content">
          <div v-if="activeNotesTab === 'general'" class="field" style="margin-bottom:0;">
            <textarea v-model="localForm.notes" placeholder="Quick notes about the role..."></textarea>
          </div>
          <div v-else-if="activeNotesTab === 'research'" class="field" style="margin-bottom:0;">
            <textarea
              v-model="localAppNotes.research"
              placeholder="Company background, culture, products, recent news..."
            ></textarea>
          </div>
          <div v-else-if="activeNotesTab === 'prep'" class="field" style="margin-bottom:0;">
            <textarea
              v-model="localAppNotes.interviewPrep"
              placeholder="Anticipated questions, STAR examples, talking points..."
            ></textarea>
          </div>
          <div v-else-if="activeNotesTab === 'questions'" class="field" style="margin-bottom:0;">
            <textarea
              v-model="localAppNotes.questionsToAsk"
              placeholder="Questions to ask the interviewer..."
            ></textarea>
          </div>
          <div v-else-if="activeNotesTab === 'debrief'" class="field" style="margin-bottom:0;">
            <textarea
              v-model="localAppNotes.interviewNotes"
              placeholder="Post-interview debrief — what went well, what didn't..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <button class="btn-save" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { JobApplication, AppNotes } from '../composables/useJobHuntData'
import { blankAppNotes as makeBlankAppNotes } from '../composables/useJobHuntData'

interface Props {
  appForm: Omit<JobApplication, 'id'>
  editIndex: number | null
  previousStatus?: string
}

interface Emits {
  save: [formData: Omit<JobApplication, 'id'>, previousStatus: string | undefined]
  close: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localForm = reactive({ ...props.appForm })
const localAppNotes = reactive<AppNotes>({
  ...(props.appForm.appNotes ?? makeBlankAppNotes())
})

const quickUrl = ref('')
const activeNotesTab = ref<'general' | 'research' | 'prep' | 'questions' | 'debrief'>('general')

const notesTabs = [
  { key: 'general' as const, label: 'Notes' },
  { key: 'research' as const, label: 'Research' },
  { key: 'prep' as const, label: 'Interview Prep' },
  { key: 'questions' as const, label: 'Questions to Ask' },
  { key: 'debrief' as const, label: 'Debrief' },
]

// Watch for changes in the prop to update local form
watch(() => props.appForm, (newForm) => {
  Object.assign(localForm, newForm)
  Object.assign(localAppNotes, newForm.appNotes ?? makeBlankAppNotes())
}, { deep: true })

function onUrlPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  if (text.startsWith('http')) {
    // Set link field after paste event resolves
    setTimeout(() => {
      localForm.link = text.trim()
      quickUrl.value = text.trim()
    }, 0)
  }
}

function isTabFilled(key: string): boolean {
  if (key === 'general') return !!localForm.notes?.trim()
  if (key === 'research') return !!localAppNotes.research?.trim()
  if (key === 'prep') return !!localAppNotes.interviewPrep?.trim()
  if (key === 'questions') return !!localAppNotes.questionsToAsk?.trim()
  if (key === 'debrief') return !!localAppNotes.interviewNotes?.trim()
  return false
}

function save() {
  if (!localForm.company.trim()) return
  emit('save', { ...localForm, appNotes: { ...localAppNotes } }, props.previousStatus)
}
</script>


<style scoped>
.modal-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.7);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:100;
}

.modal{
  background:var(--surface);
  border:1px solid var(--border-strong);
  border-radius:var(--radius-lg);
  padding:1.5rem;
  width:100%;
  max-width:560px;
  max-height:92vh;
  overflow-y:auto;
}

.modal h3{
  font-size:15px;
  font-weight:500;
  margin-bottom:1.25rem;
}

.quick-add{
  margin-bottom:14px;
  padding:10px 12px;
  background:var(--surface2);
  border:1px solid var(--border-strong);
  border-radius:var(--radius);
}

.quick-add label{
  display:block;
  font-size:10px;
  text-transform:uppercase;
  letter-spacing:0.06em;
  color:var(--text-dim);
  margin-bottom:6px;
}

.quick-add-row{
  display:flex;
  gap:6px;
  align-items:center;
}

.quick-add-row input{
  flex:1;
  padding:7px 10px;
  background:var(--surface3);
  border:1px solid var(--border-strong);
  border-radius:var(--radius);
  color:var(--text);
  font-family:'DM Sans',sans-serif;
  font-size:12px;
}

.quick-add-row input:focus{
  outline:none;
  border-color:rgba(79,142,247,0.5);
}

.btn-clear-url{
  padding:5px 8px;
  background:transparent;
  border:1px solid var(--border-strong);
  border-radius:var(--radius);
  color:var(--text-dim);
  cursor:pointer;
  font-size:11px;
  font-family:'DM Sans',sans-serif;
}

.field{
  margin-bottom:14px;
}

.field label{
  display:block;
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:0.06em;
  color:var(--text-dim);
  margin-bottom:5px;
}

.field input,.field select,.field textarea{
  width:100%;
  padding:8px 10px;
  background:var(--surface2);
  border:1px solid var(--border-strong);
  border-radius:var(--radius);
  color:var(--text);
  font-family:'DM Sans',sans-serif;
  font-size:13px;
}

.field input:focus,.field select:focus,.field textarea:focus{
  outline:none;
  border-color:rgba(79,142,247,0.5);
}

.field textarea{
  min-height:80px;
  resize:vertical;
}

.field select option{
  background:var(--surface);
}

/* Notes panel */
.notes-panel{
  margin-top:6px;
  margin-bottom:14px;
  border:1px solid var(--border-strong);
  border-radius:var(--radius);
  overflow:hidden;
}

.notes-tabs{
  display:flex;
  border-bottom:1px solid var(--border-strong);
  background:var(--surface2);
  overflow-x:auto;
}

.notes-tab-btn{
  position:relative;
  padding:7px 12px;
  font-size:11px;
  font-family:'DM Sans',sans-serif;
  font-weight:500;
  background:transparent;
  border:none;
  border-bottom:2px solid transparent;
  color:var(--text-muted);
  cursor:pointer;
  white-space:nowrap;
  transition:color 0.15s, border-color 0.15s;
  margin-bottom:-1px;
}

.notes-tab-btn:hover{
  color:var(--text);
}

.notes-tab-btn.active{
  color:var(--accent);
  border-bottom-color:var(--accent);
}

.tab-dot{
  display:inline-block;
  width:5px;
  height:5px;
  border-radius:50%;
  background:var(--accent);
  margin-left:4px;
  vertical-align:middle;
}

.notes-tab-content{
  padding:10px 12px;
  background:var(--surface);
}

.notes-tab-content textarea{
  width:100%;
  min-height:90px;
  padding:8px 10px;
  background:var(--surface2);
  border:1px solid var(--border-strong);
  border-radius:var(--radius);
  color:var(--text);
  font-family:'DM Sans',sans-serif;
  font-size:13px;
  resize:vertical;
  box-sizing:border-box;
}

.notes-tab-content textarea:focus{
  outline:none;
  border-color:rgba(79,142,247,0.5);
}

.modal-actions{
  display:flex;
  gap:8px;
  justify-content:flex-end;
  margin-top:1.25rem;
}

.btn-cancel{
  padding:7px 16px;
  border-radius:6px;
  border:1px solid var(--border-strong);
  background:transparent;
  color:var(--text-muted);
  cursor:pointer;
  font-family:'DM Sans',sans-serif;
  font-size:13px;
}

.btn-save{
  padding:7px 16px;
  border-radius:6px;
  border:1px solid rgba(79,142,247,0.4);
  background:var(--accent-dim);
  color:var(--accent);
  cursor:pointer;
  font-family:'DM Sans',sans-serif;
  font-size:13px;
  font-weight:500;
}

.btn-save:hover{
  background:rgba(79,142,247,0.25);
}
</style>
