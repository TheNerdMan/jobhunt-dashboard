<template>
  <div class="card">
    <div class="section-head">
      <div class="card-title" style="margin-bottom:0;">Timeline</div>
      <button class="add-btn" @click="openTlModal()">+ Add event</button>
    </div>
    <div v-for="(e, i) in timeline" :key="e.id" class="tl-item">
      <div class="tl-date">{{ e.date }}</div>
      <div class="tl-spine">
        <div class="tl-dot" :style="{background:tlDot(e.type)}"></div>
        <div v-if="i < timeline.length - 1" class="tl-line"></div>
      </div>
      <div class="tl-text">
        {{ e.text }}
        <button class="del-btn" style="margin-left:8px;" @click="$emit('delete', i)">Del</button>
      </div>
    </div>

    <TimelineModal
      v-if="showTlModal"
      :tlForm="tlForm"
      @save="saveTimelineEvent"
      @close="showTlModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useJobHuntData, type TimelineEvent } from '../composables/useJobHuntData'
import TimelineModal from './TimelineModal.vue'

interface Props {
  timeline: TimelineEvent[]
}

interface Emits {
  save: [tlData: Omit<TimelineEvent, 'id'>]
  delete: [index: number]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { blankTl } = useJobHuntData()

// Modal state
const showTlModal = ref(false)
const tlForm = reactive(blankTl())

function tlDot(type: TimelineEvent['type']): string {
  return type === 'warn' ? 'var(--red)' : type === 'win' ? 'var(--green)' : 'var(--accent)'
}

function openTlModal() {
  Object.assign(tlForm, blankTl())
  showTlModal.value = true
}

function saveTimelineEvent(formData: Omit<TimelineEvent, 'id'>) {
  emit('save', formData)
  showTlModal.value = false
}
</script>

<style scoped>
.tl-item{
  display:flex;
  gap:12px;
}

.tl-spine{
  display:flex;
  flex-direction:column;
  align-items:center;
}

.tl-dot{
  width:8px;
  height:8px;
  border-radius:50%;
  flex-shrink:0;
  margin-top:4px;
}

.tl-line{
  flex:1;
  width:1px;
  background:var(--border);
  margin-top:4px;
  min-height:16px;
}

.tl-date{
  font-size:11px;
  color:var(--text-dim);
  min-width:72px;
  padding-top:2px;
  font-family:'DM Mono',monospace;
}

.tl-text{
  font-size:13px;
  color:var(--text-muted);
  line-height:1.6;
  padding-bottom:14px;
}
</style>