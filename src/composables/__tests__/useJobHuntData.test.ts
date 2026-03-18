import { describe, it, expect, beforeEach } from 'vitest'
import { useJobHuntData, DEFAULT_FOLLOW_UP_DAYS, DEFAULT_STALE_DAYS, DEFAULT_RECRUITER_CHECKIN_DAYS } from '../useJobHuntData'
import type { JobApplication } from '../useJobHuntData'

describe('useJobHuntData helpers', () => {
  let helpers: ReturnType<typeof useJobHuntData>

  beforeEach(() => {
    helpers = useJobHuntData()
  })

  // ── fmtDate ──────────────────────────────────────────────────────────────
  describe('fmtDate', () => {
    it('formats a valid ISO date string to dd Mon', () => {
      // Use a fixed date to avoid locale flakiness
      const result = helpers.fmtDate('2025-06-15')
      expect(result).toBe('15 Jun')
    })

    it('returns an empty string when given an empty string', () => {
      expect(helpers.fmtDate('')).toBe('')
    })
  })

  // ── daysAgo ───────────────────────────────────────────────────────────────
  describe('daysAgo', () => {
    it('returns null for an empty date string', () => {
      expect(helpers.daysAgo('')).toBeNull()
    })

    it('returns 0 for today\'s date', () => {
      const today = new Date().toISOString().slice(0, 10)
      expect(helpers.daysAgo(today)).toBe(0)
    })

    it('returns a positive number for a past date', () => {
      const pastDate = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10)
      expect(helpers.daysAgo(pastDate)).toBe(3)
    })
  })

  // ── effectiveStatus ───────────────────────────────────────────────────────
  describe('effectiveStatus', () => {
    const baseApp: JobApplication = {
      id: 1,
      company: 'Acme',
      title: 'Engineer',
      source: 'LinkedIn',
      status: 'Applied',
      location: 'Remote',
      salary: '£50k',
      date: new Date().toISOString().slice(0, 10),
      link: '',
      notes: ''
    }

    it('returns "Applied" for a recent Applied application', () => {
      expect(helpers.effectiveStatus(baseApp, DEFAULT_STALE_DAYS)).toBe('Applied')
    })

    it('returns "Stale" when Applied and date is beyond staleDays', () => {
      const staleDate = new Date(Date.now() - (DEFAULT_STALE_DAYS + 1) * 86400000).toISOString().slice(0, 10)
      const staleApp = { ...baseApp, date: staleDate }
      expect(helpers.effectiveStatus(staleApp, DEFAULT_STALE_DAYS)).toBe('Stale')
    })

    it('returns the original status unchanged for non-Applied statuses', () => {
      const interviewApp = { ...baseApp, status: 'Interview' as const }
      expect(helpers.effectiveStatus(interviewApp, DEFAULT_STALE_DAYS)).toBe('Interview')

      const deniedApp = { ...baseApp, status: 'Denied' as const }
      expect(helpers.effectiveStatus(deniedApp, DEFAULT_STALE_DAYS)).toBe('Denied')

      const offerApp = { ...baseApp, status: 'Offer' as const }
      expect(helpers.effectiveStatus(offerApp, DEFAULT_STALE_DAYS)).toBe('Offer')
    })

    it('returns "Applied" when the date is missing', () => {
      const noDateApp = { ...baseApp, date: '' }
      expect(helpers.effectiveStatus(noDateApp, DEFAULT_STALE_DAYS)).toBe('Applied')
    })
  })

  // ── nextId ────────────────────────────────────────────────────────────────
  describe('nextId', () => {
    it('returns 1 for an empty array', () => {
      expect(helpers.nextId([])).toBe(1)
    })

    it('returns max id + 1', () => {
      expect(helpers.nextId([{ id: 1 }, { id: 5 }, { id: 3 }])).toBe(6)
    })
  })

  // ── mkInitials ────────────────────────────────────────────────────────────
  describe('mkInitials', () => {
    it('returns two uppercase initials for a two-word name', () => {
      expect(helpers.mkInitials('John Smith')).toBe('JS')
    })

    it('returns one initial for a single-word name', () => {
      expect(helpers.mkInitials('Alice')).toBe('A')
    })

    it('returns the first two initials for a multi-word name', () => {
      expect(helpers.mkInitials('Mary Jane Watson')).toBe('MJ')
    })
  })

  // ── blankApp ──────────────────────────────────────────────────────────────
  describe('blankApp', () => {
    it('returns an object with empty company and "Applied" status', () => {
      const app = helpers.blankApp()
      expect(app.company).toBe('')
      expect(app.status).toBe('Applied')
    })

    it('sets date to today', () => {
      const today = new Date().toISOString().slice(0, 10)
      expect(helpers.blankApp().date).toBe(today)
    })
  })

  // ── blankRec ──────────────────────────────────────────────────────────────
  describe('blankRec', () => {
    it('returns a recruiter template with empty fields', () => {
      const rec = helpers.blankRec()
      expect(rec.name).toBe('')
      expect(rec.company).toBe('')
      expect(rec.email).toBe('')
    })
  })

  // ── blankAppNotes ─────────────────────────────────────────────────────────
  describe('blankAppNotes', () => {
    it('returns an object with empty string fields', () => {
      const notes = helpers.blankAppNotes()
      expect(notes.research).toBe('')
      expect(notes.interviewPrep).toBe('')
      expect(notes.questionsToAsk).toBe('')
      expect(notes.interviewNotes).toBe('')
    })
  })

  // ── exported constants ────────────────────────────────────────────────────
  describe('exported constants', () => {
    it('DEFAULT_FOLLOW_UP_DAYS is 7', () => {
      expect(DEFAULT_FOLLOW_UP_DAYS).toBe(7)
    })

    it('DEFAULT_STALE_DAYS is 14', () => {
      expect(DEFAULT_STALE_DAYS).toBe(14)
    })

    it('DEFAULT_RECRUITER_CHECKIN_DAYS is 14', () => {
      expect(DEFAULT_RECRUITER_CHECKIN_DAYS).toBe(14)
    })

    it('AVATAR_COLORS is a non-empty array of strings', () => {
      const { AVATAR_COLORS } = helpers
      expect(Array.isArray(AVATAR_COLORS)).toBe(true)
      expect(AVATAR_COLORS.length).toBeGreaterThan(0)
      expect(typeof AVATAR_COLORS[0]).toBe('string')
    })
  })

  // ── addAutoTimelineEvent ──────────────────────────────────────────────────
  describe('addAutoTimelineEvent', () => {
    it('appends an event to the timeline', () => {
      const { timeline, addAutoTimelineEvent } = helpers
      const before = timeline.value.length
      addAutoTimelineEvent('Test event', 'act')
      expect(timeline.value.length).toBe(before + 1)
      const last = timeline.value[timeline.value.length - 1]
      expect(last.text).toBe('Test event')
      expect(last.type).toBe('act')
      expect(last.auto).toBe(true)
    })
  })
})
