#!/usr/bin/env python3
"""Refresh the existing matchup cards from the active ranking release.

The matchup cards remain outfield-only because the active methodology publishes
goalkeepers in a separate dedicated table. The script preserves the existing
32-team JSON contract and visual treatment; it only refreshes the values,
ordering, counts, roles, and ranking fields.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

WEBSITE_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ANALYSIS = WEBSITE_ROOT.parent / "26-the-pattern-seekers-analysis" / "World-Cup-S-Bomb"
DEFAULT_OUTPUT = WEBSITE_ROOT / "assets" / "matchups.json"
CURRENT_MATCHUPS = WEBSITE_ROOT / "assets" / "matchups.json"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def to_float(value: str | None) -> float | None:
    try:
        return round(float(value), 4)
    except (TypeError, ValueError):
        return None


def to_int(value: str | None) -> int | None:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def team_code_names() -> dict[str, str]:
    current = json.loads(CURRENT_MATCHUPS.read_text(encoding="utf-8"))
    mapping = {team["code"]: team["name"] for team in current["teams"]}
    if len(mapping) != 32:
        raise ValueError("The committed matchup file must retain all 32 team codes")
    return mapping


def build(analysis: Path) -> dict:
    ranking_dir = analysis / "results" / "reports" / "ranking"
    outfield = read_csv(ranking_dir / "global_rankings_outfield.csv")
    code_to_name = team_code_names()
    code_by_name = {name: code for code, name in code_to_name.items()}

    players_by_team: dict[str, list[dict]] = {}
    for row in outfield:
        team = row["team"]
        player = {
            "id": row["player_id"],
            "name": row["player"],
            "position": row.get("position_group", ""),
            "role": row.get("functional_role", ""),
            "rating": to_float(row.get("active_publication_score_v5")),
            "team_rank": to_int(row.get("publication_team_rank_v5")),
            "global_rank": to_int(row.get("publication_global_rank_v5")),
            "position_rank": to_int(row.get("position_rank_v3")),
            "minutes": to_int(row.get("minutes")),
        }
        if player["global_rank"] is None or player["team_rank"] is None or player["rating"] is None:
            raise ValueError(f"Missing active outfield publication fields for {player['name']}")
        players_by_team.setdefault(team, []).append(player)

    teams = []
    for code, name in sorted(code_to_name.items(), key=lambda item: item[1]):
        roster = sorted(players_by_team.get(name, []), key=lambda player: player["team_rank"])
        ratings = [player["rating"] for player in roster]
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

    unmapped = sorted(set(players_by_team) - set(code_by_name))
    return {
        "generated_from": (
            "global_rankings_outfield.csv "
            "(active outfield publication; goalkeepers ranked separately)"
        ),
        "team_count": len(teams),
        "rated_player_count": len(outfield),
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
    if payload["unmapped_teams"]:
        raise SystemExit(f"Ranking teams have no site code: {payload['unmapped_teams']}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(
        f"Wrote {args.output.relative_to(WEBSITE_ROOT)}: "
        f"{payload['team_count']} teams, {payload['rated_player_count']} outfield players."
    )


if __name__ == "__main__":
    main()
