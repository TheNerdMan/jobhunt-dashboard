<template>
  <div class="grid-4">
    <div class="metric">
      <div class="metric-label">Total applications</div>
      <div class="metric-value">{{ metrics.total }}</div>
      <div class="metric-sub">{{ recruiterCount }} recruiter{{ recruiterCount !== 1 ? 's' : '' }} engaged</div>
    </div>
    <div class="metric">
      <div class="metric-label">Active</div>
      <div class="metric-value" style="color:var(--accent)">{{ metrics.active }}</div>
      <div class="metric-sub">{{ metrics.stale }} stale (no reply &gt;{{ staleDays }}d)</div>
    </div>
    <div class="metric">
      <div class="metric-label">Interviews</div>
      <div class="metric-value" style="color:var(--green)">{{ metrics.interviews }}</div>
      <div class="metric-sub">{{ metrics.offers }} offer{{ metrics.offers !== 1 ? 's' : '' }}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Declined</div>
      <div class="metric-value" style="color:var(--red)">{{ metrics.denied }}</div>
      <div class="metric-sub">{{ metrics.rate }}% decline rate</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Metrics } from '../../composables/useJobHuntData'

interface Props {
  metrics: Metrics
  recruiterCount: number
  staleDays: number
}

defineProps<Props>()
</script>

<style scoped>
.metric{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:var(--radius-lg);
  padding:1.25rem;
}

.metric-label{
  font-size:12px;
  color:var(--text-muted);
  margin-bottom:6px;
}

.metric-value{
  font-size:32px;
  font-weight:300;
  letter-spacing:-0.03em;
  line-height:1;
}

.metric-sub{
  font-size:11px;
  color:var(--text-dim);
  margin-top:6px;
}
</style>