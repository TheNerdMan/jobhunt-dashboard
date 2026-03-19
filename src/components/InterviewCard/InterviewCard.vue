<template>
    <div class="interview-card" :class="{ expanded: expandedId === app.id, highlighted: highlightedId === app.id }">
        <!-- Card header -->
        <div class="ic-header" @click="toggleExpand(app.id)">
            <div class="ic-left">
                <div class="ic-company">
                    <a v-if="app.link" :href="app.link" target="_blank" class="ic-link" @click.stop>{{ app.company
                        }}</a>
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
                    <span v-for="tab in notesTabs" :key="tab.key" class="ic-pill"
                        :class="{ filled: isTabFilled(app, tab.key), active: expandedId === app.id && activeNoteTab[app.id] === tab.key }"
                        :title="tab.label" @click.stop="selectTab(app.id, tab.key)">{{ tab.short }}</span>
                </div>
                <div class="ic-chevron" :class="{ open: expandedId === app.id }">›</div>
            </div>
        </div>

        <!-- Expanded notes detail -->
        <div v-if="expandedId === app.id" class="ic-detail">
            <!-- Tab bar -->
            <div class="ic-tabs">
                <button v-for="tab in notesTabs" :key="tab.key" class="ic-tab-btn"
                    :class="{ active: activeNoteTab[app.id] === tab.key, filled: isTabFilled(app, tab.key) }"
                    @click="activeNoteTab[app.id] = tab.key; cancelEditNote()">
                    {{ tab.label }}
                    <span v-if="isTabFilled(app, tab.key)" class="ic-tab-dot"></span>
                </button>
            </div>

            <!-- Note content: inline editable -->
            <div class="ic-note-body">
                <template
                    v-if="editingNote.appId === app.id && editingNote.tabKey === (activeNoteTab[app.id] || 'general')">
                    <textarea class="ic-note-textarea" v-model="inlineNoteValue"
                        :placeholder="`Add ${noteLabel(activeNoteTab[app.id] || 'general')} here…`"
                        @keydown.escape="cancelEditNote" @input="autoGrow"></textarea>
                    <div class="ic-note-edit-actions">
                        <button class="ic-btn ic-btn-save" @click="saveNoteInline(app, idx)">Save</button>
                        <button class="ic-btn" @click="cancelEditNote">Cancel</button>
                    </div>
                </template>
                <template v-else>
                    <div v-if="currentNote(app, activeNoteTab[app.id] || 'general')"
                        class="ic-note-text ic-note-text--clickable"
                        :title="`Click to edit ${noteLabel(activeNoteTab[app.id] || 'general')}`"
                        @click="startEditNote(app, activeNoteTab[app.id] || 'general')">
                        {{ currentNote(app, activeNoteTab[app.id] || 'general') }}
                    </div>
                    <div v-else class="ic-note-empty ic-note-empty--clickable"
                        @click="startEditNote(app, activeNoteTab[app.id] || 'general')">
                        No {{ noteLabel(activeNoteTab[app.id] || 'general') }} yet — click to add notes.
                    </div>
                </template>
            </div>

            <!-- Card actions -->
            <div class="ic-actions">
                <button class="ic-btn ic-btn-edit" @click="openModal(idx)">Edit Application</button>
                <button class="ic-btn ic-btn-delete" @click="$emit('delete', idx)">Remove</button>
            </div>
        </div>

        <!-- Collapsed quick-actions -->
        <div v-else class="ic-quick-actions">
            <button class="ic-btn ic-btn-edit" @click.stop="openModal(idx)">Edit</button>
            <button class="ic-btn ic-btn-delete" @click.stop="$emit('delete', idx)">Remove</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { useJobHuntData, type JobApplication } from '../../composables/useJobHuntData'

interface Props {
    app: JobApplication
    idx: number
    highlightedId: number | null
}

interface Emits {
    save: [appData: Omit<JobApplication, 'id'>, editIndex: number | null, previousStatus: string | undefined]
    delete: [index: number]
    edit: [index: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { daysAgo, blankAppNotes } = useJobHuntData()

// Expanded state: which card is open (should be managed by parent but we'll keep it simple for now)
const expandedId = ref<number | null>(null)
// Active notes tab per card
const activeNoteTab = reactive<Record<number, string>>({})
// Inline note editing state
const editingNote = reactive<{ appId: number | null; tabKey: string | null }>({ appId: null, tabKey: null })
// Holds the live value while the textarea is open
const inlineNoteValue = ref('')
const notesTabs = [
    { key: 'general', label: 'Notes', short: 'N' },
    { key: 'research', label: 'Research', short: 'R' },
    { key: 'prep', label: 'Interview Prep', short: 'P' },
    { key: 'questions', label: 'Questions to Ask', short: 'Q' },
    { key: 'debrief', label: 'Debrief', short: 'D' },
]

function appDays(app: JobApplication): number | null {
    return daysAgo(app.date)
}

function toggleExpand(id: number) {
    if (expandedId.value === id) {
        expandedId.value = null
        cancelEditNote()
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
    if (key === 'research') return !!app.appNotes.research?.trim()
    if (key === 'prep') return !!app.appNotes.interviewPrep?.trim()
    if (key === 'questions') return !!app.appNotes.questionsToAsk?.trim()
    if (key === 'debrief') return !!app.appNotes.interviewNotes?.trim()
    return false
}

function currentNote(app: JobApplication, key: string): string {
    if (key === 'general') return app.notes?.trim() || ''
    if (!app.appNotes) return ''
    if (key === 'research') return app.appNotes.research?.trim() || ''
    if (key === 'prep') return app.appNotes.interviewPrep?.trim() || ''
    if (key === 'questions') return app.appNotes.questionsToAsk?.trim() || ''
    if (key === 'debrief') return app.appNotes.interviewNotes?.trim() || ''
    return ''
}

function noteLabel(key: string): string {
    return notesTabs.find(t => t.key === key)?.label.toLowerCase() || 'notes'
}

function autoGrow(e: Event) {
    const el = e.target as HTMLTextAreaElement
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
}

function startEditNote(app: JobApplication, tabKey: string) {
    editingNote.appId = app.id
    editingNote.tabKey = tabKey
    inlineNoteValue.value = currentNote(app, tabKey)
    nextTick(() => {
        const el = document.querySelector<HTMLTextAreaElement>('.ic-note-textarea')
        if (el) {
            el.style.height = 'auto'
            el.style.height = el.scrollHeight + 'px'
            el.focus()
        }
    })
}

function cancelEditNote() {
    editingNote.appId = null
    editingNote.tabKey = null
    inlineNoteValue.value = ''
}

function saveNoteInline(app: JobApplication, idx: number) {
    if (editingNote.appId !== app.id || editingNote.tabKey === null) return
    const key = editingNote.tabKey
    const val = inlineNoteValue.value

    // Build the updated app with the new note value
    const updatedAppNotes = { ...(app.appNotes ?? blankAppNotes()) }
    let updatedNotes = app.notes ?? ''

    if (key === 'general') {
        updatedNotes = val
    } else if (key === 'research') {
        updatedAppNotes.research = val
    } else if (key === 'prep') {
        updatedAppNotes.interviewPrep = val
    } else if (key === 'questions') {
        updatedAppNotes.questionsToAsk = val
    } else if (key === 'debrief') {
        updatedAppNotes.interviewNotes = val
    }

    const formData: Omit<JobApplication, 'id'> = { ...app, notes: updatedNotes, appNotes: updatedAppNotes }
    emit('save', formData, props.idx, undefined)
    cancelEditNote()
}


function openModal(idx: number | null = null) {
    emit('edit', props.idx)
}

// Called by App.vue when "Open App" is clicked in the Actions tab.
// Switches to the card, expands its detail panel, scrolls it into view,
// and briefly highlights it so the user knows exactly which one opened.
async function highlightApp(appId: number) {
    if (props.app.id !== appId) return

    // Expand the card
    expandedId.value = appId
    if (!activeNoteTab[appId]) activeNoteTab[appId] = 'general'

    // Wait for the DOM to update with the expanded card
    await nextTick()

    // For scrolling into view, we'll rely on the parent container
    // since this component doesn't have direct access to the DOM element
}

// Expose highlightApp for parent to call
defineExpose({ highlightApp })
</script>

<style scoped>
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
    0% {
        box-shadow: 0 0 0 0 rgba(79, 142, 247, 0.5);
    }

    40% {
        box-shadow: 0 0 0 5px rgba(79, 142, 247, 0.25);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(79, 142, 247, 0);
    }
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

.ic-note-text--clickable {
    cursor: text;
    border-radius: 4px;
    padding: 4px 6px;
    margin: -4px -6px;
    transition: background 0.12s;
}

.ic-note-text--clickable:hover {
    background: var(--surface3);
}

.ic-note-empty {
    font-size: 12px;
    color: var(--text-dim);
    font-style: italic;
}

.ic-note-empty--clickable {
    cursor: text;
    border-radius: 4px;
    padding: 4px 6px;
    margin: -4px -6px;
    transition: background 0.12s;
}

.ic-note-empty--clickable:hover {
    background: var(--surface3);
    color: var(--text-muted);
}

.ic-note-textarea {
    width: 100%;
    min-height: 80px;
    background: var(--surface);
    border: 1px solid var(--accent);
    border-radius: 6px;
    color: var(--text);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    line-height: 1.65;
    padding: 8px 10px;
    resize: none;
    overflow: hidden;
    outline: none;
    box-sizing: border-box;
    box-shadow: 0 0 0 3px rgba(79, 142, 247, 0.12);
}

.ic-note-edit-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
}

.ic-btn-save {
    border-color: rgba(79, 142, 247, 0.4);
    background: var(--accent);
    color: #fff;
}

.ic-btn-save:hover {
    background: rgba(79, 142, 247, 0.85);
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
