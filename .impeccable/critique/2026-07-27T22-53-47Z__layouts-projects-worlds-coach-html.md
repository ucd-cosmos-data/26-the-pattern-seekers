---
target: the World’s Coach project page
total_score: 21
max_score: 32
na_heuristics: 5,9
p0_count: 0
p1_count: 3
timestamp: 2026-07-27T22-53-47Z
slug: layouts-projects-worlds-coach-html
---
Method: dual-agent (A: /root/critique_design · B: /root/critique_detector)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3 | Scenario changes rewrite the page without one announced update. |
| 2 | Match System / Real World | 3 | Football language is natural, but several model metrics are unexplained. |
| 3 | User Control and Freedom | 2 | Plan-comparison buttons create contradictory state without changing the plan. |
| 4 | Consistency and Standards | 3 | Most controls are coherent; comparison controls imply consequences they do not have. |
| 5 | Error Prevention | n/a | No consequential data-entry or destructive flow exists. |
| 6 | Recognition Rather Than Recall | 3 | Visible labels help, but specialist metrics still require inference. |
| 7 | Flexibility and Efficiency | 3 | Keyboard, scrubber, and playback paths are strong; advanced controls crowd the default path. |
| 8 | Aesthetic and Minimalist Design | 2 | Too many controls, metric families, and fully expanded sections compete. |
| 9 | Error Recovery | n/a | No recoverable transaction exists on this explanatory surface. |
| 10 | Help and Documentation | 2 | Some tactical help exists, but prototype scores and specialist metrics lack context. |
| **Total** | | **21/32** | **Acceptable — substantial clarity and trust work remains.** |

## Design Specificity Verdict

The football pitch, positional language, tactical phases, player roles, and coaching vocabulary are strongly authored for this product. The weakness is structural: the page still follows a generic dashboard sequence and presents illustrative precision with production-level authority.

The deterministic scan returned zero findings for `layouts/projects/worlds-coach.html`. This does not contradict the design review: the highest-impact defects are information architecture, misleading interaction semantics, trust hierarchy, and cognitive load rather than mechanically detectable anti-patterns. Browser evidence was unavailable because no browser backend was present, so no visual overlay exists.

## Overall Impression

The pitch is the page’s strongest and most distinctive idea. The surrounding interface asks the visitor to operate too many controls and interpret too many synthetic metrics before that idea can land. The largest opportunity is to turn the page into one guided reading path: recommendation, tactical sequence, effects, roles, limitations.

## What’s Working

- The tactical visual language feels like a coaching artifact rather than a generic analytics dashboard.
- Keyboard tab navigation, playback controls, reduced-motion behavior, player labels, and live captions show strong interaction care.
- The page exposes reasoning, tradeoffs, roles, and validation limits instead of presenting only an answer.

## Priority Issues

1. **[P1] Prototype precision is presented as model authority.** The confidence, effect changes, plan scores, gravity metric, and evidence values look validated while the production model is disconnected. Qualify every illustrative metric family adjacent to the claim and remove precision that does not change the decision. Suggested commands: `$impeccable clarify`, `$impeccable quieter`.
2. **[P1] Plan comparison creates a false consequential choice.** Selecting an alternative only changes the row and helper copy while the recommendation, pitch, effects, and roles remain unchanged. Remove the interaction or connect the entire output. Suggested command: `$impeccable distill`.
3. **[P1] Expert controls bury the primary story.** Five tactical views, seven phase buttons, four facts, playback controls, effects, comparison, gravity, roles, and evidence compete in one flow. Use a guided default path and progressive disclosure. Suggested commands: `$impeccable distill`, `$impeccable layout`.
4. **[P2] Mobile player targets are too small.** Visible markers are roughly 22–27 px and labels depend on hover/focus. Preserve small markers inside 44 px interactive hit areas. Suggested command: `$impeccable layout`.
5. **[P2] Scenario-wide changes lack unified accessible feedback.** Add one polite live summary after state or forward changes. Suggested command: `$impeccable clarify`.

## Persona Red Flags

- **Jordan, first-timer:** Two scenario selectors lead immediately to five tactical tabs and seven phases; specialist terms and late prototype disclosure obscure the first useful action.
- **Riley, stress tester:** Alternative-plan selection contradicts the rest of the page, and exact prototype numbers conflict with the late limitation notes.
- **Casey, mobile user:** The page is long, targets are too small, and advanced controls appear before the useful sequence.

## Minor Observations

- The correct Hugo URL includes `/26-the-pattern-seekers/`.
- Percentage bars do not explain their scale.
- Footnote links have no return links.
- Roving tab focus and reduced-motion step controls are implemented well.

## Questions to Consider

- Should the page explain one recommendation or simulate coaching choices? The current implementation attempts both.
- If a number is illustrative, does the number improve understanding enough to justify its authority?
- What three facts should a visitor understand after thirty seconds?

Questions skipped: the user explicitly requested a ruthless all-at-once pass using critique, quieter, distill, layout, clarify, and animate.
