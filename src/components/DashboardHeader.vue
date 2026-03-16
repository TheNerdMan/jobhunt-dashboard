<template>
  <div style="margin-bottom:2rem;">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <div>
        <h1 style="font-size:24px;font-weight:500;letter-spacing:-0.02em;">Job Hunt Dashboard</h1>
        <p style="font-size:13px;color:var(--text-muted);margin-top:4px;">
          Started <span class="mono">02 Mar 2026</span> &mdash;
          Day <span class="mono">{{ dayCount }}</span> &mdash;
          {{ weeksSince }} weeks in
        </p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="edit-btn" @click="$emit('export')">Export JSON</button>
        <label class="edit-btn" style="cursor:pointer;">
          Import JSON
          <input type="file" accept=".json" style="display:none" @change="$emit('import', $event)">
        </label>
        <button v-if="demoMode" class="start-using-btn" @click="$emit('startUsing')">Start using</button>
        <button v-else class="edit-btn" @click="$emit('reset')">Reset to defaults</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  dayCount: number
  weeksSince: string
  demoMode: boolean
}

interface Emits {
  export: []
  import: [event: Event]
  reset: []
  startUsing: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
.start-using-btn {
  font-size: 11px;
  padding: 3px 12px;
  border-radius: 5px;
  border: none;
  background: #ffffff;
  color: #0e0f11;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  letter-spacing: 0.01em;
  animation: start-pulse 2s ease-in-out infinite;
  transition: opacity 0.15s, transform 0.15s;
}

.start-using-btn:hover {
  opacity: 0.9;
  transform: scale(1.03);
  animation: none;
}

@keyframes start-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(255, 255, 255, 0);
  }
}
</style>
