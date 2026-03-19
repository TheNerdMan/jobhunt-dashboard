<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <h3>Add note / tip</h3>
      <div class="field">
        <label>Source / context</label>
        <input v-model="localForm.source" type="text" placeholder="Max Wilcock, 16 Mar">
      </div>
      <div class="field">
        <label>Note</label>
        <textarea v-model="localForm.text" placeholder="What was the tip or note?"></textarea>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="$emit('close')">Cancel</button>
        <button class="btn-save" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Note } from '../../composables/useJobHuntData'

interface Props {
  noteForm: Omit<Note, 'id'>
}

interface Emits {
  save: [formData: Omit<Note, 'id'>]
  close: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localForm = reactive({ ...props.noteForm })

// Watch for changes in the prop to update local form
watch(() => props.noteForm, (newForm) => {
  Object.assign(localForm, newForm)
}, { deep: true })

function save() {
  if (!localForm.text.trim()) return
  emit('save', { ...localForm })
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
  max-width:520px;
  max-height:90vh;
  overflow-y:auto;
}

.modal h3{
  font-size:15px;
  font-weight:500;
  margin-bottom:1.25rem;
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
  min-height:70px;
  resize:vertical;
}

.field select option{
  background:var(--surface);
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