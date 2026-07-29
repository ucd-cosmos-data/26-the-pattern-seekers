#!/usr/bin/env python3
"""Build the World's Coach matchup dataset from the analysis repo.

Reads the per-player leaderboard and rating-uncertainty tables (plus the team
coaching-report filenames for code<->name mapping) from the sibling analysis
repo, and emits a single ``data/matchups.json`` that the interactive tool loads.

All 32 World Cup teams are included so any matchup is selectable; teams whose
players have not yet cleared the rating floor come through with an empty player
list and ``rated_count = 0`` (they fill in when the analysis pipeline rates more
players). Stdlib only — no third-party dependencies.

    python scripts/build_matchup_data.py \
        [--analysis ../26-the-pattern-seekers-analysis/World-Cup-S-Bomb] \
        [--output data/matchups.json]
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

TITLE_RE = re.compile(r"^#\s+(.+?)\s+[—-]\s+Team Coaching Report", re.MULTILINE)


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


def build(analysis: Path) -> dict:
    compiled = analysis / "results" / "reports" / "compiled"
    leaderboard = read_csv(analysis / "results" / "reports" / "player_leaderboard.csv")

    # player_leaderboard.csv is the canonical, self-consistent source: its rating
    # (0-1) and global/position/team ranks all agree. Confidence intervals live
    # in a separate table that is currently on an older rating scale, so they are
    # intentionally not joined here — they can be re-added once regenerated.
    code_by_name = {name: code for code, name in team_code_names(compiled).items()}

    players_by_team: dict[str, list[dict]] = {}
    for row in leaderboard:
        name = row["team"]
        players_by_team.setdefault(name, []).append(
            {
                "id": row["player_id"],
                "name": row["player_name"],
                "position": row.get("position_group", ""),
                "role": row.get("functional_role", ""),
                "rating": to_float(row.get("final_player_rating", "")),
                "team_rank": to_int(row.get("team_rank", "")),
                "global_rank": to_int(row.get("global_rank", "")),
                "position_rank": to_int(row.get("position_rank", "")),
                "minutes": to_int(row.get("minutes", "")),
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
        "generated_from": "player_leaderboard.csv + player_rating_uncertainty.csv",
        "team_count": len(teams),
        "rated_player_count": len(leaderboard),
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
