# Test Plan (Sikiru)

## Devices
- [ ] Android phone, Chrome, normal connection — full demo script runs clean
- [ ] iPhone or second Android if available — layout, tap targets, no horizontal scroll
- [ ] Desktop Chrome + Firefox — sanity pass

## Offline
- [ ] Load app once, then **airplane mode** — reload works, all tabs work, charts render
- [ ] Check-in edit in airplane mode, refresh — edit persists (localStorage)

## Slow connection
- [ ] DevTools network throttle "Slow 3G" — landing interactive fast, no blank screen

## Rules verification
- [ ] Tests tab shows 15/15 pass on the deployed link (not just localhost)
- [ ] Day slider: Day 7 green, Day 10 sleep Watch, Day 11 sleep Alert, Day 12 overall Alert
- [ ] Enter BP 185/125 in check-in → Urgent sheet opens

## Content check (with Sovereign)
- [ ] Every number/wording matches the research sheet before freeze
- [ ] Demo banner visible on landing + every app screen

## Backup
- [ ] Record the 3-minute demo video on the phone (screen record)
- [ ] Submit the public link + video early
