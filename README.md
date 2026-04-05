# Baker Schedule Calculator

**Version 0.3.0** - An ADHD-friendly sourdough baking schedule calculator with mid-process resumption, automatic adjustment, progress tracking, and bake history. Plan your bake backward from your target completion time and automatically adjust if you fall behind or get ahead of schedule.

## Features

### Phase 1 ✅ Complete
- ✅ **Schedule Generation**: Enter target completion time → get complete timeline with all checkpoints
- ✅ **Flexible Timing**: Account for temperature variations in bulk fermentation
- ✅ **Proof Method Selection**: Choose room temp or cold proof strategy
- ✅ **Step Tracking**: Mark steps complete and see actual vs planned time
- ✅ **Adjustment Logic**: If running late, automatically recalculate remaining steps

### Phase 2 ✅ Complete
- ✅ **Resume Bake**: Check progress mid-bake at any time
- ✅ **Pace Calculation**: See if you're ahead/behind/on-track for your target
- ✅ **Fast-Track Option**: Reduce fermentation time to finish earlier
- ✅ **Extend Option**: Add time to bulk or final fermentation  
- ✅ **Auto-Save**: Active bakes persist across page refreshes
- ✅ **Live Recalculation**: Schedule updates instantly on adjustments

### Phase 3 ✅ Complete
- ✅ **Template Management**: Clone, delete, export/import templates
- ✅ **Progress Visualization**: Real-time progress bars with percentage
- ✅ **Step Timers**: Countdown timers for each step with overtime detection
- ✅ **Bake History**: Track all past bakes with statistics
- ✅ **Analytics**: Success rate, average variance, trends

## Quick Start

### Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# Opens at http://localhost:5173
```

### Build & Deploy
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

## How It Works

### The Problem
Sourdough timing is complex and temperature-dependent. Bakers need to know:
- When to start the entire process
- Each checkpoint along the way
- How to adjust if they fall behind schedule

### The Solution
1. **Input Target Time**: "I want my loaf cooled and ready by 6:45 PM"
2. **Customize Workflow**: Select bulk fermentation duration based on room temperature
3. **Get Timeline**: Complete schedule with all steps and exact timestamps
4. **Track Progress**: Mark steps complete, app shows countdown to next step
5. **Check Progress Anytime**: Mid-bake? Go to "Check Progress" and see if you're on pace
6. **Adjust Strategy**: Choose fast-track (reduce time) OR extend (add time) based on needs
7. **Auto-Save**: Everything saves automatically - resume anytime

## Workflow Steps (Sourdough)

1. **Feed Starter** (3-4 hours ahead)
2. **Autolyse** (30 min) - Flour + water rest
3. **Mix** (10 min) - Add starter + salt
4. **Bulk Fermentation** (3-8 hours) - Adjustable based on temperature
5. **Stretch & Fold** (within bulk fermentation)
6. **Bench Rest** (30 min) - Shape and rest
7. **Final Proof** (1-4 hours room temp, or 24-48 hours cold)
8. **Bake** (45 min) - 25 min covered, 20 min uncovered
9. **Cool** (90 min)

**Total Time**: ~24-48 hours depending on method (includes overnight cold proof)

## Data Model

### Bake Template
```javascript
{
  id: 'uuid',
  name: 'Standard Sourdough',
  workflow: {
    feedStarter: { minutes: 180, description: '...' },
    autolyse: { minutes: 30, description: '...' },
    // ... more steps
  }
}
```

### Active Bake Session
```javascript
{
  id: 'uuid',
  templateId: 'uuid',
  targetCompletionTime: '2026-04-05T18:45:00Z',
  schedule: [
    {
      stepId: 'feedStarter',
      stepName: 'Feed Starter',
      plannedTime: '2026-04-05T12:15:00Z',
      actualTime: null,
      status: 'pending', // pending, completed, skipped
      duration: 180,
      notes: '...'
    },
    // ... more steps
  ],
  adjustments: []
}
```

## Technology Stack

- **Framework**: Vue 3 (Composition API)
- **Build**: Vite
- **State Management**: Pinia
- **Storage**: LocalStorage (browser-based)
- **Styling**: TailwindCSS
- **Dates**: date-fns
- **Deployment**: Vercel

## Project Structure

```
src/
├── main.js                          # App entry
├── App.vue                          # Root component
├── router/index.js                  # Vue Router config
├── stores/
│   ├── templates.js                 # Saved bake templates
│   └── activeBake.js                # Current bake session
├── views/
│   ├── HomeView.vue                 # Template selection
│   ├── CalculatorView.vue           # Schedule generation
│   ├── TrackerView.vue              # Step tracking
│   ├── ResumeView.vue               # Check progress mid-bake
│   ├── HistoryView.vue              # Bake history & stats
│   └── TemplatesView.vue            # Template management
├── components/
│   ├── ScheduleTimeline.vue         # Visual timeline
│   ├── StepCard.vue                 # Individual step display
│   ├── AdjustmentModal.vue          # Adjustment UI
│   ├── AdjustmentOptions.vue        # Fast-track/extend options
│   ├── ProgressBar.vue              # Progress visualization
│   ├── StepTimer.vue                # Countdown timer
│   └── TemplateManager.vue          # Clone/delete templates
├── stores/
│   ├── templates.js                 # Bake templates (with persistence)
│   ├── activeBake.js                # Current bake session
│   └── bakeHistory.js               # Completed bake history
├── composables/
│   ├── useScheduleCalculator.js     # Core calculation logic
│   └── usePaceCalculation.js        # Pace calculation
└── assets/
    └── main.css                     # Global styles + Tailwind
```

## Development Notes

### "Nothing Style" Design Philosophy
- Minimal aesthetic: no gradients, animations, or decorations
- Maximum clarity: scannable, high contrast, clear typography
- ADHD-friendly: large tap targets, no visual clutter, simple flows
- Functional first: every element serves a purpose

### Browser Storage
- All data stored in LocalStorage (5-10MB available)
- Private by default - no cloud sync in MVP
- Automatic persistence with Pinia

### Temperature Variables
Sourdough fermentation times are temperature-dependent. The app accounts for:
- **Warm room (75-80°F)**: 3-4 hour bulk fermentation
- **Room temp (68-72°F)**: 4-6 hour bulk fermentation (default)
- **Cool room (65°F)**: 6-8 hour bulk fermentation
- **Custom**: User can input exact duration

### Key Assumptions
- User knows when they want their loaf **completely cooled** (not just baked)
- Bulk fermentation is the primary variable step
- Final proof can be either quick room temp or overnight cold
- Bake time is fixed at 45 minutes (25 min covered, 20 min uncovered)
- Cooling requires 1.5-2 hours minimum

## Future Features (Not MVP)

- [ ] Notifications when it's time for next step
- [ ] Timer for current step countdown
- [ ] Bake history and statistics
- [ ] Multiple loaf support
- [ ] PDF export of schedule
- [ ] Cloud sync via Firebase or similar
- [ ] Mobile app (React Native/SwiftUI)

## Known Limitations

- No reminder notifications (planned for next phase)
- Templates stored locally only (no cloud backup)
- Single loaf at a time
- No ingredient tracking or notes
- No oven preheat tracking

## Contributing

This is a personal project. For issues or feature requests, please open an issue in GitHub.

## License

MIT

## Baking Resources

Sourdough workflow researched from:
- [The Perfect Loaf - Weekday Sourdough](https://www.theperfectloaf.com/simple-weekday-sourdough-bread/)
- [The Pantry Mama - Baking Timelines](https://pantrymama.com/baking-timelines-for-sourdough/)
- [King Arthur Baking - Bulk Fermentation](https://www.kingarthurbaking.com/blog/2019/07/22/bulk-fermentation)
- [Amy Bakes Bread - Timeline for Beginners](https://amybakesbread.com/sourdough-timeline-for-beginners-how-to-fit-it-into-your-day/)

---

**Made with ❤️ for bakers who want to understand their schedule, not just follow it.**
