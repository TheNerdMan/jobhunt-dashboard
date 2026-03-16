# Job Hunt Dashboard

A free, open source, privacy-first job search tracker that runs entirely in your browser. No account required, no data leaves your device.

**[Live Demo](https://your-username.github.io/jobhunt-dashboard/)** <!-- update this URL after deploying -->

---

## Features

- **Applications** — Track every job application with status, salary, location, source, and rich per-application notes (research, interview prep, questions to ask, post-interview debrief)
- **Kanban board** — Drag-and-drop applications between status columns (Applied, Interview, Offer, Denied, Withdrawn)
- **Interviews** — Filtered view of all active interview-stage applications
- **Timeline** — Chronological log of your job search events, with auto-logging on status changes
- **Recruiters** — Contact list for recruitment agents with last-contact tracking
- **Actions** — Smart to-do list surfacing follow-up reminders, stale application alerts, interview prep prompts, and recruiter check-in reminders
- **Charts** — Applications by date (bar) and by source (doughnut) on the home dashboard
- **Import / Export** — Download your data as JSON and restore it at any time
- **Settings** — Configure follow-up, stale, and recruiter check-in day thresholds

## Privacy

All data is stored in your browser's `localStorage`. Nothing is sent to any server. There are no accounts, no tracking, and no external API calls (except loading fonts from Google Fonts).

## Getting Started

**Use the live demo** — just open the link above and start adding your applications.

**Or run it locally:**

```bash
git clone https://github.com/your-username/jobhunt-dashboard.git
cd jobhunt-dashboard
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## Build

```bash
npm run build
```

Output goes to `dist/`. Serve it from any static file host.

## Tech Stack

- [Vue 3](https://vuejs.org/) with Composition API and `<script setup>`
- [TypeScript](https://www.typescriptlang.org/) in strict mode
- [Vite](https://vitejs.dev/) for dev server and bundling
- [Chart.js](https://www.chartjs.org/) for charts
- Native HTML5 drag-and-drop for the Kanban board

## Contributing

Pull requests are welcome. For significant changes, open an issue first to discuss what you'd like to change.

## License

[GPL v3](LICENSE)
