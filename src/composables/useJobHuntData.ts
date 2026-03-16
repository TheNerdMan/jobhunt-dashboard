import { ref, reactive, computed, watch, nextTick, type Ref, type ComputedRef } from 'vue'
import { Chart, type ChartConfiguration } from 'chart.js/auto'

// Types
export interface AppNotes {
  research: string
  interviewPrep: string
  questionsToAsk: string
  interviewNotes: string
}

export interface JobApplication {
  id: number
  company: string
  title: string
  source: string
  status: 'Applied' | 'Interview' | 'Offer' | 'Denied' | 'Withdrawn'
  location: string
  salary: string
  date: string
  link: string
  notes: string
  appNotes?: AppNotes
}

export interface Recruiter {
  id: number
  name: string
  company: string
  role: string
  date: string
  email: string
  phone: string
  notes: string
}

export interface TimelineEvent {
  id: number
  date: string
  text: string
  type: 'act' | 'warn' | 'win'
  auto?: boolean
}

export interface Note {
  id: number
  source: string
  text: string
}

export interface Settings {
  followUpDays: number
  staleDays: number
  recruiterCheckInDays: number
}

export interface JobHuntData {
  apps: JobApplication[]
  recruiters: Recruiter[]
  timeline: TimelineEvent[]
  notes: Note[]
  settings?: Settings
}

export interface Metrics {
  total: number
  denied: number
  interviews: number
  offers: number
  active: number
  stale: number
  rate: number
}

export interface SourceLegendItem {
  label: string
  count: number
  color: string
}

export interface ActionItem {
  type: 'follow-up' | 'stale' | 'interview-prep' | 'recruiter-checkin'
  appId?: number
  recruiterId?: number
  company: string
  role?: string
  daysOverdue: number
  description: string
}

// Constants
const STORAGE_KEY = 'jobhunt_v3'
export const DEFAULT_FOLLOW_UP_DAYS = 7
export const DEFAULT_STALE_DAYS = 14
export const DEFAULT_RECRUITER_CHECKIN_DAYS = 14

const DEMO_SOURCE_COLORS: Record<string, string> = {
  'TalentBridge':     '#4f8ef7',
  'LinkedIn':         '#f5a623',
  'NextStep Recruit': '#3fcf8e',
  'Apex Talent':      '#f7614f',
  'Pinnacle Search':  '#a78bfa',
  'Direct':           '#2dd4bf',
}
const AVATAR_COLORS = ['av-blue', 'av-teal', 'av-purple', 'av-amber', 'av-green'] as const

// Demo start date: 14 days before today so the demo data looks "current"
function getDemoStartDate(): string {
  const d = new Date()
  d.setDate(d.getDate() - 14)
  return d.toISOString().slice(0, 10)
}

function demoDate(daysFromStart: number): string {
  const d = new Date(getDemoStartDate())
  d.setDate(d.getDate() + daysFromStart)
  return d.toISOString().slice(0, 10)
}

function demoDateShort(daysFromStart: number): string {
  const d = new Date(getDemoStartDate())
  d.setDate(d.getDate() + daysFromStart)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

const DEFAULT_DATA: JobHuntData = {
  apps: [
    {id:1,company:'Meridian Systems',title:'Senior Software Engineer',source:'TalentBridge',status:'Applied',location:'Remote, UK',salary:'£70k–£80k',date:demoDate(0),link:'',notes:'Fintech SaaS platform. C# and TypeScript stack on Azure.'},
    {id:2,company:'Vortex Cloud',title:'Senior Platform Engineer',source:'TalentBridge',status:'Applied',location:'London / Remote',salary:'£75k–£90k',date:demoDate(0),link:'',notes:'Distributed cloud infrastructure. TypeScript and Python in AWS.'},
    {id:3,company:'Helix Analytics',title:'Senior Backend Developer',source:'TalentBridge',status:'Denied',location:'Manchester',salary:'£65k–£75k',date:demoDate(0),link:'',notes:'Data pipeline tooling. Declined day 2.'},
    {id:4,company:'Luminary Tech',title:'Senior Full Stack Engineer',source:'TalentBridge',status:'Applied',location:'Remote, UK',salary:'£80k+',date:demoDate(1),link:'',notes:'AI-native developer tooling platform. TypeScript / Node.js.'},
    {id:5,company:'CrestBridge',title:'Full Stack Developer',source:'Direct',status:'Applied',location:'Bristol / Remote',salary:'£60k–£70k',date:demoDate(1),link:'',notes:'Applied directly via careers page. React and Node.js stack.'},
    {id:6,company:'Arcadia Software',title:'Senior .NET Developer',source:'TalentBridge',status:'Applied',location:'Remote',salary:'£70k–£85k',date:demoDate(2),link:'',notes:'FinTech POS SaaS. Azure/C# stack.'},
    {id:7,company:'Ember Platforms',title:'Senior Backend Engineer',source:'TalentBridge',status:'Denied',location:'London / Hybrid',salary:'£75k–£95k',date:demoDate(2),link:'',notes:'Python/Django, SQL, AWS. Declined after screening.'},
    {id:8,company:'Confidential',title:'Senior C# Software Engineer',source:'NextStep Recruit',status:'Interview',location:'City of London / Hybrid',salary:'£80k–£100k',date:demoDate(5),link:'',notes:'C#, .NET, TypeScript. First interview booked.'},
    {id:9,company:'Confidential',title:'Full Stack Developer',source:'NextStep Recruit',status:'Applied',location:'Bath / Hybrid',salary:'£60k–£75k',date:demoDate(5),link:'',notes:'C# .NET, Node.js, Azure. Role still being defined.'},
    {id:10,company:'Northgate Digital',title:'Full Stack Developer',source:'LinkedIn',status:'Applied',location:'Leeds / Remote',salary:'£65k',date:demoDate(6),link:'',notes:'Public sector digital transformation. C# and React.'},
    {id:11,company:'Stratos Games',title:'Software Engineer, Backend',source:'TalentBridge',status:'Applied',location:'Remote',salary:'£60k–£80k',date:demoDate(7),link:'',notes:'Backend services for a mid-sized games studio. C# and Redis.'},
    {id:12,company:'Safeguard Pro',title:'Senior Software Engineer',source:'TalentBridge',status:'Applied',location:'Leeds / Remote',salary:'£65k–£85k',date:demoDate(7),link:'',notes:'C# SaaS platform in the compliance space.'},
    {id:13,company:'RetailNext',title:'.NET Developer',source:'LinkedIn',status:'Applied',location:'London',salary:'£60k–£70k',date:demoDate(7),link:'',notes:'Retail analytics platform. Standard C# role.'},
    {id:14,company:'DataVault',title:'Software Engineer',source:'TalentBridge',status:'Applied',location:'London / Remote',salary:'£75k',date:demoDate(8),link:'',notes:'B2B data platform. C# and Vue frontend.'},
    {id:15,company:'Orbis Legal Tech',title:'Senior Platform Engineer',source:'TalentBridge',status:'Denied',location:'London / Hybrid',salary:'£80k–£110k',date:demoDate(8),link:'',notes:'AWS, CI/CD focus. Declined at CV stage.'},
    {id:16,company:'Beacon Financial',title:'Senior Software Developer',source:'TalentBridge',status:'Applied',location:'London',salary:'£75k–£85k',date:demoDate(9),link:'',notes:'Internal tooling and platform work.'},
    {id:17,company:'GreenBit',title:'Senior Software Engineer',source:'TalentBridge',status:'Applied',location:'Remote',salary:'£70k–£85k',date:demoDate(9),link:'',notes:'Climate tech startup. TypeScript, NestJS, React.'},
    {id:18,company:'Apex Learning',title:'Full Stack .NET Software Engineer',source:'Apex Talent',status:'Applied',location:'Remote / Hybrid',salary:'£60k–£75k',date:demoDate(10),link:'',notes:'EdTech SaaS. TDD, C#, Vue.'},
    {id:19,company:'Irongate Software',title:'Full Stack Software Developer',source:'Pinnacle Search',status:'Applied',location:'Gloucester / Hybrid',salary:'£55k–£65k',date:demoDate(12),link:'',notes:'.NET, Angular, SQL. Referred by recruiter.'},
    {id:20,company:'Translate Plus',title:'Backend Developer (.NET C#)',source:'TalentBridge',status:'Applied',location:'UK / London',salary:'£60k–£70k',date:demoDate(14),link:'',notes:'Backend C# services, Entity Framework, SQL, Docker.'},
  ],
  recruiters: [
    {id:1,name:'James Thornton',company:'TalentBridge',role:'Senior Business Director',date:demoDate(14),email:'james.thornton@talentbridge.co.uk',phone:'0333 010 1234',notes:'Great market intel call. Very responsive.'},
    {id:2,name:'Sarah Mitchell',company:'NextStep Recruit',role:'Account Manager',date:demoDate(5),email:'sarah.mitchell@nextsteprecrui.co.uk',phone:'',notes:'Submitted to two roles so far.'},
    {id:3,name:'Apex Talent',company:'Apex Talent',role:'(contact unknown)',date:demoDate(5),email:'',phone:'0203 111 2222',notes:'Reached out via their website contact form.'},
    {id:4,name:'Daniel Reeves',company:'Apex Talent',role:'Principal Consultant',date:demoDate(10),email:'daniel.reeves@apextalent.co.uk',phone:'020 7000 1234',notes:'Specialist in .NET and full stack roles.'},
    {id:5,name:'Laura Simmons',company:'Pinnacle Search',role:'Business Director',date:demoDate(14),email:'laura.simmons@pinnaclesearch.co.uk',phone:'Via LinkedIn',notes:'Put me forward for Irongate role.'},
  ],
  timeline: [
    {id:1,date:demoDateShort(0),text:'Started job search. Updated CV and LinkedIn profile.',type:'act'},
    {id:2,date:demoDateShort(0),text:'First 3 applications submitted via TalentBridge.',type:'act'},
    {id:3,date:demoDateShort(1),text:'Connected with James Thornton at TalentBridge. Strong market intel.',type:'act'},
    {id:4,date:demoDateShort(2),text:'Helix Analytics declined. Applied to 2 more roles.',type:'warn'},
    {id:5,date:demoDateShort(5),text:'Interview booked at Confidential role via NextStep Recruit.',type:'win'},
    {id:6,date:demoDateShort(6),text:'Applied to 3 more roles via LinkedIn and direct.',type:'act'},
    {id:7,date:demoDateShort(8),text:'Ember Platforms declined at screening. 10 applications total.',type:'warn'},
    {id:8,date:demoDateShort(10),text:'Orbis Legal Tech declined at CV stage. Submitted CV to Apex Talent.',type:'act'},
    {id:9,date:demoDateShort(12),text:'Networked with Laura Simmons (Pinnacle). Put forward for Irongate role.',type:'act'},
    {id:10,date:demoDateShort(14),text:'Call with James Thornton — market insights and CV tips. Applied to Translate Plus.',type:'act'},
  ],
  notes: [
    {id:1,source:'James Thornton, TalentBridge',text:'Add a second CV page with more detail about past roles. First page is strong — keep it concise.'},
    {id:2,source:'James Thornton, TalentBridge',text:'Job postings that are 1–2 weeks old may already be deep in the interview process.'},
    {id:3,source:'James Thornton, TalentBridge',text:'Fully remote employers are more selective than hybrid — expect longer processes.'},
    {id:4,source:'James Thornton, TalentBridge',text:'Certifications only carry weight if directly relevant to the role or industry.'},
    {id:5,source:'James Thornton, TalentBridge',text:'A weak portfolio site can actively harm your application — make it excellent or leave it off.'},
  ],
}
// Helper functions
function loadData(): JobHuntData {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (!s) return JSON.parse(JSON.stringify(DEFAULT_DATA))
    const parsed: JobHuntData = JSON.parse(s)
    // Migrate: ensure settings exist
    if (!parsed.settings) {
      parsed.settings = {
        followUpDays: DEFAULT_FOLLOW_UP_DAYS,
        staleDays: DEFAULT_STALE_DAYS,
        recruiterCheckInDays: DEFAULT_RECRUITER_CHECKIN_DAYS
      }
    }
    return parsed
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DATA))
  }
}

function nextId(arr: { id: number }[]): number {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1
}

function fmtDate(d: string): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function fmtDateShort(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function daysAgo(d: string): number | null {
  if (!d) return null
  return Math.floor((new Date().getTime() - new Date(d).getTime()) / 86400000)
}

function effectiveStatus(a: JobApplication, staleDays: number = DEFAULT_STALE_DAYS): string {
  if (a.status !== 'Applied') return a.status
  if (!a.date) return 'Applied'
  const days = daysAgo(a.date)
  return days !== null && days >= staleDays ? 'Stale' : 'Applied'
}

function mkInitials(name: string): string {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function blankApp(): Omit<JobApplication, 'id'> {
  return {
    company: '',
    title: '',
    source: '',
    status: 'Applied',
    location: '',
    salary: '',
    date: new Date().toISOString().slice(0, 10),
    link: '',
    notes: '',
    appNotes: { research: '', interviewPrep: '', questionsToAsk: '', interviewNotes: '' }
  }
}

function blankRec(): Omit<Recruiter, 'id'> {
  return {
    name: '',
    company: '',
    role: '',
    date: new Date().toISOString().slice(0, 10),
    email: '',
    phone: '',
    notes: ''
  }
}

function blankTl(): Omit<TimelineEvent, 'id'> {
  return {
    date: '',
    text: '',
    type: 'act'
  }
}

function blankNote(): Omit<Note, 'id'> {
  return {
    source: '',
    text: ''
  }
}

export function blankAppNotes(): AppNotes {
  return { research: '', interviewPrep: '', questionsToAsk: '', interviewNotes: '' }
}

// Chart management
let timeChart: Chart | null = null
let sourceChart: Chart | null = null

function buildCharts(apps: JobApplication[]): SourceLegendItem[] {
  const byDate: Record<string, number> = {}
  apps.forEach(a => {
    const k = fmtDate(a.date)
    byDate[k] = (byDate[k] || 0) + 1
  })
  
  const dLabels = Object.keys(byDate)
  const dCounts = dLabels.map(k => byDate[k])
  
  if (timeChart) timeChart.destroy()
  const tc = document.getElementById('timeChart') as HTMLCanvasElement | null
  if (tc) {
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: dLabels,
        datasets: [{
          data: dCounts,
          backgroundColor: 'rgba(79,142,247,0.6)',
          borderRadius: 3,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.raw} applied`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10 }, color: '#4a5060' }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { stepSize: 1, font: { size: 10 }, color: '#4a5060' },
            beginAtZero: true
          }
        }
      }
    }
    timeChart = new Chart(tc, config)
  }
  
  const bySource: Record<string, number> = {}
  apps.forEach(a => {
    bySource[a.source] = (bySource[a.source] || 0) + 1
  })
  
  const sLabels = Object.keys(bySource)
  const sCounts = sLabels.map(k => bySource[k])
  const sColors = sLabels.map(k => DEMO_SOURCE_COLORS[k] || '#888')
  
  if (sourceChart) sourceChart.destroy()
  const sc = document.getElementById('sourceChart') as HTMLCanvasElement | null
  if (sc) {
    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: sLabels,
        datasets: [{
          data: sCounts,
          backgroundColor: sColors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // @ts-expect-error cutout is valid for doughnut charts
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.raw} applications`
            }
          }
        }
      }
    }
    sourceChart = new Chart(sc, config)
  }
  
  return sLabels.map((l, i) => ({ label: l, count: sCounts[i], color: sColors[i] }))
}

export interface UseJobHuntDataReturn {
  // Data
  apps: Ref<JobApplication[]>
  recruiters: Ref<Recruiter[]>
  timeline: Ref<TimelineEvent[]>
  notes: Ref<Note[]>
  settings: Ref<Settings>
  
  // Computed
  dayCount: ComputedRef<number>
  weeksSince: ComputedRef<string>
  metrics: ComputedRef<Metrics>
  sourceLegend: Ref<SourceLegendItem[]>
  actionItems: ComputedRef<ActionItem[]>
  
  // Functions
  refreshCharts: () => Promise<void>
  exportData: () => void
  importData: (e: Event) => void
  resetToDefaults: () => void
  addAutoTimelineEvent: (text: string, type?: TimelineEvent['type']) => void
  
  // Helpers
  fmtDate: (d: string) => string
  fmtDateShort: () => string
  daysAgo: (d: string) => number | null
  effectiveStatus: (a: JobApplication, staleDays?: number) => string
  mkInitials: (name: string) => string
  nextId: (arr: { id: number }[]) => number
  blankApp: () => Omit<JobApplication, 'id'>
  blankRec: () => Omit<Recruiter, 'id'>
  blankTl: () => Omit<TimelineEvent, 'id'>
  blankNote: () => Omit<Note, 'id'>
  blankAppNotes: () => AppNotes
  
  // Constants
  STALE_DAYS: number
  AVATAR_COLORS: readonly string[]
}

export function useJobHuntData(): UseJobHuntDataReturn {
  const d = loadData()
  const apps = ref<JobApplication[]>(d.apps)
  const recruiters = ref<Recruiter[]>(d.recruiters)
  const timeline = ref<TimelineEvent[]>(d.timeline)
  const notes = ref<Note[]>(d.notes)
  const settings = ref<Settings>(d.settings ?? {
    followUpDays: DEFAULT_FOLLOW_UP_DAYS,
    staleDays: DEFAULT_STALE_DAYS,
    recruiterCheckInDays: DEFAULT_RECRUITER_CHECKIN_DAYS
  })

  // Auto-save to localStorage
  watch([apps, recruiters, timeline, notes, settings], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      apps: apps.value,
      recruiters: recruiters.value,
      timeline: timeline.value,
      notes: notes.value,
      settings: settings.value
    }))
  }, { deep: true })

  // Computed properties
  const dayCount = computed(() => Math.floor((new Date().getTime() - new Date('2026-03-02').getTime()) / 86400000) + 1)
  const weeksSince = computed(() => (dayCount.value / 7).toFixed(1))

  const metrics = computed<Metrics>(() => {
    const staleDays = settings.value.staleDays
    const total = apps.value.length
    const denied = apps.value.filter(a => effectiveStatus(a, staleDays) === 'Denied').length
    const interviews = apps.value.filter(a => effectiveStatus(a, staleDays) === 'Interview').length
    const offers = apps.value.filter(a => effectiveStatus(a, staleDays) === 'Offer').length
    const active = apps.value.filter(a => effectiveStatus(a, staleDays) === 'Applied').length
    const stale = apps.value.filter(a => effectiveStatus(a, staleDays) === 'Stale').length
    const rate = total ? Math.round((denied / total) * 100) : 0
    
    return { total, denied, interviews, offers, active, stale, rate }
  })

  // Action items computed
  const actionItems = computed<ActionItem[]>(() => {
    const items: ActionItem[] = []
    const { followUpDays, staleDays, recruiterCheckInDays } = settings.value

    for (const app of apps.value) {
      const days = daysAgo(app.date)
      const status = effectiveStatus(app, staleDays)

      // Follow-up needed: Applied, no response after followUpDays
      if (app.status === 'Applied' && days !== null && days >= followUpDays && days < staleDays) {
        items.push({
          type: 'follow-up',
          appId: app.id,
          company: app.company,
          role: app.title,
          daysOverdue: days - followUpDays,
          description: `No response after ${days} days — consider chasing`
        })
      }

      // Stale alert: Applied, past stale threshold
      if (status === 'Stale') {
        items.push({
          type: 'stale',
          appId: app.id,
          company: app.company,
          role: app.title,
          daysOverdue: days !== null ? days - staleDays : 0,
          description: `${days} days since application — likely gone quiet`
        })
      }

      // Interview prep reminder
      if (app.status === 'Interview') {
        items.push({
          type: 'interview-prep',
          appId: app.id,
          company: app.company,
          role: app.title,
          daysOverdue: 0,
          description: 'Active interview — prepare questions & research'
        })
      }
    }

    // Recruiter check-in reminders
    for (const rec of recruiters.value) {
      const days = daysAgo(rec.date)
      if (days !== null && days >= recruiterCheckInDays) {
        items.push({
          type: 'recruiter-checkin',
          recruiterId: rec.id,
          company: rec.company,
          role: rec.name,
          daysOverdue: days - recruiterCheckInDays,
          description: `Last contact ${days} days ago — check in`
        })
      }
    }

    // Sort: most overdue first
    return items.sort((a, b) => b.daysOverdue - a.daysOverdue)
  })

  // Chart management
  const sourceLegend = ref<SourceLegendItem[]>([])
  
  async function refreshCharts(): Promise<void> {
    await nextTick()
    sourceLegend.value = buildCharts(apps.value)
  }

  // Auto timeline event helper
  function addAutoTimelineEvent(text: string, type: TimelineEvent['type'] = 'act'): void {
    const event: TimelineEvent = {
      id: nextId(timeline.value),
      date: fmtDateShort(),
      text,
      type,
      auto: true
    }
    timeline.value.push(event)
  }

  // Import/Export functions
  function exportData(): void {
    const a = document.createElement('a')
    a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify({
      apps: apps.value,
      recruiters: recruiters.value,
      timeline: timeline.value,
      notes: notes.value,
      settings: settings.value
    }, null, 2))
    a.download = 'job-hunt-data.json'
    a.click()
  }

  function importData(e: Event): void {
    const target = e.target as HTMLInputElement
    const f = target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = ev => {
      try {
        const result = ev.target?.result as string
        const d: JobHuntData = JSON.parse(result)
        apps.value = d.apps || []
        recruiters.value = d.recruiters || []
        timeline.value = d.timeline || []
        notes.value = d.notes || []
        if (d.settings) settings.value = d.settings
      } catch {
        alert('Invalid JSON file.')
      }
    }
    r.readAsText(f)
  }

  function resetToDefaults(): void {
    if (!confirm('Reset to default data? This will overwrite all changes.')) return
    const d = JSON.parse(JSON.stringify(DEFAULT_DATA))
    apps.value = d.apps
    recruiters.value = d.recruiters
    timeline.value = d.timeline
    notes.value = d.notes
    settings.value = d.settings
  }

  return {
    // Data
    apps,
    recruiters,
    timeline,
    notes,
    settings,
    
    // Computed
    dayCount,
    weeksSince,
    metrics,
    sourceLegend,
    actionItems,
    
    // Functions
    refreshCharts,
    exportData,
    importData,
    resetToDefaults,
    addAutoTimelineEvent,
    
    // Helpers
    fmtDate,
    fmtDateShort,
    daysAgo,
    effectiveStatus,
    mkInitials,
    nextId,
    blankApp,
    blankRec,
    blankTl,
    blankNote,
    blankAppNotes,
    
    // Constants
    STALE_DAYS: settings.value.staleDays,
    AVATAR_COLORS
  }
}
