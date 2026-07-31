#!/usr/bin/env python3
"""Refresh matchup cards from outfield v4 on the shared Overall scale.

The cards retain the approved 553-player outfield-v4 order. The 32 main
goalkeepers stay in their separate v5 product, but their rank percentiles are
inserted into the same 585-player comparison order used to calculate Overall.
"""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

WEBSITE_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ANALYSIS = WEBSITE_ROOT.parent / "26-the-pattern-seekers-analysis" / "World-Cup-S-Bomb"
DEFAULT_OUTPUT = WEBSITE_ROOT / "assets" / "matchups.json"
MAX_RANK = 585
RATING_ANCHORS = ((1, 95.50), (100, 84.00), (300, 72.00), (MAX_RANK, 60.00))
TEAM_CODE_BY_NAME = {
    "Argentina": "ARG", "Australia": "AUS", "Belgium": "BEL", "Brazil": "BRA",
    "Cameroon": "CMR", "Canada": "CAN", "Costa Rica": "CRC", "Croatia": "CRO",
    "Denmark": "DEN", "Ecuador": "ECU", "England": "ENG", "France": "FRA",
    "Germany": "GER", "Ghana": "GHA", "Iran": "IRN", "Japan": "JPN",
    "Mexico": "MEX", "Morocco": "MAR", "Netherlands": "NED", "Poland": "POL",
    "Portugal": "POR", "Qatar": "QAT", "Saudi Arabia": "KSA", "Senegal": "SEN",
    "Serbia": "SRB", "South Korea": "KOR", "Spain": "ESP", "Switzerland": "SUI",
    "Tunisia": "TUN", "United States": "USA", "Uruguay": "URU", "Wales": "WAL",
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def to_int(value: str | None) -> int | None:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def overall_rating(global_rank: int) -> float:
    if not 1 <= global_rank <= MAX_RANK:
        raise ValueError(f"Overall rank outside 1..{MAX_RANK}: {global_rank}")
    left, right = next(
        (left, right)
        for left, right in zip(RATING_ANCHORS, RATING_ANCHORS[1:])
        if left[0] <= global_rank <= right[0]
    )
    progress = (global_rank - left[0]) / (right[0] - left[0])
    return round(left[1] + progress * (right[1] - left[1]), 2)


def percentile_merged_ranks(
    outfield_rows: list[dict[str, str]], goalkeeper_rows: list[dict]
) -> dict[str, int]:
    entries = [
        ((int(row["tournament_impact_rank_outfield_v4"]) - 0.5) / 553, 0, row["player_id"])
        for row in outfield_rows
    ]
    entries.extend(
        (
            (int(row["goalkeeper_consolidated_value_rank_v5"]) - 0.5) / 32,
            1,
            str(row["player_id"]),
        )
        for row in goalkeeper_rows
    )
    entries.sort()
    if len(entries) != MAX_RANK or len({entry[2] for entry in entries}) != MAX_RANK:
        raise ValueError("The percentile bridge must contain 553 outfield players and 32 goalkeepers")
    return {player_id: index + 1 for index, (_, _, player_id) in enumerate(entries)}


def build(analysis: Path) -> dict:
    ranking_dir = analysis / "results" / "reports" / "ranking"
    outfield = read_csv(ranking_dir / "global_rankings_outfield.csv")
    v4_rows = read_csv(
        analysis / "results" / "diagnostics" / "ranking_repair" / "outfield_v4_rank_intervals.csv"
    )
    rankings = json.loads((ranking_dir / "player_rankings.json").read_text(encoding="utf-8"))
    main_goalkeepers = [
        row
        for row in rankings
        if row.get("position_group") == "Goalkeeper" and row.get("is_main_goalkeeper")
    ]
    v4_by_id = {row["player_id"]: row for row in v4_rows}
    if len(v4_by_id) != 553 or len(outfield) != 553 or len(main_goalkeepers) != 32:
        raise ValueError("Expected 553 outfield-v4 players and 32 main goalkeepers")
    overall_rank_by_id = percentile_merged_ranks(v4_rows, main_goalkeepers)

    ordered = sorted(
        outfield,
        key=lambda row: int(v4_by_id[row["player_id"]]["tournament_impact_rank_outfield_v4"]),
    )
    team_ranks: dict[str, int] = {}
    position_ranks: dict[str, int] = {}
    derived_ranks: dict[str, tuple[int, int]] = {}
    for row in ordered:
        team = row["team"]
        position = row.get("position_group", "")
        team_ranks[team] = team_ranks.get(team, 0) + 1
        position_ranks[position] = position_ranks.get(position, 0) + 1
        derived_ranks[row["player_id"]] = (team_ranks[team], position_ranks[position])

    players_by_team: dict[str, list[dict]] = {}
    for row in ordered:
        team = row["team"]
        v4 = v4_by_id[row["player_id"]]
        team_rank, position_rank = derived_ranks[row["player_id"]]
        overall_rank = overall_rank_by_id[row["player_id"]]
        players_by_team.setdefault(team, []).append(
            {
                "id": row["player_id"],
                "name": row["player"],
                "position": row.get("position_group", ""),
                "role": row.get("functional_role", ""),
                "rating": overall_rating(overall_rank),
                "overall_rank": overall_rank,
                "team_rank": team_rank,
                "global_rank": int(v4["tournament_impact_rank_outfield_v4"]),
                "position_rank": position_rank,
                "minutes": to_int(row.get("minutes")),
            }
        )

    teams = []
    for name, code in sorted(TEAM_CODE_BY_NAME.items()):
        roster = sorted(players_by_team.get(name, []), key=lambda player: player["team_rank"])
        ratings = [player["rating"] for player in roster]
        teams.append(
            {
                "code": code,
                "name": name,
                "rated_count": len(roster),
                "avg_rating": round(sum(ratings) / len(ratings), 2) if ratings else None,
                "top_rating": max(ratings) if ratings else None,
                "players": roster,
            }
        )

    unmapped = sorted(set(players_by_team) - set(TEAM_CODE_BY_NAME))
    return {
        "generated_from": (
            "outfield_v4_rank_intervals.csv + goalkeeper consolidated value v5 "
            "(percentile-bridged FIFA-style Overall)"
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
    args.output.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(
        f"Wrote {args.output.relative_to(WEBSITE_ROOT)}: "
        f"{payload['team_count']} teams, {payload['rated_player_count']} outfield players."
    )


if __name__ == "__main__":
    main()
