---
title: "Alisson — player profile"
description: "This report uses tournament events and coverage-qualified StatsBomb 360 context. It is not an optical-tracking report or a subjective scouting grade."
layout: "player-report"
url: "/projects/worlds-coach-output/reports/alisson/"
playerId: "sb-5547"
sourceUrl: "https://github.com/ucd-cosmos-data/26-the-pattern-seekers-analysis/blob/0aa13e7289c0ce81452c8fc3a67efe3e849c1aef/World-Cup-S-Bomb/results/reports/player_profiles/alisson-rams-s-becker-5547.md"
displayName: "Alisson"
wikiTitle: "Alisson"
headshotUrl: ""
shirtNumber: ""
overview: "Alisson was Brazil's goalkeeper. The active goalkeeper model ranked him #16 in its separate 32-player table. Goalkeepers do not enter the global outfield or 300-minute rankings."
strengths:
  - "The goalkeeper value combines calibrated PSxG prevention with distinct clutch, penalty, shootout, and support channels."
weaknesses:
  - "The result describes a small tournament sample, so goalkeeper conclusions remain cautious."
---

## Active tournament valuation

- Team: Brazil
- Minutes: 395.0
- Status: Ranked (team main goalkeeper)
- Goalkeeper rank: 16
- Consolidated Goalkeeper Value: 0.0928
- Raw consolidated value: 0.0303
- 95% score interval: 0.0000 to 0.2217
- Bootstrap rank interval: 22 to 32

## Evidence channels

| Channel | Value |
|---|---:|
| PSxG shot-stopping | -0.0427 |
| Clutch-save residual | 0.0060 |
| Regular-penalty impact | 0.0000 |
| Shootout win probability added | 0.0000 |
| Support value | -0.0435 |
| Expected threat faced per 90 | 0.4685 |
| Defensive-shield downside adjustment | 0.0419 |
| Reliability | 0.4674 |

The active goalkeeper ranking is one consolidated, identity-blind metric. It values
ordinary shot prevention from calibrated post-shot probabilities, adds only the
incremental residual for late high-consequence saves, and applies sample-size
reliability to penalties, shootouts, and the final score. When at least four
matches of evidence show below-median threat faced, a below-prior ordinary-play
downside is additionally shrunk toward the cohort prior; positive evidence,
penalties, shootouts, and support play are unchanged. Advancement, awards,
reputation, and named-player rules are not scoring inputs.

Goalkeepers are excluded from the global outfield and 300-minute rankings.
