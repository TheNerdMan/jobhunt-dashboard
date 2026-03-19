<template>
  <div class="card">
    <div class="section-head">
      <div class="card-title" style="margin-bottom:0;">Recruitment agents</div>
      <button class="add-btn" @click="openRecModal()">+ Add</button>
    </div>
    <div v-for="(r, i) in recruiters" :key="r.id" class="rec-row">
      <div class="avatar" :class="avClass(i)">{{ recInits(r) }}</div>
      <div style="flex:1;min-width:0;">
        <div style="font-size:13px;font-weight:500;color:var(--text);">{{ r.name }}</div>
        <div style="font-size:12px;color:var(--text-muted);">{{ r.company }} · {{ r.role }}</div>
        <div v-if="r.email" style="font-size:11px;color:var(--text-muted);">{{ r.email }}</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:11px;color:var(--text-dim);font-family:'DM Mono',monospace;">{{ fmtDate(r.date) }}</div>
        <div style="display:flex;gap:4px;margin-top:4px;justify-content:flex-end;">
          <button class="edit-btn" @click="openRecModal(i)">Edit</button>
          <button class="del-btn" @click="$emit('delete', i)">Del</button>
        </div>
      </div>
    </div>

    <RecruiterModal
      v-if="showRecModal"
      :recForm="recForm"
      :editIndex="recEditIdx"
      @save="saveRecruiter"
      @close="showRecModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useJobHuntData, type Recruiter } from '../../composables/useJobHuntData'
import RecruiterModal from '../RecruiterModal/RecruiterModal.vue'

interface Props {
  recruiters: Recruiter[]
}

interface Emits {
  save: [recData: Omit<Recruiter, 'id'>, editIndex: number | null]
  delete: [index: number]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { fmtDate, mkInitials, blankRec, AVATAR_COLORS } = useJobHuntData()

// Modal state
const showRecModal = ref(false)
const recEditIdx = ref<number | null>(null)
const recForm = reactive(blankRec())

// Methods
function avClass(i: number): string {
  return AVATAR_COLORS[i % AVATAR_COLORS.length]
}

function recInits(r: Recruiter): string {
  return mkInitials(r.name)
}

function openRecModal(idx: number | null = null) {
  recEditIdx.value = idx
  Object.assign(recForm, blankRec(), idx !== null ? props.recruiters[idx] : {})
  showRecModal.value = true
}

function saveRecruiter(formData: Omit<Recruiter, 'id'>) {
  emit('save', formData, recEditIdx.value)
  showRecModal.value = false
}
</script>

<style scoped>
.avatar{
  width:34px;
  height:34px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:500;
  flex-shrink:0;
  font-family:'DM Mono',monospace;
}

.av-blue{background:rgba(79,142,247,0.15);color:var(--accent);}
.av-teal{background:rgba(45,212,191,0.15);color:var(--teal);}
.av-purple{background:var(--purple-dim);color:var(--purple);}
.av-amber{background:var(--amber-dim);color:var(--amber);}
.av-green{background:var(--green-dim);color:var(--green);}

.rec-row{
  display:flex;
  align-items:center;
  gap:10px;
  padding:9px 0;
  border-bottom:1px solid var(--border);
}

.rec-row:last-child{
  border-bottom:none;
}
</style>