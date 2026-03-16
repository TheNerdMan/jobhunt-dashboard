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

    <div class="settings-footer">
      <button class="btn-reset-defaults" @click="resetToDefaults">Reset to defaults</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useJobHuntData, DEFAULT_FOLLOW_UP_DAYS, DEFAULT_STALE_DAYS, DEFAULT_RECRUITER_CHECKIN_DAYS } from '../composables/useJobHuntData'

const { settings } = useJobHuntData()

const localSettings = reactive({ ...settings.value })

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
