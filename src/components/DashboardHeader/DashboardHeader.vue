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
        <a
          href="https://github.com/TheNerdMan/jobhunt-dashboard"
          target="_blank"
          rel="noopener noreferrer"
          class="edit-btn github-link"
          title="View on GitHub"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display:block;">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
        </a>
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
.github-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 3px 7px;
}

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
