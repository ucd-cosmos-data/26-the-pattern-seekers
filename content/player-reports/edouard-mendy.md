---
title: "Édouard Mendy — player profile"
description: "This report uses tournament events and coverage-qualified StatsBomb 360 context. It is not an optical-tracking report or a subjective scouting grade."
layout: "player-report"
url: "/projects/worlds-coach-output/reports/edouard-mendy/"
playerId: "sb-7379"
sourceUrl: "https://github.com/ucd-cosmos-data/26-the-pattern-seekers-analysis/blob/0aa13e7289c0ce81452c8fc3a67efe3e849c1aef/World-Cup-S-Bomb/results/reports/player_profiles/edouard-mendy-7379.md"
displayName: "Édouard Mendy"
wikiTitle: "Édouard Mendy"
headshotUrl: ""
shirtNumber: ""
overview: "Édouard Mendy was Senegal's goalkeeper. The active goalkeeper model ranked him #29 in its separate 32-player table. Goalkeepers do not enter the global outfield or 300-minute rankings."
strengths:
  - "The goalkeeper value combines calibrated PSxG prevention with distinct clutch, penalty, shootout, and support channels."
weaknesses:
  - "The result describes a small tournament sample, so goalkeeper conclusions remain cautious."
---

## Active tournament valuation

- Team: Senegal
- Minutes: 387.3
- Status: Ranked (team main goalkeeper)
- Goalkeeper rank: 29
- Consolidated Goalkeeper Value: 0.0133
- Raw consolidated value: 0.0153
- 95% score interval: 0.0000 to 0.3977
- Bootstrap rank interval: 8 to 32

## Evidence channels

| Channel | Value |
|---|---:|
| PSxG shot-stopping | -0.0962 |
| Clutch-save residual | 0.1249 |
| Regular-penalty impact | 0.0000 |
| Shootout win probability added | 0.0000 |
| Support value | 0.0305 |
| Expected threat faced per 90 | 1.1868 |
| Defensive-shield downside adjustment | 0.0000 |
| Reliability | 0.4625 |

The active goalkeeper ranking is one consolidated, identity-blind metric. It values
ordinary shot prevention from calibrated post-shot probabilities, adds only the
incremental residual for late high-consequence saves, and applies sample-size
reliability to penalties, shootouts, and the final score. When at least four
matches of evidence show below-median threat faced, a below-prior ordinary-play
downside is additionally shrunk toward the cohort prior; positive evidence,
penalties, shootouts, and support play are unchanged. Advancement, awards,
reputation, and named-player rules are not scoring inputs.

Goalkeepers are excluded from the global outfield and 300-minute rankings.
