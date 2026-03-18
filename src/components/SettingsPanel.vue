<template>
  <div class="card">
    <div class="card-title">Settings</div>

    <div class="settings-grid">
      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">Follow-up reminder</div>
          <div class="setting-desc">Days after applying before a follow-up action appears</div>
        </div>
        <div class="setting-control">
          <input v-model.number="localSettings.followUpDays" type="number" min="1" max="60" @change="save">
          <span class="setting-unit">days</span>
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">Stale threshold</div>
          <div class="setting-desc">Days after applying before an application is marked stale</div>
        </div>
        <div class="setting-control">
          <input v-model.number="localSettings.staleDays" type="number" min="1" max="90" @change="save">
          <span class="setting-unit">days</span>
        </div>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <div class="setting-label">Recruiter check-in</div>
          <div class="setting-desc">Days since last contact before a recruiter check-in appears</div>
        </div>
        <div class="setting-control">
          <input v-model.number="localSettings.recruiterCheckInDays" type="number" min="1" max="90" @change="save">
          <span class="setting-unit">days</span>
        </div>
      </div>
    </div>

    <!-- Source colours -->
    <div class="section-title">Source colours</div>
    <div v-if="sourceEntries.length === 0" class="no-sources">
      No sources yet — colours are assigned automatically when you add applications.
    </div>
    <div v-else class="source-colors-grid">
      <div
        v-for="[source] in sourceEntries"
        :key="source"
        class="source-color-row"
        ref="rowRefs"
      >
        <span class="source-dot" :style="{ background: colorOf(source) }"></span>
        <span class="source-name">{{ source }}</span>

        <!-- Swatch trigger -->
        <button
          class="swatch-btn"
          :style="{ background: colorOf(source) }"
          :aria-label="`Pick colour for ${source}`"
          @click.stop="togglePicker(source, $event)"
        ></button>

        <!-- Floating picker popover -->
        <Teleport to="body">
          <div
            v-if="activeSource === source"
            class="picker-popover"
            :style="popoverStyle"
            @click.stop
            @mousedown.stop
          >

            <hex-color-picker
              :color="colorOf(source)"
              @color-changed="onPickerChange(source, $event)"
            ></hex-color-picker>
            <div class="hex-input-row">
              <span class="hex-hash">#</span>
              <input
                class="hex-input"
                :value="colorOf(source).replace('#', '')"
                maxlength="6"
                spellcheck="false"
                @input="onHexInput(source, ($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>
        </Teleport>
      </div>
    </div>

    <div class="settings-footer">
      <button class="btn-reset-defaults" @click="resetToDefaults">Reset to defaults</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted, onBeforeUnmount } from 'vue'
import 'vanilla-colorful/hex-color-picker.js'
import { useJobHuntData, DEFAULT_FOLLOW_UP_DAYS, DEFAULT_STALE_DAYS, DEFAULT_RECRUITER_CHECKIN_DAYS } from '../composables/useJobHuntData'

const emit = defineEmits<{ colorChanged: [] }>()

const { settings, apps } = useJobHuntData()

const localSettings = reactive({
  followUpDays: settings.value.followUpDays,
  staleDays: settings.value.staleDays,
  recruiterCheckInDays: settings.value.recruiterCheckInDays,
})

// All known sources: union of sourceColors keys + apps sources, sorted
const sourceEntries = computed(() => {
  const known = new Set<string>(Object.keys(settings.value.sourceColors))
  apps.value.forEach(a => { if (a.source) known.add(a.source) })
  return [...known].sort().map(s => [s, settings.value.sourceColors[s] ?? '#888888'] as [string, string])
})

function colorOf(source: string): string {
  return settings.value.sourceColors[source] ?? '#888888'
}

// Picker state
const activeSource = ref<string | null>(null)
const popoverStyle = ref<Record<string, string>>({})

function togglePicker(source: string, event: MouseEvent) {
  if (activeSource.value === source) {
    activeSource.value = null
    return
  }
  activeSource.value = source
  positionPopover(event.currentTarget as HTMLElement)
}

function positionPopover(trigger: HTMLElement) {
  const rect = trigger.getBoundingClientRect()
  const pickerW = 200
  const pickerH = 240 // approximate: 200px canvas + 40px hex row
  const margin = 8

  let left = rect.right + margin
  let top = rect.top + window.scrollY

  // Flip left if overflows right edge
  if (left + pickerW > window.innerWidth - margin) {
    left = rect.left - pickerW - margin
  }

  // Clamp top so it doesn't overflow bottom
  const maxTop = window.innerHeight + window.scrollY - pickerH - margin
  if (top > maxTop) top = maxTop

  popoverStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
  }
}

function onPickerChange(source: string, event: Event) {
  const detail = (event as CustomEvent).detail
  const color: string = typeof detail === 'string' ? detail : detail?.value ?? detail?.hex ?? ''
  if (color) updateColor(source, color)
}

function onHexInput(source: string, raw: string) {
  const cleaned = raw.replace(/[^0-9a-fA-F]/g, '')
  if (cleaned.length === 6) updateColor(source, '#' + cleaned)
}

function updateColor(source: string, color: string) {
  settings.value.sourceColors = { ...settings.value.sourceColors, [source]: color }
  emit('colorChanged')
}

function save() {
  settings.value.followUpDays = localSettings.followUpDays
  settings.value.staleDays = localSettings.staleDays
  settings.value.recruiterCheckInDays = localSettings.recruiterCheckInDays
}

function resetToDefaults() {
  localSettings.followUpDays = DEFAULT_FOLLOW_UP_DAYS
  localSettings.staleDays = DEFAULT_STALE_DAYS
  localSettings.recruiterCheckInDays = DEFAULT_RECRUITER_CHECKIN_DAYS
  save()
}

// Close picker when clicking outside
function onDocClick() {
  activeSource.value = null
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<style scoped>
.settings-grid{
  display:flex;
  flex-direction:column;
  gap:0;
}

.setting-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:12px 0;
  border-bottom:1px solid var(--border);
}

.setting-row:last-child{
  border-bottom:none;
}

.setting-info{
  flex:1;
  min-width:0;
}

.setting-label{
  font-size:13px;
  font-weight:500;
  color:var(--text);
  margin-bottom:2px;
}

.setting-desc{
  font-size:11px;
  color:var(--text-dim);
  line-height:1.4;
}

.setting-control{
  display:flex;
  align-items:center;
  gap:6px;
  flex-shrink:0;
}

.setting-control input{
  width:60px;
  padding:6px 8px;
  background:var(--surface2);
  border:1px solid var(--border-strong);
  border-radius:var(--radius);
  color:var(--text);
  font-family:'DM Mono',monospace;
  font-size:13px;
  text-align:center;
}

.setting-control input:focus{
  outline:none;
  border-color:rgba(79,142,247,0.5);
}

.setting-unit{
  font-size:11px;
  color:var(--text-dim);
}

/* Source colours section */
.section-title{
  font-size:12px;
  font-weight:600;
  color:var(--text-dim);
  text-transform:uppercase;
  letter-spacing:0.06em;
  margin-top:1.5rem;
  margin-bottom:0.75rem;
}

.no-sources{
  font-size:12px;
  color:var(--text-dim);
  padding:8px 0;
}

.source-colors-grid{
  display:flex;
  flex-direction:column;
  gap:0;
}

.source-color-row{
  display:flex;
  align-items:center;
  gap:10px;
  padding:9px 0;
  border-bottom:1px solid var(--border);
  position:relative;
}

.source-color-row:last-child{
  border-bottom:none;
}

.source-dot{
  width:8px;
  height:8px;
  border-radius:50%;
  flex-shrink:0;
}

.source-name{
  flex:1;
  font-size:13px;
  color:var(--text);
  min-width:0;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.swatch-btn{
  width:28px;
  height:28px;
  border-radius:6px;
  border:2px solid var(--border-strong);
  cursor:pointer;
  flex-shrink:0;
  padding:0;
  transition:border-color 0.15s, transform 0.1s;
}

.swatch-btn:hover{
  border-color:rgba(255,255,255,0.35);
  transform:scale(1.08);
}

/* Settings footer */
.settings-footer{
  margin-top:1.25rem;
  display:flex;
  justify-content:flex-end;
}

.btn-reset-defaults{
  font-size:11px;
  padding:5px 12px;
  border-radius:6px;
  border:1px solid var(--border-strong);
  background:transparent;
  color:var(--text-muted);
  cursor:pointer;
  font-family:'DM Sans',sans-serif;
  transition:all 0.15s;
}

.btn-reset-defaults:hover{
  background:var(--surface2);
  color:var(--text);
}
</style>

<!-- Unscoped: style the teleported popover and the custom element internals -->
<style>
.picker-popover{
  position:fixed;
  z-index:9999;
  background:var(--surface2);
  border:1px solid var(--border-strong);
  border-radius:10px;
  padding:10px;
  box-shadow:0 8px 32px rgba(0,0,0,0.55);
  display:flex;
  flex-direction:column;
  gap:8px;
  width:200px;
}

/* vanilla-colorful custom element sizing */
.picker-popover hex-color-picker{
  width:180px;
  height:180px;
}

/* Hue/saturation pointer sizing */
.picker-popover hex-color-picker::part(saturation){
  border-radius:6px 6px 0 0;
}

.hex-input-row{
  display:flex;
  align-items:center;
  gap:4px;
  background:var(--surface3);
  border:1px solid var(--border-strong);
  border-radius:6px;
  padding:4px 8px;
}

.hex-hash{
  font-family:'DM Mono',monospace;
  font-size:12px;
  color:var(--text-dim);
  user-select:none;
}

.hex-input{
  flex:1;
  background:transparent;
  border:none;
  outline:none;
  color:var(--text);
  font-family:'DM Mono',monospace;
  font-size:12px;
  letter-spacing:0.05em;
  text-transform:uppercase;
  width:0;
  min-width:0;
}
</style>
