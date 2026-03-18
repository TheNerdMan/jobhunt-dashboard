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
      <InterviewCard
        v-for="(app, idx) in apps"
        :key="app.id"
        :ref="el => setInterviewCardRef(el, app.id)"
        :app="app"
        :idx="idx"
        :highlighted-id="highlightedId"
        @save="(appData, editIndex, prevStatus) => emit('save', appData, editIndex, prevStatus)"
        @delete="emit('delete', $event)"
        @edit="openModal"
      />
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
import { ref, reactive, nextTick } from 'vue'
import { useJobHuntData, type JobApplication } from '../composables/useJobHuntData'
import ApplicationModal from './ApplicationModal.vue'
import InterviewCard from './InterviewCard.vue'

interface Props {
  apps: JobApplication[]
}

interface Emits {
  save: [appData: Omit<JobApplication, 'id'>, editIndex: number | null, previousStatus: string | undefined]
  delete: [index: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { blankApp, blankAppNotes } = useJobHuntData()

// Highlighted card id (brief flash on programmatic navigation)
const highlightedId = ref<number | null>(null)
// Refs to InterviewCard components
const interviewCardRefs = reactive<Record<number, any>>({})

// Modal state
const showModal = ref(false)
const editIndex = ref<number | null>(null)
const appForm = reactive({ ...blankApp() })
const previousStatus = ref<string | undefined>(undefined)

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

// Store InterviewCard component refs
function setInterviewCardRef(el: any, appId: number) {
  if (el) {
    interviewCardRefs[appId] = el
  }
}

// Called by App.vue when "Open App" is clicked in the Actions tab.
// Switches to the card, expands its detail panel, scrolls it into view,
// and briefly highlights it so the user knows exactly which one opened.
async function highlightApp(appId: number) {
  const cardRef = interviewCardRefs[appId]
  if (cardRef && cardRef.highlightApp) {
    await cardRef.highlightApp(appId)
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
</style>
