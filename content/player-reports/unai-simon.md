---
title: "Unai Simón — player profile"
description: "This report uses tournament events and coverage-qualified StatsBomb 360 context. It is not an optical-tracking report or a subjective scouting grade."
layout: "player-report"
url: "/projects/worlds-coach-output/reports/unai-simon/"
playerId: "sb-11748"
sourceUrl: "https://github.com/ucd-cosmos-data/26-the-pattern-seekers-analysis/blob/0aa13e7289c0ce81452c8fc3a67efe3e849c1aef/World-Cup-S-Bomb/results/reports/player_profiles/unai-sim-n-mendibil-11748.md"
displayName: "Unai Simón"
wikiTitle: "Unai Simón"
headshotUrl: ""
shirtNumber: ""
overview: "Unai Simón was Spain's goalkeeper. The active goalkeeper model ranked him #14 in its separate 32-player table. Goalkeepers do not enter the global outfield or 300-minute rankings."
strengths:
  - "The goalkeeper value combines calibrated PSxG prevention with distinct clutch, penalty, shootout, and support channels."
weaknesses:
  - "The result describes a small tournament sample, so goalkeeper conclusions remain cautious."
---

## Active tournament valuation

- Team: Spain
- Minutes: 413.9
- Status: Ranked (team main goalkeeper)
- Goalkeeper rank: 14
- Consolidated Goalkeeper Value: 0.1364
- Raw consolidated value: 0.0385
- 95% score interval: 0.0319 to 0.4665
- Bootstrap rank interval: 6 to 30

## Evidence channels

| Channel | Value |
|---|---:|
| PSxG shot-stopping | -0.0209 |
| Clutch-save residual | 0.0489 |
| Regular-penalty impact | 0.0000 |
| Shootout win probability added | 0.0497 |
| Support value | 0.1007 |
| Expected threat faced per 90 | 0.5936 |
| Defensive-shield downside adjustment | 0.0218 |
| Reliability | 0.4791 |

The active goalkeeper ranking is one consolidated, identity-blind metric. It values
ordinary shot prevention from calibrated post-shot probabilities, adds only the
incremental residual for late high-consequence saves, and applies sample-size
reliability to penalties, shootouts, and the final score. When at least four
matches of evidence show below-median threat faced, a below-prior ordinary-play
downside is additionally shrunk toward the cohort prior; positive evidence,
penalties, shootouts, and support play are unchanged. Advancement, awards,
reputation, and named-player rules are not scoring inputs.

Goalkeepers are excluded from the global outfield and 300-minute rankings.
