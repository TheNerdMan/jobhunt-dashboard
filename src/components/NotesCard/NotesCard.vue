<template>
  <div class="card">
    <div class="section-head">
      <div class="card-title" style="margin-bottom:0;">Notes &amp; tips</div>
      <button class="add-btn" @click="openNoteModal()">+ Add</button>
    </div>
    <div v-for="(n, i) in notes" :key="n.id" class="note-item">
      <span class="note-num">{{ String(i+1).padStart(2,'0') }}</span>
      <div style="flex:1;">
        <div style="font-size:11px;color:var(--text-dim);margin-bottom:2px;">{{ n.source }}</div>
        <div>{{ n.text }}</div>
      </div>
      <button class="del-btn" style="flex-shrink:0;align-self:flex-start;" @click="$emit('delete', i)">Del</button>
    </div>

    <NoteModal
      v-if="showNoteModal"
      :noteForm="noteForm"
      @save="saveNote"
      @close="showNoteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useJobHuntData, type Note } from '../../composables/useJobHuntData'
import NoteModal from '../NoteModal/NoteModal.vue'

interface Props {
  notes: Note[]
}

interface Emits {
  save: [noteData: Omit<Note, 'id'>]
  delete: [index: number]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { blankNote } = useJobHuntData()

// Modal state
const showNoteModal = ref(false)
const noteForm = reactive(blankNote())

function openNoteModal() {
  Object.assign(noteForm, blankNote())
  showNoteModal.value = true
}

function saveNote(formData: Omit<Note, 'id'>) {
  emit('save', formData)
  showNoteModal.value = false
}
</script>

<style scoped>
.note-item{
  display:flex;
  gap:10px;
  padding:8px 0;
  border-bottom:1px solid var(--border);
  font-size:13px;
  color:var(--text-muted);
  line-height:1.6;
}

.note-item:last-child{
  border-bottom:none;
}

.note-num{
  color:var(--text-dim);
  font-family:'DM Mono',monospace;
  font-size:11px;
  padding-top:3px;
  flex-shrink:0;
  min-width:18px;
}
</style>