#!/usr/bin/env python3
"""Build the World's Coach matchup dataset from the analysis repo.

Reads the canonical unified ranking (plus the rich player table and team
coaching-report filenames) from the sibling analysis repo, and emits a single
``assets/matchups.json`` that the interactive tool loads.

Rating confidence intervals are NOT included: ``player_rating_uncertainty.csv``
is still on the legacy rating scale, so joining it against the v5 leaderboard
would misstate uncertainty. Re-add once that table is regenerated on the v5
scale.

All 32 World Cup teams are included so any matchup is selectable; teams whose
players have not yet cleared the rating floor come through with an empty player
list and ``rated_count = 0`` (they fill in when the analysis pipeline rates more
players). Stdlib only — no third-party dependencies.

    python scripts/build_matchup_data.py \
        [--analysis ../26-the-pattern-seekers-analysis/World-Cup-S-Bomb] \
        [--output assets/matchups.json]
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from pathlib import Path

WEBSITE_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ANALYSIS = WEBSITE_ROOT.parent / "26-the-pattern-seekers-analysis" / "World-Cup-S-Bomb"
DEFAULT_OUTPUT = WEBSITE_ROOT / "assets" / "matchups.json"

TITLE_RE = re.compile(r"^#\s+(.+?)\s+[—-]\s+.*Team (?:Coaching Report|Profile)", re.MULTILINE)
MAX_RANK = 585
RATING_ANCHORS = ((1, 95.50), (100, 84.00), (300, 72.00), (MAX_RANK, 60.00))


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def team_code_names(compiled_dir: Path) -> dict[str, str]:
    """Map 3-letter code -> full team name from the 32 team reports."""
    mapping: dict[str, str] = {}
    for report in sorted(compiled_dir.glob("*_team_coaching_report.md")):
        code = report.name.split("_", 1)[0]
        match = TITLE_RE.search(report.read_text(encoding="utf-8"))
        mapping[code] = match.group(1).strip() if match else code
    return mapping


def to_float(value: str) -> float | None:
    try:
        return round(float(value), 4)
    except (TypeError, ValueError):
        return None


def to_int(value: str) -> int | None:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def overall_rating(global_rank: int) -> float:
    """Map canonical publication rank to the shared, two-decimal overall scale."""
    if not 1 <= global_rank <= MAX_RANK:
        raise ValueError(f"Global rank outside 1..{MAX_RANK}: {global_rank}")
    left, right = next(
        (left, right)
        for left, right in zip(RATING_ANCHORS, RATING_ANCHORS[1:])
        if left[0] <= global_rank <= right[0]
    )
    progress = (global_rank - left[0]) / (right[0] - left[0])
    return round(left[1] + progress * (right[1] - left[1]), 2)


def build(analysis: Path) -> dict:
    compiled = analysis / "results" / "reports" / "teams"
    ranking_dir = analysis / "results" / "reports" / "ranking"
    unified = read_csv(ranking_dir / "unified_tournament_rankings.csv")
    rich_rows = read_csv(ranking_dir / "player_rankings_v3.csv")
    rich_by_identity = {(row["player"], row["team"]): row for row in rich_rows}

    if len(unified) != MAX_RANK:
        raise ValueError(f"Expected {MAX_RANK} unified players, found {len(unified)}")

    code_by_name = {name: code for code, name in team_code_names(compiled).items()}

    players_by_team: dict[str, list[dict]] = {}
    for row in unified:
        name = row["Team"]
        player_name = row["Player"]
        rich = rich_by_identity.get((player_name, name))
        if rich is None:
            raise ValueError(f"Unified player missing rich row: {player_name} ({name})")
        global_rank = to_int(row["Global Rank"])
        if global_rank is None:
            raise ValueError(f"Missing global rank: {player_name} ({name})")
        players_by_team.setdefault(name, []).append(
            {
                "id": rich["player_id"],
                "name": player_name,
                "position": row.get("Position Group", ""),
                "role": rich.get("functional_role", ""),
                "rating": overall_rating(global_rank),
                "team_rank": to_int(row.get("Team Rank", "")),
                "global_rank": global_rank,
                "position_rank": to_int(rich.get("position_rank_v3", "")),
                "minutes": to_int(rich.get("minutes", "")),
            }
        )

    teams = []
    for code, name in sorted(team_code_names(compiled).items(), key=lambda kv: kv[1]):
        roster = sorted(
            players_by_team.get(name, []),
            key=lambda player: (player["team_rank"] is None, player["team_rank"] or 0),
        )
        ratings = [p["rating"] for p in roster if p["rating"] is not None]
        teams.append(
            {
                "code": code,
                "name": name,
                "rated_count": len(roster),
                "avg_rating": round(sum(ratings) / len(ratings), 4) if ratings else None,
                "top_rating": max(ratings) if ratings else None,
                "players": roster,
            }
        )

    # sanity: teams present in the leaderboard should all have mapped to a code
    unmapped = sorted(set(players_by_team) - set(code_by_name))
    return {
        "generated_from": "unified_tournament_rankings.csv + player_rankings_v3.csv + FIFA-style rank scale",
        "team_count": len(teams),
        "rated_player_count": len(unified),
        "unmapped_teams": unmapped,
        "teams": teams,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--analysis", type=Path, default=DEFAULT_ANALYSIS)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    if not args.analysis.exists():
        raise SystemExit(f"Analysis repo not found: {args.analysis}")

    payload = build(args.analysis)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    rated = sum(1 for t in payload["teams"] if t["rated_count"])
    print(
        f"Wrote {args.output.relative_to(WEBSITE_ROOT)}: "
        f"{payload['team_count']} teams ({rated} with rated players), "
        f"{payload['rated_player_count']} players."
    )
    if payload["unmapped_teams"]:
        print(f"WARNING: leaderboard teams with no code mapping: {payload['unmapped_teams']}")


if __name__ == "__main__":
    main()
