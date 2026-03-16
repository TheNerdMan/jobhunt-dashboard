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
        <button class="edit-btn" @click="$emit('reset')">Reset to defaults</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  dayCount: number
  weeksSince: string
}

interface Emits {
  export: []
  import: [event: Event]
  reset: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>