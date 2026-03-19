<template>
  <div class="grid-2">
    <div class="card">
      <div class="card-title">Applications by date</div>
      <div class="chart-wrap">
        <canvas id="timeChart"></canvas>
      </div>
    </div>
    <div class="card">
      <div class="card-title">By source</div>
      <div style="position:relative;width:100%;height:120px;">
        <canvas id="sourceChart"></canvas>
      </div>
      <div class="legend">
        <span v-for="l in sourceLegend" :key="l.label" class="legend-item">
          <span class="legend-dot" :style="{ background: l.color }"></span>{{ l.label }} ({{ l.count }})
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { SourceLegendItem } from '../../composables/useJobHuntData'

interface Props {
  sourceLegend: SourceLegendItem[]
}

interface Emits {
  refresh: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()

onMounted(() => {
  emit('refresh')
})
</script>

<style scoped>
.chart-wrap{
  position:relative;
  width:100%;
  height:160px;
}

.legend{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:8px;
}

.legend-item{
  display:flex;
  align-items:center;
  gap:5px;
  font-size:11px;
  color:var(--text-muted);
}

.legend-dot{
  width:7px;
  height:7px;
  border-radius:50%;
}
</style>