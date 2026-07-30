/**
 * World's Coach — tactical plan generator.
 *
 * Given a knockout matchup and a match scenario, this produces a full game
 * plan in the exact data shapes the interactive board already consumes:
 * a 22-player roster, attack / press / transition step sequences, four
 * formation states, and scenario text (plan / rationale / confidence).
 *
 * What is grounded vs illustrative:
 *   - Bracket and per-team formations are real (2022 World Cup knockouts).
 *   - Player identities, ratings and ranks come from the project's rated-squad
 *     data (matchups.json), so lineups and confidence reflect real outputs.
 *   - The choreography (passing lanes, press triggers) is a principled,
 *     rule-based illustration, not a per-match researched sequence. The
 *     Argentina-vs-France final keeps its hand-authored choreography instead.
 *
 * Sequences are built so the board's compileSequence() validators pass by
 * construction: durations are positive, every step's ball path continues from
 * the previous step's final ball point, and all coordinates stay on the pitch.
 */
(function (root, factory) {
    "use strict";
    var api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    } else {
        root.WorldsCoachPlanner = api;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    var PITCH = { length: 105, width: 68 };

    function point(xMeters, yMeters) {
        return { xMeters: xMeters, yMeters: yMeters };
    }
    function clamp(value, low, high) {
        return Math.min(high, Math.max(low, value));
    }
    function onPitch(p) {
        return point(clamp(p.xMeters, 1, PITCH.length - 1), clamp(p.yMeters, 1, PITCH.width - 1));
    }
    function round1(v) {
        return Math.round(v * 10) / 10;
    }

    // Real 2022 World Cup knockout bracket. teamA is the tool's default
    // "your team"; either side can be chosen from the selector.
    var KNOCKOUTS = [
        { code: "R16-NED-USA", round: "Round of 16", teamA: "NED", teamB: "USA" },
        { code: "R16-ARG-AUS", round: "Round of 16", teamA: "ARG", teamB: "AUS" },
        { code: "R16-FRA-POL", round: "Round of 16", teamA: "FRA", teamB: "POL" },
        { code: "R16-ENG-SEN", round: "Round of 16", teamA: "ENG", teamB: "SEN" },
        { code: "R16-JPN-CRO", round: "Round of 16", teamA: "JPN", teamB: "CRO" },
        { code: "R16-BRA-KOR", round: "Round of 16", teamA: "BRA", teamB: "KOR" },
        { code: "R16-MAR-ESP", round: "Round of 16", teamA: "MAR", teamB: "ESP" },
        { code: "R16-POR-SUI", round: "Round of 16", teamA: "POR", teamB: "SUI" },
        { code: "QF-NED-ARG", round: "Quarter-final", teamA: "NED", teamB: "ARG" },
        { code: "QF-CRO-BRA", round: "Quarter-final", teamA: "CRO", teamB: "BRA" },
        { code: "QF-MAR-POR", round: "Quarter-final", teamA: "MAR", teamB: "POR" },
        { code: "QF-ENG-FRA", round: "Quarter-final", teamA: "ENG", teamB: "FRA" },
        { code: "SF-ARG-CRO", round: "Semi-final", teamA: "ARG", teamB: "CRO" },
        { code: "SF-FRA-MAR", round: "Semi-final", teamA: "FRA", teamB: "MAR" },
        { code: "F-ARG-FRA", round: "Final", teamA: "ARG", teamB: "FRA" }
    ];

    // Real knockout formations, expressed as line counts (defenders, midfield,
    // forwards). Falls back to 4-3-3 for any team not listed.
    var FORMATIONS = {
        ARG: [4, 4, 2], FRA: [4, 5, 1], NED: [3, 5, 2], CRO: [4, 3, 3],
        BRA: [4, 3, 3], MAR: [4, 5, 1], POR: [4, 3, 3], ENG: [4, 3, 3]
    };
    function formationFor(code) {
        return FORMATIONS[code] || [4, 3, 3];
    }
    function formationName(counts) {
        return counts.join("-");
    }

    // Conventional squad number for a slot (illustrative — the rated-squad data
    // does not carry shirt numbers).
    var SLOT_NUMBER = {
        GK: 1, RB: 2, RCB: 4, LCB: 5, CB: 6, LB: 3,
        DM: 6, RCM: 8, CM: 8, LCM: 15, RM: 7, LM: 11, AM: 10,
        RW: 7, LW: 11, ST: 9, RS: 9, LS: 19
    };

    function hash(text) {
        var h = 0, i;
        for (i = 0; i < text.length; i += 1) {
            h = (h * 31 + text.charCodeAt(i)) % 1000000007;
        }
        return h;
    }

    function classify(player) {
        var pos = (player.position || "") + " " + (player.role || "");
        pos = pos.toLowerCase();
        if (pos.indexOf("goalkeeper") !== -1 || pos.indexOf("keeper") !== -1) return "GK";
        // Check defence before "wing" so "wingback"/"fullback" stay defenders.
        if (pos.indexOf("back") !== -1 || pos.indexOf("defender") !== -1) return "DEF";
        if (pos.indexOf("forward") !== -1 || pos.indexOf("striker") !== -1 ||
            pos.indexOf("winger") !== -1 || pos.indexOf("wing") !== -1) return "FWD";
        if (pos.indexOf("midfield") !== -1) return "MID";
        return "MID";
    }

    // The rated-squad data stores full legal names, so a plain "last token"
    // mangles common names (Messi -> Cuccittini, Ronaldo -> Aveiro). Map the
    // recognisable players, and fall back to a cleaned, title-cased surname.
    var KNOWN_AS = {
        "Messi": "Messi", "Mbappé": "Mbappé", "Ronaldo": "Ronaldo",
        "Vinícius": "Vinícius Jr", "Richarlison": "Richarlison", "Neymar": "Neymar",
        "Depay": "Depay", "Bellingham": "Bellingham", "Di María": "Di María",
        "Cancelo": "Cancelo", "Boufal": "Boufal", "Ziyech": "Ziyech",
        "Hakimi": "Hakimi", "Perišić": "Perišić", "Kramarić": "Kramarić",
        "Modrić": "Modrić", "Griezmann": "Griezmann"
    };
    var CONNECTORS = { de: 1, da: 1, dos: 1, do: 1, van: 1, von: 1, el: 1, le: 1, "júnior": 1 };

    function titleCase(token) {
        if (!token) return token;
        return token.charAt(0).toUpperCase() + token.slice(1);
    }

    function shortName(fullName) {
        var full = String(fullName || "").trim();
        var known = Object.keys(KNOWN_AS);
        for (var i = 0; i < known.length; i += 1) {
            if (full.indexOf(known[i]) !== -1) return KNOWN_AS[known[i]];
        }
        var parts = full.split(/\s+/);
        var last = parts[parts.length - 1] || full;
        // Two-part surnames like "Attiyat Allah" — keep the preceding token.
        if (/^(allah|ullah)$/i.test(last) && parts.length >= 2) {
            return titleCase(parts[parts.length - 2]) + " " + titleCase(last);
        }
        // Compound surnames with a prefix (De Paul, Van Dijk, Mac Allister, El Yamiq).
        var prev = (parts[parts.length - 2] || "").toLowerCase();
        var PREFIX = { de: 1, van: 1, von: 1, mac: 1, mc: 1, el: 1, di: 1, da: 1, "den": 1, der: 1 };
        if (parts.length >= 2 && PREFIX[prev]) {
            return titleCase(parts[parts.length - 2]) + " " + titleCase(last);
        }
        return titleCase(last);
    }

    // Distribute n slot y-coordinates evenly across a width band.
    function spread(n, inset) {
        var pad = inset === undefined ? 8 : inset;
        var result = [];
        if (n <= 0) return result;
        if (n === 1) return [PITCH.width / 2];
        var step = (PITCH.width - 2 * pad) / (n - 1);
        for (var i = 0; i < n; i += 1) result.push(round1(pad + step * i));
        return result;
    }

    // Build slot ids + coordinates for one team's outfield + GK, attacking
    // toward +x. lineX is the back line's x; band gaps set midfield / front.
    function buildShape(prefix, counts, lineX, bandGap, frontGap) {
        var nDef = counts[0], nMid = counts[1], nFwd = counts[2];
        var slots = [];
        slots.push({ id: prefix + "gk", type: "GK", pos: point(9, 34) });
        var defY = spread(nDef, 9);
        defY.forEach(function (y, i) {
            slots.push({ id: prefix + "d" + i, type: "DEF", pos: point(lineX, y) });
        });
        var midY = spread(nMid, 12);
        midY.forEach(function (y, i) {
            slots.push({ id: prefix + "m" + i, type: "MID", pos: point(lineX + bandGap, y) });
        });
        var fwdY = spread(nFwd, nFwd >= 3 ? 7 : 20);
        fwdY.forEach(function (y, i) {
            slots.push({ id: prefix + "f" + i, type: "FWD", pos: point(lineX + bandGap + frontGap, y) });
        });
        return slots;
    }

    // Mirror an opponent shape to defend toward +x goal (their back line high x).
    function mirrorX(pos) {
        return point(round1(PITCH.length - pos.xMeters), pos.yMeters);
    }

    function assignPlayers(team, counts) {
        // Bucket rated players by line, best-rated first.
        var players = (team.players || []).slice().sort(function (a, b) {
            return (b.rating || 0) - (a.rating || 0);
        });
        var buckets = { GK: [], DEF: [], MID: [], FWD: [] };
        players.forEach(function (p) { buckets[classify(p)].push(p); });
        var need = { GK: 1, DEF: counts[0], MID: counts[1], FWD: counts[2] };
        // Spill extras so every slot can be filled even if the rated set is thin.
        var order = ["GK", "DEF", "MID", "FWD"];
        return { buckets: buckets, need: need, order: order };
    }

    function slotLabel(type, index, count) {
        if (type === "GK") return "GK";
        var side = "";
        if (count >= 2) {
            if (index === 0) side = "L";
            else if (index === count - 1) side = "R";
            else side = "C";
        }
        if (type === "DEF") return side + "B";
        if (type === "MID") return side + "M";
        return side + "F";
    }

    // Produce the roster entry for a slot, drawing from the team's rated pool.
    function fillRoster(roster, slots, teamCode, teamSideKey, pool, isOurs) {
        var typeCounts = {};
        slots.forEach(function (s) { typeCounts[s.type] = (typeCounts[s.type] || 0) + 1; });
        var typeIndex = {};
        var nextNumber = { taken: {} };
        function pickNumber(base) {
            var n = base;
            while (nextNumber.taken[teamCode + ":" + n]) n += 1;
            nextNumber.taken[teamCode + ":" + n] = true;
            return n;
        }
        slots.forEach(function (slot) {
            var idx = typeIndex[slot.type] || 0;
            typeIndex[slot.type] = idx + 1;
            var label = slotLabel(slot.type, idx, typeCounts[slot.type]);
            var player = pool.buckets[slot.type].shift();
            if (!player) {
                // Fall back to any remaining rated player, then a placeholder.
                var spill = pool.buckets.MID.shift() || pool.buckets.FWD.shift() ||
                    pool.buckets.DEF.shift();
                player = spill || null;
            }
            var baseNum = SLOT_NUMBER[label] || SLOT_NUMBER[slot.type] || 20;
            // Squad slot with no rated player (teams below the rating floor).
            var posWord = { GK: "Keeper", DEF: "Defender", MID: "Midfielder", FWD: "Forward" }[slot.type] || "Player";
            var posTag = { GK: "GK", DEF: "Def", MID: "Mid", FWD: "Fwd" }[slot.type] || "Sub";
            roster[slot.id] = {
                team: teamCode,
                side: teamSideKey,
                isOurs: isOurs,
                isPlaceholder: !player,
                playerId: player ? String(player.id) : null,
                number: pickNumber(baseNum),
                name: player ? player.name : "Unrated squad " + posWord.toLowerCase(),
                surname: player ? shortName(player.name) : posTag,
                displayName: player ? player.name : "Unrated squad " + posWord.toLowerCase(),
                wikiTitle: player ? player.name : "",
                rating: player ? player.rating : null,
                role: player ? (player.role || player.position || label) : "Squad " + posWord.toLowerCase() + " · below rating floor",
                slot: label,
                instruction: player
                    ? (isOurs ? "" : "Opponent " + label + ".")
                    : "Below the tournament rating floor, so this player was not individually rated."
            };
        });
    }

    function strengthOf(team) {
        var top = team.top_rating || 0;
        var avg = team.avg_rating || 0;
        return 0.6 * top + 0.4 * avg;
    }

    function topPlayerName(team) {
        var best = (team.players || []).slice().sort(function (a, b) {
            return (b.rating || 0) - (a.rating || 0);
        })[0];
        return best ? shortName(best.name) : team.name;
    }

    // The recommendation should name an attacking threat, not the best-rated
    // full-back — pick the top-rated forward / winger / creator, else fall back.
    function keyAttackerName(team) {
        var players = (team.players || []).slice().sort(function (a, b) {
            return (b.rating || 0) - (a.rating || 0);
        });
        var attacker = null;
        for (var i = 0; i < players.length; i += 1) {
            var s = ((players[i].role || "") + " " + (players[i].position || "")).toLowerCase();
            if (s.indexOf("forward") !== -1 || s.indexOf("striker") !== -1 ||
                s.indexOf("winger") !== -1 || s.indexOf("wing") !== -1 ||
                s.indexOf("attacking mid") !== -1 || s.indexOf("creat") !== -1 ||
                s.indexOf("playmak") !== -1 || s.indexOf("poacher") !== -1) {
                if (s.indexOf("back") === -1) { attacker = players[i]; break; }
            }
        }
        var pick = attacker || players[0];
        return pick ? shortName(pick.name) : team.name;
    }

    // Scenario knobs: how high we build, how many we commit, how aggressive the
    // press engagement line is, and a confidence delta.
    var SCENARIOS = {
        prematch: { lineShift: 0, commit: 5, pressLine: 59, conf: 0, tag: "Pre-match, 0–0" },
        leading: { lineShift: -7, commit: 4, pressLine: 52, conf: 5, tag: "Protecting a lead" },
        drawing: { lineShift: 2, commit: 5, pressLine: 59, conf: 0, tag: "Level game" },
        trailing: { lineShift: 6, commit: 6, pressLine: 66, conf: -6, tag: "Chasing the game" }
    };

    function confidenceFor(ourTeam, oppTeam, scenarioKey) {
        var diff = strengthOf(ourTeam) - strengthOf(oppTeam);
        var base = 66 + diff * 85;
        base += SCENARIOS[scenarioKey].conf;
        return Math.round(clamp(base, 47, 86));
    }

    function topPlayer(team) {
        return (team.players || []).slice().sort(function (a, b) {
            return (b.rating || 0) - (a.rating || 0);
        })[0] || null;
    }

    // Map the team's best player to the attacking mechanism the plan leans on,
    // so different star profiles produce genuinely different recommendations.
    function attackArchetype(player) {
        var s = (((player && player.role) || "") + " " + ((player && player.position) || "")).toLowerCase();
        if (s.indexOf("target") !== -1 || s.indexOf("poacher") !== -1 || s.indexOf("finisher") !== -1) return "box";
        if (s.indexOf("playmak") !== -1 || s.indexOf("creat") !== -1 || s.indexOf("attacking mid") !== -1) return "between";
        if (s.indexOf("winger") !== -1 || s.indexOf("wing") !== -1 || s.indexOf("wide") !== -1) return "isolate";
        if (s.indexOf("box-to-box") !== -1 || s.indexOf("engine") !== -1 || s.indexOf("ball-winner") !== -1 ||
            s.indexOf("deep-lying") !== -1 || s.indexOf("defensive mid") !== -1) return "transition";
        if (s.indexOf("sweeper") !== -1 || s.indexOf("keeper") !== -1 ||
            (s.indexOf("back") !== -1 && s.indexOf("wing") === -1)) return "buildup";
        return "isolate";
    }

    // Recommendation copy keyed off the SAME attack style that drives the
    // board, so the words on the card always match what the players do.
    function planText(ourTeam, oppTeam, flank, scenarioKey, style) {
        var star = keyAttackerName(ourTeam);
        var opp = oppTeam.name;
        var wide = flank === "right" ? "right" : "left";

        var approaches = {
            wing: {
                plan: "Stretch " + opp + " wide, then isolate " + star,
                why: "Switch the play to pull " + opp + "'s block across, then feed " + star + " one-v-one on the " + wide + " to beat his marker and get to the byline for the cutback."
            },
            central: {
                plan: "Play through the lines to " + star,
                why: "Circulate to draw " + opp + "'s midfield up, find " + star + " in the pocket between the lines, then a third-man run splits the centre-backs."
            },
            direct: {
                plan: "Get it wide early and load the box",
                why: "No slow build — get width quickly and whip early crosses in so " + opp + "'s centre-backs defend on the turn, with runners crashing the box around " + star + "."
            },
            counter: {
                plan: "Sit compact and hit " + opp + " on the break",
                why: "Concede the ball and stay narrow, then break vertically at speed through " + star + " into the space " + opp + " leaves in behind."
            },
            wingback: {
                plan: "Wing-backs high, overload the " + wide,
                why: "Push both wing-backs on, overload the " + wide + " three-v-two around " + star + ", and get to the byline to cross for the front runners."
            },
            buildup: {
                plan: "Play out, switch, and spring " + star,
                why: "Play out from the back to bait " + opp + "'s press, beat the first line, then switch the play and spring " + star + " in behind on the far side."
            }
        };
        var base = approaches[style] || approaches.wing;

        // Score-and-time scenario overrides / modifiers.
        if (scenarioKey === "leading") {
            return {
                plan: "Manage the lead, punish on the break",
                why: "Protect the result: sit a fraction deeper and stay compact against " + opp + ", then hurt them in transition through " + star + " as they commit forward."
            };
        }
        if (scenarioKey === "trailing") {
            return {
                plan: "Throw numbers forward to chase it",
                why: "Push the full-backs on, overload the " + wide + ", and gamble bodies around " + star + " — accept the transition risk against " + opp + " to force the game."
            };
        }
        if (scenarioKey === "drawing") {
            return {
                plan: base.plan + " — and take the risk",
                why: base.why + " With the game level, commit an extra runner and release a beat earlier."
            };
        }
        return base;
    }

    // ---- sequence builders (ball threaded for validator continuity) --------

    // --- shared helpers for rich, tailored choreography -------------------
    function P(x, y) { return onPitch(point(x, y)); }
    function laneAssign(map, ids, x, inset) {
        var ys = spread(ids.length, inset);
        ids.forEach(function (id, i) { map[id] = point(x, ys[i]); });
    }
    function byType(slots) {
        var t = { GK: [], DEF: [], MID: [], FWD: [] };
        slots.forEach(function (s) { t[s.type].push(s.id); });
        return t;
    }
    // Lane order is low-y -> high-y; the strong flank is the high-y side when
    // attacking right. "strong"/"weak"/"mid" pick a player relative to that.
    function sidePick(ids, right, which) {
        if (!ids || !ids.length) return null;
        if (which === "mid") return ids[Math.floor(ids.length / 2)];
        if (which === "strong") return right ? ids[ids.length - 1] : ids[0];
        return right ? ids[0] : ids[ids.length - 1];
    }
    // Build a moves object from (id, x, y) triples, skipping missing ids and
    // clamping every target on-pitch.
    function moves() {
        var m = {};
        for (var i = 0; i + 2 < arguments.length + 1; i += 3) {
            var id = arguments[i];
            if (id) m[id] = P(arguments[i + 1], arguments[i + 2]);
        }
        return m;
    }
    function roleMap(ourSlots, flank) {
        var right = flank === "right";
        var u = byType(ourSlots);
        var attackers = u.FWD.length >= 2 ? u.FWD.slice() : u.FWD.concat(u.MID.slice(-2));
        var striker = sidePick(u.FWD.length ? u.FWD : attackers, right, "mid");
        var wide = sidePick(attackers, right, "strong");
        var farFwd = sidePick(attackers, right, "weak");
        return {
            u: u,
            gk: u.GK[0],
            sFB: sidePick(u.DEF, right, "strong"),
            wFB: sidePick(u.DEF, right, "weak"),
            cbMid: sidePick(u.DEF, right, "mid"),
            pivot: sidePick(u.MID, right, "mid"),
            sMid: sidePick(u.MID, right, "strong"),
            wMid: sidePick(u.MID, right, "weak"),
            wide: wide,
            striker: striker,
            farFwd: farFwd === wide ? sidePick(attackers, right, "mid") : farFwd
        };
    }
    function oppRoles(oppSlots, flank) {
        var right = flank === "right";
        var o = byType(oppSlots);
        return {
            o: o,
            gk: o.GK[0],
            fbS: sidePick(o.DEF, right, "strong"),
            cb: sidePick(o.DEF, right, "mid"),
            cbW: sidePick(o.DEF, right, "weak"),
            midS: sidePick(o.MID, right, "strong"),
            midW: sidePick(o.MID, right, "weak"),
            fwdS: sidePick(o.FWD, right, "strong"),
            fwdW: sidePick(o.FWD, right, "weak")
        };
    }

    // =====================================================================
    // Style-driven choreography. Each team plays a distinct game plan on the
    // board: profileFor() picks the attack pattern (tied to the recommendation
    // archetype), the press scheme and the transition, plus flank and shape.
    // Curated profiles give the 2022 knockout sides their real identities.
    // =====================================================================

    function flankVars(flank) {
        var right = flank === "right";
        return {
            right: right,
            fY: right ? 58 : 10, hY: right ? 44 : 24, wY: right ? 12 : 56, whY: right ? 24 : 44,
            byY: right ? 63 : 5, nearY: right ? 40 : 28, backY: right ? 27 : 41
        };
    }

    function layTeam(map, r, defX, midX, fwdX, gkX) {
        map[r.gk] = point(gkX == null ? 9 : gkX, 34);
        laneAssign(map, r.u.DEF, defX, 9);
        laneAssign(map, r.u.MID, midX, 13);
        laneAssign(map, r.u.FWD.length ? r.u.FWD : [r.striker], fwdX, r.u.FWD.length >= 3 ? 7 : 20);
    }
    function layOpp(map, q, defX, midX, fwdX, gkX) {
        map[q.gk] = point(gkX, 34);
        laneAssign(map, q.o.DEF, defX, 8);
        laneAssign(map, q.o.MID, midX, 12);
        laneAssign(map, q.o.FWD, fwdX, q.o.FWD.length >= 3 ? 7 : 20);
    }

    // Advance any midfielder/forward not driven by a named role so nobody is
    // left frozen, whatever the formation.
    function guardNoFrozen(steps, r, fromStep) {
        var named = {};
        [r.pivot, r.sMid, r.wMid, r.wide, r.striker, r.farFwd, r.cbMid].forEach(function (id) { if (id) named[id] = 1; });
        var extraM = r.u.MID.filter(function (id) { return !named[id]; });
        var extraF = r.u.FWD.filter(function (id) { return !named[id]; });
        steps.forEach(function (st, i) {
            if (i < (fromStep == null ? 2 : fromStep)) return;
            var mx = 56 + (i - 1) * 4, fx = 76 + (i - 1) * 3;
            var my = spread(extraM.length, 16), fy = spread(extraF.length, 16);
            extraM.forEach(function (id, k) { if (!st.moves[id]) st.moves[id] = P(mx, my[k]); });
            extraF.forEach(function (id, k) { if (!st.moves[id]) st.moves[id] = P(fx, fy[k]); });
        });
    }

    // --------------------------------------------------------------- ATTACK
    var ATTACK = {};

    // WING — isolate the winger 1v1, overlap to the byline, low cutback.
    ATTACK.wing = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        layTeam(initial, r, 41 + scenario.lineShift, 59 + scenario.lineShift, 75 + scenario.lineShift);
        layOpp(initial, q, 90, 76, 62, 99);
        var steps = [
            {
                id: "wing-build", label: "1 - Build", phase: "IN POSSESSION",
                title: "Build and switch to the " + (v.right ? "right" : "left"), duration: 1500,
                caption: "Circulate to shift " + q.o.DEF.length + " defenders across, then load the ball-side to isolate the winger.",
                ballPath: [point(9, 34)],
                moves: moves(r.pivot, 46, 34, r.sMid, 54, v.hY, r.wide, 72, v.fY, r.sFB, 52, v.fY, r.wFB, 40, v.wY,
                    q.fwdS, 58, v.hY),
                active: [r.gk, r.cbMid, r.pivot, r.wide],
                zones: [{ type: "rect", x: 16, y: 8, width: 30, height: 52, tone: "neutral", label: "BUILD-UP" }]
            },
            {
                id: "wing-feed", label: "2 - Isolate", phase: "1v1",
                title: "Feed the winger one-v-one", duration: 2000,
                caption: "Hit the winger to the touchline with only the full-back to beat; the striker pins the centre-backs.",
                ballPath: [point(9, 34), point(40, v.hY), point(72, v.fY)],
                moves: moves(r.wide, 72, v.fY, r.striker, 80, 34, r.sFB, 66, v.fY, r.sMid, 58, v.hY, r.farFwd, 74, v.wY,
                    q.fbS, 76, v.fY, q.cb, 82, 30),
                active: [r.pivot, r.wide, r.striker],
                actions: [
                    { type: "pass", label: "SWITCH", path: [point(9, 34), point(40, v.hY)] },
                    { type: "pass", label: "FEET", path: [point(40, v.hY), point(72, v.fY)] }
                ],
                zones: [{ type: "rect", x: 62, y: v.right ? 44 : 2, width: 26, height: 22, tone: "neutral", label: "1v1 ZONE" }]
            },
            {
                id: "wing-beat", label: "3 - Beat the man", phase: "FINAL THIRD",
                title: "Beat the full-back to the byline", duration: 1900,
                caption: "The winger drives the outside as the full-back overlaps to stretch the back line.",
                ballPath: [point(72, v.fY), point(90, v.byY)],
                moves: moves(r.wide, 90, v.byY, r.sFB, 84, v.fY, r.striker, 90, v.nearY, r.farFwd, 93, v.backY, r.sMid, 80, 34,
                    q.cb, 92, 30, q.cbW, 92, 38, q.fbS, 88, v.fY),
                active: [r.wide, r.sFB, r.striker, r.farFwd],
                actions: [
                    { type: "carry", label: "DRIVE", path: [point(72, v.fY), point(83, v.fY), point(90, v.byY)] },
                    { type: "run", label: "OVERLAP", path: [point(66, v.fY), point(84, v.fY)] },
                    { type: "run", label: "NEAR POST", path: [point(80, 34), point(90, v.nearY)] }
                ]
            },
            {
                id: "wing-cutback", label: "4 - Cutback", phase: "FINISH",
                title: "Low cutback to the arriving runners", duration: 1800,
                caption: "Pull it back from the byline to the striker at the spot and the midfielder on the edge.",
                ballPath: [point(90, v.byY), point(92, 34)],
                moves: moves(r.striker, 92, 34, r.sMid, 84, 30, r.farFwd, 94, v.backY, r.pivot, 60, 32,
                    q.cb, 94, 31, q.cbW, 94, 37),
                active: [r.wide, r.striker, r.sMid, r.farFwd],
                actions: [
                    { type: "pass", label: "CUTBACK", path: [point(90, v.byY), point(92, 34)] },
                    { type: "run", label: "ARRIVE", path: [point(72, 32), point(84, 30)] }
                ],
                zones: [{ type: "circle", cx: 92, cy: 34, radius: 8, tone: "press", label: "CUTBACK" }]
            }
        ];
        guardNoFrozen(steps, r);
        return { initial: initial, ball: point(9, 34), steps: steps };
    };

    // CENTRAL — circulate, find the pocket, third-man run, split the CBs.
    ATTACK.central = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        layTeam(initial, r, 40 + scenario.lineShift, 58 + scenario.lineShift, 74 + scenario.lineShift);
        layOpp(initial, q, 88, 74, 60, 99);
        var steps = [
            {
                id: "cen-circulate", label: "1 - Circulate", phase: "POSSESSION",
                title: "Rondo to draw the block in", duration: 1700,
                caption: "Quick one-touch circulation between the centre-backs and the pivot to bait the press and open the pockets.",
                ballPath: [point(9, 34), point(30, 22), point(30, 46), point(44, 34)],
                moves: moves(r.pivot, 44, 34, r.sMid, 54, v.hY, r.wMid, 54, v.whY, r.striker, 74, 34,
                    q.fwdS, 60, 30, q.fwdW, 60, 38),
                active: [r.cbMid, r.pivot, r.sMid, r.wMid],
                actions: [{ type: "pass", label: "RONDO", path: [point(30, 22), point(30, 46), point(44, 34)] }],
                zones: [{ type: "circle", cx: 40, cy: 34, radius: 12, tone: "neutral", label: "RONDO" }]
            },
            {
                id: "cen-pocket", label: "2 - Find the pocket", phase: "PROGRESSION",
                title: "Play into the creator between the lines", duration: 2000,
                caption: "Break the midfield line into the free man in the pocket, back to goal, ready to turn.",
                ballPath: [point(44, 34), point(58, v.hY)],
                moves: moves(r.sMid, 58, v.hY, r.wMid, 60, v.whY, r.striker, 76, 34, r.pivot, 50, 34,
                    q.midS, 62, v.hY, q.cb, 78, 32),
                active: [r.pivot, r.sMid, r.striker],
                actions: [{ type: "pass", label: "LINE BREAK", path: [point(44, 34), point(58, v.hY)] }],
                zones: [{ type: "rect", x: 52, y: 22, width: 22, height: 24, tone: "neutral", label: "THE POCKET" }]
            },
            {
                id: "cen-third", label: "3 - Third-man run", phase: "CREATION",
                title: "Lay it off, third man bursts through", duration: 1900,
                caption: "The creator sets it back first-time and a midfielder runs beyond, straight through the middle.",
                ballPath: [point(58, v.hY), point(52, 34), point(70, 34)],
                moves: moves(r.wMid, 70, 34, r.sMid, 60, v.hY, r.striker, 82, 30, r.farFwd, 78, v.whY,
                    q.midS, 64, 34, q.cb, 80, 32, q.cbW, 80, 36),
                active: [r.sMid, r.wMid, r.striker],
                actions: [
                    { type: "pass", label: "SET", path: [point(58, v.hY), point(52, 34)] },
                    { type: "run", label: "THIRD MAN", path: [point(56, v.whY), point(70, 34)] },
                    { type: "pass", label: "RELEASE", path: [point(52, 34), point(70, 34)] }
                ]
            },
            {
                id: "cen-split", label: "4 - Split the CBs", phase: "FINISH",
                title: "Through-ball splits the centre-backs", duration: 1800,
                caption: "A disguised through-ball between the centre-backs releases the striker for a first-time finish.",
                ballPath: [point(70, 34), point(90, 34)],
                moves: moves(r.striker, 90, 34, r.wMid, 78, 30, r.farFwd, 86, v.whY, r.sMid, 74, v.hY,
                    q.cb, 92, 30, q.cbW, 92, 38),
                active: [r.wMid, r.striker, r.farFwd],
                actions: [
                    { type: "pass", label: "SPLIT", path: [point(70, 34), point(90, 34)] },
                    { type: "run", label: "IN BEHIND", path: [point(80, 32), point(90, 34)] }
                ],
                zones: [{ type: "rect", x: 82, y: 26, width: 16, height: 16, tone: "press", label: "IN BEHIND" }]
            }
        ];
        guardNoFrozen(steps, r);
        return { initial: initial, ball: point(9, 34), steps: steps };
    };

    // DIRECT — two strikers, early wide delivery, crash the box, second balls.
    ATTACK.direct = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        layTeam(initial, r, 42 + scenario.lineShift, 60 + scenario.lineShift, 78 + scenario.lineShift);
        layOpp(initial, q, 90, 76, 62, 99);
        var target = r.striker, second = r.farFwd || r.wide;
        var steps = [
            {
                id: "dir-wide", label: "1 - Get it wide early", phase: "IN POSSESSION",
                title: "Move it to the flank quickly", duration: 1500,
                caption: "No slow build — get the ball wide to the delivery zone with both strikers already high.",
                ballPath: [point(9, 34), point(30, v.fY), point(58, v.fY)],
                moves: moves(r.sMid, 58, v.fY, r.sFB, 64, v.fY, target, 78, v.nearY, second, 78, v.backY, r.wide, 60, v.hY,
                    q.fbS, 72, v.fY),
                active: [r.sFB, r.sMid, target, second],
                actions: [{ type: "pass", label: "SWITCH WIDE", path: [point(9, 34), point(30, v.fY), point(58, v.fY)] }],
                zones: [{ type: "rect", x: 52, y: v.right ? 46 : 2, width: 26, height: 20, tone: "neutral", label: "DELIVERY ZONE" }]
            },
            {
                id: "dir-cross", label: "2 - Early cross", phase: "DELIVERY",
                title: "Whip the early cross in", duration: 1900,
                caption: "First-time delivery from deep so the centre-backs have to defend facing their own goal.",
                ballPath: [point(58, v.fY), point(88, v.nearY)],
                moves: moves(target, 90, v.nearY, second, 92, v.backY, r.wide, 84, 34, r.sMid, 76, v.hY,
                    q.cb, 91, 30, q.cbW, 91, 38, q.fbS, 82, v.fY),
                active: [r.sFB, target, second, r.wide],
                actions: [
                    { type: "pass", label: "EARLY CROSS", path: [point(58, v.fY), point(88, v.nearY)] },
                    { type: "run", label: "NEAR POST", path: [point(78, v.nearY), point(90, v.nearY)] },
                    { type: "run", label: "BACK POST", path: [point(78, v.backY), point(92, v.backY)] }
                ]
            },
            {
                id: "dir-box", label: "3 - Attack the box", phase: "AERIAL DUEL",
                title: "Target man attacks the cross", duration: 1800,
                caption: "The target man wins the header; the second striker gambles on the flick and knock-downs.",
                ballPath: [point(88, v.nearY), point(94, 34)],
                moves: moves(target, 92, v.nearY, second, 94, 33, r.wide, 86, 30, r.sMid, 82, 34,
                    q.cb, 93, 32, q.cbW, 93, 36),
                active: [target, second, r.wide],
                actions: [
                    { type: "run", label: "FLICK", path: [point(90, v.nearY), point(94, 34)] }
                ],
                zones: [{ type: "circle", cx: 93, cy: 34, radius: 7, tone: "press", label: "SIX-YARD BOX" }]
            },
            {
                id: "dir-second", label: "4 - Second ball", phase: "SECOND BALL",
                title: "Midfield arrives for the second ball", duration: 1700,
                caption: "The knock-down drops to the edge of the box, where the midfield runners arrive first.",
                ballPath: [point(94, 34), point(84, 34)],
                moves: moves(r.sMid, 84, 34, r.wide, 84, v.hY, r.pivot, 70, 34, target, 90, v.nearY,
                    q.midS, 82, 34),
                active: [r.sMid, r.wide, target],
                actions: [{ type: "run", label: "ARRIVE", path: [point(72, 34), point(84, 34)] }],
                zones: [{ type: "rect", x: 78, y: 26, width: 14, height: 16, tone: "neutral", label: "SECOND BALL" }]
            }
        ];
        guardNoFrozen(steps, r);
        return { initial: initial, ball: point(9, 34), steps: steps };
    };

    // COUNTER — win deep, break fast and vertical, few runners, quick finish.
    ATTACK.counter = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        // Deeper block; the opponent has committed forward, we win it in our half.
        layTeam(initial, r, 26, 40, 56);
        layOpp(initial, q, 70, 52, 34, 96);
        var steps = [
            {
                id: "cnt-win", label: "1 - Win it deep", phase: "REGAIN",
                title: "Win it in our own half", duration: 1500,
                caption: "Regain in a compact block with the opponent committed forward — the space is in behind them.",
                ballPath: [point(30, 34)],
                moves: moves(r.striker, 52, 34, r.wide, 48, v.fY, r.sMid, 40, v.hY,
                    q.fwdS, 30, 30, q.midS, 44, 34),
                active: [r.cbMid, r.pivot, r.striker],
                zones: [{ type: "rect", x: 6, y: 8, width: 26, height: 52, tone: "protect", label: "COMPACT BLOCK" }]
            },
            {
                id: "cnt-outlet", label: "2 - Vertical outlet", phase: "TRANSITION",
                title: "Break vertically at once", duration: 1800,
                caption: "First pass goes forward, not sideways — hit the striker on the move and sprint past the ball.",
                ballPath: [point(30, 34), point(58, 34)],
                moves: moves(r.striker, 58, 34, r.wide, 62, v.fY, r.sMid, 54, v.hY, r.farFwd, 58, v.whY,
                    q.cb, 60, 34),
                active: [r.striker, r.wide, r.sMid],
                actions: [
                    { type: "pass", label: "OUTLET", path: [point(30, 34), point(58, 34)] },
                    { type: "run", label: "SPRINT", path: [point(48, v.fY), point(62, v.fY)] }
                ],
                zones: [{ type: "rect", x: 40, y: 8, width: 34, height: 52, tone: "neutral", label: "SPACE IN BEHIND" }]
            },
            {
                id: "cnt-carry", label: "3 - Carry & commit", phase: "3v2",
                title: "Carry into the three-v-two", duration: 1800,
                caption: "Drive at the last line before it resets; the wide runner stretches it and the striker holds the middle.",
                ballPath: [point(58, 34), point(74, v.fY), point(84, v.fY)],
                moves: moves(r.wide, 74, v.fY, r.striker, 80, 34, r.farFwd, 78, v.whY, r.sMid, 68, v.hY,
                    q.cb, 82, 32, q.cbW, 82, 36),
                active: [r.wide, r.striker, r.farFwd],
                actions: [
                    { type: "pass", label: "RELEASE", path: [point(58, 34), point(74, v.fY)] },
                    { type: "carry", label: "DRIVE", path: [point(74, v.fY), point(84, v.fY)] }
                ],
                zones: [{ type: "rect", x: 62, y: v.right ? 40 : 6, width: 30, height: 24, tone: "neutral", label: "3v2 BREAK" }]
            },
            {
                id: "cnt-finish", label: "4 - Finish fast", phase: "FINISH",
                title: "Cut it back before they recover", duration: 1700,
                caption: "Reach the byline and pull it back to the striker arriving centrally before the defence sets.",
                ballPath: [point(84, v.fY), point(88, v.byY), point(90, 34)],
                moves: moves(r.striker, 90, 34, r.farFwd, 92, v.backY, r.sMid, 82, v.hY, r.wide, 88, v.byY,
                    q.cb, 91, 31, q.cbW, 91, 37),
                active: [r.wide, r.striker, r.farFwd],
                actions: [{ type: "pass", label: "CUTBACK", path: [point(88, v.byY), point(90, 34)] }],
                zones: [{ type: "circle", cx: 90, cy: 34, radius: 7, tone: "press", label: "FINISH" }]
            }
        ];
        guardNoFrozen(steps, r, 3);
        return { initial: initial, ball: point(30, 34), steps: steps };
    };

    // WINGBACK — 3 at the back, both wing-backs high, overload the strong flank.
    ATTACK.wingback = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        layTeam(initial, r, 40 + scenario.lineShift, 58 + scenario.lineShift, 76 + scenario.lineShift);
        layOpp(initial, q, 90, 76, 62, 99);
        // Wide midfielders act as the wing-backs.
        var sWB = r.sMid, wWB = r.wMid;
        var steps = [
            {
                id: "wb-push", label: "1 - Wing-backs on", phase: "IN POSSESSION",
                title: "Push both wing-backs high", duration: 1600,
                caption: "The back three holds while both wing-backs sprint to the touchlines to stretch the pitch fully wide.",
                ballPath: [point(9, 34)],
                moves: moves(sWB, 66, v.fY, wWB, 62, v.wY, r.pivot, 46, 34, r.wide, 74, v.hY, r.striker, 76, 30, r.farFwd, 76, 38,
                    q.fbS, 78, v.fY),
                active: [r.gk, sWB, wWB, r.pivot],
                zones: [{ type: "band", x: 44, y: 4, width: 8, height: 60, tone: "neutral", label: "BACK THREE" }]
            },
            {
                id: "wb-overload", label: "2 - Overload the flank", phase: "OVERLOAD",
                title: "Three-v-two on the " + (v.right ? "right" : "left"), duration: 2000,
                caption: "The ball-side wing-back, winger and central midfielder combine to make it three against two out wide.",
                ballPath: [point(9, 34), point(44, v.hY), point(66, v.fY)],
                moves: moves(sWB, 66, v.fY, r.wide, 72, v.hY, r.pivot, 58, v.hY, r.striker, 80, v.nearY, r.farFwd, 80, v.backY,
                    q.fbS, 74, v.fY, q.midS, 66, v.hY),
                active: [sWB, r.wide, r.pivot],
                actions: [
                    { type: "pass", label: "TO THE WB", path: [point(9, 34), point(44, v.hY), point(66, v.fY)] }
                ],
                zones: [{ type: "rect", x: 58, y: v.right ? 42 : 4, width: 28, height: 24, tone: "neutral", label: "3v2 OVERLOAD" }]
            },
            {
                id: "wb-byline", label: "3 - Combine to the byline", phase: "FINAL THIRD",
                title: "One-two to the byline", duration: 1800,
                caption: "A quick give-and-go between the wing-back and winger releases the wing-back to the byline.",
                ballPath: [point(66, v.fY), point(72, v.hY), point(90, v.byY)],
                moves: moves(sWB, 90, v.byY, r.wide, 78, v.hY, r.striker, 90, v.nearY, r.farFwd, 92, v.backY, r.pivot, 66, 34,
                    q.cb, 92, 30, q.cbW, 92, 38),
                active: [sWB, r.wide, r.striker, r.farFwd],
                actions: [
                    { type: "pass", label: "ONE", path: [point(66, v.fY), point(72, v.hY)] },
                    { type: "pass", label: "TWO", path: [point(72, v.hY), point(90, v.byY)] }
                ]
            },
            {
                id: "wb-cross", label: "4 - Cross for the front", phase: "FINISH",
                title: "Cross for the two strikers", duration: 1800,
                caption: "The wing-back crosses for the two central runners and the far wing-back arriving at the back post.",
                ballPath: [point(90, v.byY), point(92, v.nearY)],
                moves: moves(r.striker, 92, v.nearY, r.farFwd, 93, 34, wWB, 88, v.backY, r.wide, 84, 34,
                    q.cb, 93, 31, q.cbW, 93, 37),
                active: [sWB, r.striker, r.farFwd, wWB],
                actions: [
                    { type: "pass", label: "CROSS", path: [point(90, v.byY), point(92, v.nearY)] },
                    { type: "run", label: "BACK-POST WB", path: [point(70, v.wY), point(88, v.backY)] }
                ],
                zones: [{ type: "rect", x: 86, y: 24, width: 14, height: 20, tone: "press", label: "CROSS ZONE" }]
            }
        ];
        guardNoFrozen(steps, r);
        return { initial: initial, ball: point(9, 34), steps: steps };
    };

    // BUILDUP — play out from the keeper, beat the press, big switch, spring.
    ATTACK.buildup = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        layTeam(initial, r, 38 + scenario.lineShift, 56 + scenario.lineShift, 74 + scenario.lineShift);
        layOpp(initial, q, 88, 72, 56, 99);
        var farHalf = v.right ? 24 : 44; // switch lands on the weak side
        var steps = [
            {
                id: "bld-invite", label: "1 - Invite the press", phase: "PLAY OUT",
                title: "Split the centre-backs and bait the press", duration: 1700,
                caption: "The keeper splits the centre-backs and the pivot drops in, deliberately inviting the opponent's forwards to jump.",
                ballPath: [point(9, 34), point(20, 22)],
                moves: moves(r.pivot, 30, 34, r.cbMid, 22, 46, r.sFB, 40, v.fY, r.wFB, 40, v.wY,
                    q.fwdS, 26, 30, q.fwdW, 26, 40),
                active: [r.gk, r.cbMid, r.pivot],
                actions: [{ type: "pass", label: "SPLIT", path: [point(9, 34), point(20, 22)] }],
                zones: [{ type: "rect", x: 6, y: 8, width: 30, height: 52, tone: "neutral", label: "PLAY-OUT" }]
            },
            {
                id: "bld-break", label: "2 - Beat the first line", phase: "PROGRESSION",
                title: "Break the first line to the free man", duration: 2000,
                caption: "With the forwards drawn in, the pivot is free between the lines — carry through and beat the press.",
                ballPath: [point(20, 22), point(34, 34), point(40, 34)],
                moves: moves(r.pivot, 40, 34, r.sMid, 52, v.hY, r.wMid, 50, farHalf, r.cbMid, 30, 40,
                    q.fwdS, 36, 32, q.midS, 52, 34),
                active: [r.pivot, r.sMid, r.wMid],
                actions: [
                    { type: "pass", label: "TO THE PIVOT", path: [point(20, 22), point(34, 34)] },
                    { type: "carry", label: "CARRY", path: [point(34, 34), point(40, 34)] }
                ],
                zones: [{ type: "rect", x: 24, y: 22, width: 24, height: 24, tone: "neutral", label: "FREE MAN" }]
            },
            {
                id: "bld-switch", label: "3 - Switch the play", phase: "SWITCH",
                title: "Big switch to the far side", duration: 2000,
                caption: "Once the block shifts ball-side, switch it right across to the isolated far-side runner in acres of space.",
                ballPath: [point(40, 34), point(60, farHalf)],
                moves: moves(r.wMid, 66, v.wY, r.wide, 70, v.wY, r.striker, 80, 34, r.sMid, 58, v.hY, r.wFB, 60, v.wY,
                    q.fbS, 70, v.fY, q.cb, 78, 34),
                active: [r.wMid, r.wide, r.striker],
                actions: [{ type: "pass", label: "SWITCH", path: [point(40, 34), point(50, 34), point(60, farHalf)] }],
                zones: [{ type: "rect", x: 54, y: v.right ? 4 : 42, width: 30, height: 22, tone: "neutral", label: "FREE FAR SIDE" }]
            },
            {
                id: "bld-spring", label: "4 - Spring in behind", phase: "FINISH",
                title: "Diagonal in behind the far side", duration: 1800,
                caption: "First-time diagonal in behind the full-back releases the far runner to attack the box.",
                ballPath: [point(60, farHalf), point(88, v.wY)],
                moves: moves(r.wide, 88, v.wY, r.striker, 90, v.backY, r.farFwd, 90, 34, r.wMid, 78, farHalf,
                    q.cb, 90, 36, q.cbW, 90, 30),
                active: [r.wide, r.striker, r.farFwd],
                actions: [
                    { type: "pass", label: "IN BEHIND", path: [point(60, farHalf), point(88, v.wY)] },
                    { type: "run", label: "ATTACK BOX", path: [point(80, 34), point(90, v.backY)] }
                ],
                zones: [{ type: "rect", x: 82, y: v.right ? 2 : 44, width: 18, height: 20, tone: "press", label: "IN BEHIND" }]
            }
        ];
        guardNoFrozen(steps, r);
        return { initial: initial, ball: point(9, 34), steps: steps };
    };

    // --------------------------------------------------------------- PRESS
    var PRESS = {};

    // HIGH — jump the centre-backs, trap wide, win in the final third.
    PRESS.high = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        layTeam(initial, r, 52, 66, 78, 14);
        layOpp(initial, q, 90, 76, 60, 98);
        var steps = [
            {
                id: "hp-set", label: "1 - Set the trap", phase: "HIGH PRESS",
                title: "Front line on the centre-backs", duration: 1500,
                caption: "The forwards step right up onto the centre-backs and screen the pivot, shading the ball wide.",
                ballPath: [point(88, v.hY)],
                moves: moves(r.striker, 82, 34, r.wide, 80, v.hY, r.farFwd, 80, v.whY, r.sMid, 70, v.hY,
                    q.midS, 74, 34),
                active: [r.striker, r.wide, r.farFwd],
                zones: [{ type: "band", x: 78, y: 6, width: 8, height: 56, tone: "neutral", label: "FRONT LINE HIGH" }]
            },
            {
                id: "hp-trigger", label: "2 - Trigger", phase: "TRIGGER",
                title: "Spring on the pass to the full-back", duration: 1800,
                caption: "The moment the ball goes wide to the full-back, the winger and midfielder jump to lock him in.",
                ballPath: [point(88, v.hY), point(90, v.fY)],
                moves: moves(r.wide, 86, v.fY, r.sMid, 76, v.hY, r.striker, 84, 34, r.sFB, 74, v.fY,
                    q.fbS, 90, v.fY),
                active: [r.wide, r.sMid, r.sFB],
                pressing: [r.wide, r.sMid],
                actions: [{ type: "pass", label: "FORCED WIDE", path: [point(88, v.hY), point(90, v.fY)] }],
                trigger: { cx: 90, cy: v.fY, radius: 7, label: "TRIGGER" }
            },
            {
                id: "hp-lock", label: "3 - Lock the touchline", phase: "TRAP",
                title: "Trap him on the line", duration: 2000,
                caption: "Winger, full-back and midfielder surround the ball with the touchline as an extra defender.",
                ballPath: [point(90, v.fY), point(90, v.fY)],
                moves: moves(r.wide, 89, v.fY, r.sFB, 86, v.fY, r.sMid, 82, v.hY, r.striker, 88, 34,
                    q.fbS, 92, v.fY, q.midS, 84, v.hY),
                active: [r.wide, r.sFB, r.sMid],
                pressing: [r.wide, r.sFB, r.sMid],
                actions: [
                    { type: "press", label: "SURROUND", path: [point(82, v.hY), point(88, v.fY)] },
                    { type: "press", label: "SHOW LINE", path: [point(78, v.fY), point(86, v.fY)] }
                ],
                zones: [{ type: "circle", cx: 90, cy: v.fY, radius: 9, tone: "press", label: "TRAP" }]
            },
            {
                id: "hp-win", label: "4 - Win it high", phase: "REGAIN",
                title: "Win it and go straight for goal", duration: 1800,
                caption: "Force the turnover in the final third and attack the shrunken space immediately.",
                ballPath: [point(90, v.fY), point(88, 30)],
                moves: moves(r.sMid, 86, 34, r.striker, 88, 30, r.wide, 90, v.fY, r.farFwd, 86, v.whY,
                    q.fbS, 92, v.fY),
                active: [r.sMid, r.striker, r.wide],
                actions: [{ type: "run", label: "ATTACK", path: [point(86, v.hY), point(88, 30)] }],
                zones: [{ type: "circle", cx: 88, cy: 32, radius: 8, tone: "press", label: "WON HIGH" }]
            }
        ];
        return { initial: initial, ball: point(88, v.hY), steps: steps };
    };

    // MID — compact block on halfway, screen the pivot, spring on the regain.
    PRESS.mid = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        layTeam(initial, r, 40, 52, 64, 12);
        layOpp(initial, q, 74, 60, 46, 96);
        var steps = [
            {
                id: "mb-set", label: "1 - Set the block", phase: "MID-BLOCK",
                title: "Compact 4-4-2 on halfway", duration: 1600,
                caption: "Hold a compact block around the halfway line — no chasing; keep the lines tight and the middle shut.",
                ballPath: [point(60, 34)],
                moves: moves(r.striker, 62, 30, r.wide, 60, v.hY, r.farFwd, 62, 38, r.sMid, 52, v.hY, r.wMid, 52, v.whY,
                    q.midS, 58, 34),
                active: [r.striker, r.sMid, r.wMid],
                zones: [{ type: "rect", x: 40, y: 6, width: 24, height: 56, tone: "protect", label: "COMPACT BLOCK" }]
            },
            {
                id: "mb-screen", label: "2 - Screen the pivot", phase: "DENY CENTRE",
                title: "Shut the middle, show them wide", duration: 1900,
                caption: "The strikers screen the pivot so the only pass is sideways or backwards, then shuffle across as a unit.",
                ballPath: [point(60, 34), point(64, v.hY)],
                moves: moves(r.striker, 58, 34, r.wide, 56, v.hY, r.sMid, 50, v.hY, r.wMid, 48, v.whY, r.sFB, 44, v.fY,
                    q.midS, 60, v.hY, q.fbS, 66, v.fY),
                active: [r.striker, r.wide, r.sMid],
                actions: [{ type: "pass", label: "FORCED SIDEWAYS", path: [point(60, 34), point(64, v.hY)] }],
                zones: [{ type: "band", x: 47, y: 6, width: 8, height: 56, tone: "neutral", label: "SCREEN LINE" }]
            },
            {
                id: "mb-jump", label: "3 - Jump the trigger", phase: "PRESS TRIGGER",
                title: "Spring when it comes into the block", duration: 1900,
                caption: "A pass into the feet of a player facing his own goal is the trigger — the near unit jumps to swarm.",
                ballPath: [point(64, v.hY), point(58, v.fY)],
                moves: moves(r.wide, 60, v.fY, r.sMid, 56, v.hY, r.sFB, 56, v.fY, r.wMid, 50, 34,
                    q.fbS, 60, v.fY),
                active: [r.wide, r.sMid, r.sFB],
                pressing: [r.wide, r.sMid, r.sFB],
                actions: [{ type: "press", label: "JUMP", path: [point(50, v.hY), point(58, v.fY)] }],
                trigger: { cx: 58, cy: v.fY, radius: 7, label: "TRIGGER" }
            },
            {
                id: "mb-spring", label: "4 - Spring the counter", phase: "REGAIN",
                title: "Win it and break through the middle", duration: 2000,
                caption: "Regain around halfway with the opponent's shape stretched — release the strikers straight up the pitch.",
                ballPath: [point(58, v.fY), point(78, 34)],
                moves: moves(r.striker, 78, 34, r.wide, 78, v.fY, r.sMid, 68, v.hY, r.farFwd, 74, v.whY,
                    q.cb, 76, 34),
                active: [r.striker, r.wide, r.sMid],
                actions: [
                    { type: "pass", label: "RELEASE", path: [point(58, v.fY), point(78, 34)] },
                    { type: "run", label: "BREAK", path: [point(62, 34), point(78, 34)] }
                ],
                zones: [{ type: "rect", x: 64, y: 12, width: 28, height: 44, tone: "neutral", label: "COUNTER SPACE" }]
            }
        ];
        return { initial: initial, ball: point(60, 34), steps: steps };
    };

    // LOW — two banks near own box, no chase, deny the cross/shot, block.
    PRESS.low = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        layTeam(initial, r, 18, 30, 46, 8);
        layOpp(initial, q, 58, 42, 26, 92);
        var steps = [
            {
                id: "lb-set", label: "1 - Two banks of four", phase: "LOW BLOCK",
                title: "Drop into a deep, narrow block", duration: 1600,
                caption: "Both banks drop to the edge of the box and squeeze narrow — concede the ball, protect the goal.",
                ballPath: [point(40, 34)],
                moves: moves(r.sMid, 30, v.hY, r.wMid, 30, v.whY, r.striker, 44, 34, r.sFB, 18, v.fY, r.wFB, 18, v.wY,
                    q.midS, 44, 34),
                active: [r.cbMid, r.sMid, r.wMid],
                zones: [{ type: "rect", x: 2, y: 8, width: 26, height: 52, tone: "protect", label: "LOW BLOCK" }]
            },
            {
                id: "lb-shift", label: "2 - Shift, don't chase", phase: "STAY COMPACT",
                title: "Slide across as a unit", duration: 1900,
                caption: "As the ball moves wide, the whole block slides over together — stay connected, never get pulled out.",
                ballPath: [point(40, 34), point(44, v.fY)],
                moves: moves(r.sMid, 30, v.hY, r.wMid, 28, 34, r.sFB, 20, v.fY, r.striker, 40, v.hY, r.wide, 30, v.hY,
                    q.fbS, 40, v.fY, q.wide, 36, v.fY),
                active: [r.sFB, r.sMid, r.wide],
                actions: [{ type: "run", label: "SLIDE", path: [point(30, 34), point(28, v.hY)] }],
                zones: [{ type: "band", x: 24, y: 6, width: 8, height: 56, tone: "protect", label: "STAY NARROW" }]
            },
            {
                id: "lb-deny", label: "3 - Deny the cross", phase: "DEFEND THE BOX",
                title: "Block the cross, fill the box", duration: 1900,
                caption: "The near full-back steps to block the cross while the centre-backs and far-side fill every gap in the six-yard box.",
                ballPath: [point(44, v.fY), point(30, v.fY)],
                moves: moves(r.sFB, 24, v.fY, r.cbMid, 14, 34, r.wFB, 14, v.wY, r.sMid, 22, v.hY, r.striker, 34, 34,
                    q.wide, 26, v.fY, q.fwdS, 16, v.nearY),
                active: [r.sFB, r.cbMid, r.wFB],
                pressing: [r.sFB],
                actions: [
                    { type: "press", label: "BLOCK CROSS", path: [point(28, v.hY), point(24, v.fY)] }
                ],
                zones: [{ type: "circle", cx: 12, cy: 34, radius: 10, tone: "press", label: "PROTECT THE BOX" }]
            },
            {
                id: "lb-clear", label: "4 - Win it & clear", phase: "REGAIN",
                title: "Head it clear and reset the line", duration: 1700,
                caption: "The centre-back attacks the cross, clears the danger, and the block steps out together to reset.",
                ballPath: [point(30, v.fY), point(44, 34)],
                moves: moves(r.cbMid, 20, 34, r.sMid, 34, v.hY, r.striker, 48, 34, r.sFB, 22, v.fY,
                    q.fwdS, 22, v.nearY),
                active: [r.cbMid, r.sMid, r.striker],
                actions: [{ type: "pass", label: "CLEAR", path: [point(16, 34), point(44, 34)] }],
                zones: [{ type: "band", x: 22, y: 6, width: 6, height: 56, tone: "neutral", label: "STEP OUT" }]
            }
        ];
        return { initial: initial, ball: point(40, 34), steps: steps };
    };

    // --------------------------------------------------------------- TRANSITION
    var TRANS = {};

    // SWARM — counterpress: nearest players collapse on the ball within 5s.
    TRANS.swarm = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var commit = scenario.commit;
        var initial = {};
        layTeam(initial, r, 44, 62, 78, 10);
        layOpp(initial, q, 24, 46, 66, 98);
        var steps = [
            {
                id: "sw-rest", label: "1 - Rest defence", phase: "BEFORE LOSS",
                title: "Balanced behind the ball", duration: 1500,
                caption: "Stay balanced in possession so that the instant the ball is lost, bodies are already positioned to press.",
                ballPath: [point(76, v.fY)],
                moves: moves(r.cbMid, 40, 34, r.wFB, 40, v.wY, r.pivot, 50, 34),
                active: [r.cbMid, r.pivot],
                zones: [{ type: "band", x: 34, y: 6, width: 16, height: 56, tone: "protect", label: "REST DEFENCE" }]
            },
            {
                id: "sw-swarm", label: "2 - Counterpress", phase: "ON LOSS",
                title: commit + " swarm the ball in 5s", duration: 3800,
                caption: "The moment it is lost, the nearest players collapse on the ball together to win it back before the counter starts.",
                ballPath: [point(76, v.fY), point(82, v.hY)],
                moves: moves(r.wide, 80, v.fY, r.sMid, 78, v.hY, r.striker, 82, 40, r.sFB, 80, v.right ? 50 : 18, r.pivot, 70, 34,
                    q.fwdS, 82, v.hY),
                active: [r.wide, r.sMid, r.striker, r.sFB, r.pivot],
                pressing: [r.wide, r.sMid, r.striker, r.sFB, r.pivot],
                actions: [
                    { type: "press", label: "P1", path: [point(78, v.fY), point(82, v.hY)] },
                    { type: "press", label: "P2", path: [point(70, v.hY), point(80, v.hY)] },
                    { type: "press", label: "P3", path: [point(82, 40), point(83, v.hY)] }
                ],
                zones: [{ type: "circle", cx: 82, cy: v.hY, radius: 11, tone: "press", label: commit + " SWARM" }],
                countdown: true
            },
            {
                id: "sw-attack", label: "3 - Win & attack", phase: "REGAIN",
                title: "Win it high and go again", duration: 2000,
                caption: "Regain in the final third and attack the disorganised defence immediately.",
                ballPath: [point(82, v.hY), point(92, v.fY)],
                moves: moves(r.wide, 92, v.fY, r.striker, 90, v.nearY, r.sMid, 84, v.hY, r.farFwd, 88, v.backY,
                    q.cb, 92, 32),
                active: [r.wide, r.striker, r.sMid],
                actions: [
                    { type: "pass", label: "RELEASE", path: [point(82, v.hY), point(92, v.fY)] },
                    { type: "run", label: "ATTACK", path: [point(84, v.fY), point(92, v.fY)] }
                ],
                zones: [{ type: "rect", x: 82, y: v.right ? 46 : 2, width: 22, height: 20, tone: "neutral", label: "GO AGAIN" }]
            }
        ];
        return { initial: initial, ball: point(76, v.fY), steps: steps };
    };

    // COUNTER — on the regain, break vertically at speed into the channel.
    TRANS.counter = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        // We win it deep, defending; the opponent is committed high.
        layTeam(initial, r, 24, 40, 58, 9);
        layOpp(initial, q, 62, 48, 32, 96);
        var steps = [
            {
                id: "co-win", label: "1 - Win it deep", phase: "REGAIN",
                title: "Win it in a low block", duration: 1500,
                caption: "The ball is won deep with the opponent pushed on — five have to sprint the moment we turn it over.",
                ballPath: [point(30, 34)],
                moves: moves(r.striker, 52, 34, r.wide, 50, v.fY, r.sMid, 42, v.hY,
                    q.fwdS, 30, 32),
                active: [r.cbMid, r.pivot, r.striker],
                zones: [{ type: "rect", x: 6, y: 8, width: 26, height: 52, tone: "protect", label: "LOW BLOCK" }]
            },
            {
                id: "co-launch", label: "2 - Launch the break", phase: "TRANSITION",
                title: "First pass forward, sprint the channel", duration: 1800,
                caption: "One vertical pass releases the striker; the winger sprints the open channel outside him.",
                ballPath: [point(30, 34), point(60, v.hY)],
                moves: moves(r.striker, 62, 34, r.wide, 66, v.fY, r.sMid, 52, v.hY, r.farFwd, 60, v.whY,
                    q.cb, 62, 34),
                active: [r.striker, r.wide],
                actions: [
                    { type: "pass", label: "OUTLET", path: [point(30, 34), point(60, v.hY)] },
                    { type: "run", label: "SPRINT CHANNEL", path: [point(48, v.fY), point(66, v.fY)] }
                ],
                zones: [{ type: "rect", x: 40, y: 8, width: 40, height: 52, tone: "neutral", label: "OPEN PITCH" }]
            },
            {
                id: "co-finish", label: "3 - Finish the counter", phase: "FINISH",
                title: "Two-v-one before they recover", duration: 1800,
                caption: "Carry into the two-v-one and slide the winger in behind for an early shot.",
                ballPath: [point(60, v.hY), point(86, v.fY)],
                moves: moves(r.wide, 86, v.fY, r.striker, 88, 34, r.farFwd, 84, v.whY, r.sMid, 74, v.hY,
                    q.cb, 88, 32, q.cbW, 88, 36),
                active: [r.wide, r.striker],
                actions: [
                    { type: "pass", label: "SLIDE", path: [point(60, v.hY), point(86, v.fY)] },
                    { type: "run", label: "IN BEHIND", path: [point(70, v.fY), point(86, v.fY)] }
                ],
                zones: [{ type: "rect", x: 80, y: v.right ? 46 : 2, width: 22, height: 20, tone: "press", label: "2v1" }]
            }
        ];
        return { initial: initial, ball: point(30, 34), steps: steps };
    };

    // SECURE — after loss, don't gamble: drop, delay, and keep it on the regain.
    TRANS.secure = function (ourSlots, oppSlots, flank, scenario) {
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank), v = flankVars(flank);
        var initial = {};
        layTeam(initial, r, 42, 58, 72, 10);
        layOpp(initial, q, 30, 50, 66, 98);
        var steps = [
            {
                id: "se-delay", label: "1 - Delay the counter", phase: "ON LOSS",
                title: "First man delays, the rest drop", duration: 1700,
                caption: "Rather than gamble on a counterpress, the nearest player just delays while everyone else drops into shape.",
                ballPath: [point(70, v.fY), point(64, v.hY)],
                moves: moves(r.sMid, 60, v.hY, r.wide, 58, v.fY, r.pivot, 52, 34, r.striker, 66, 34, r.cbMid, 40, 34,
                    q.fwdS, 60, v.hY),
                active: [r.sMid, r.pivot, r.cbMid],
                pressing: [r.sMid],
                actions: [{ type: "press", label: "DELAY", path: [point(66, v.hY), point(62, v.fY)] }],
                zones: [{ type: "band", x: 40, y: 6, width: 10, height: 56, tone: "protect", label: "DROP & DELAY" }]
            },
            {
                id: "se-shape", label: "2 - Recover shape", phase: "RESET",
                title: "Get everyone behind the ball", duration: 1800,
                caption: "The whole team recovers into a set mid-block; deny the space in behind and force the opponent to build slowly.",
                ballPath: [point(64, v.hY), point(56, 34)],
                moves: moves(r.sMid, 50, v.hY, r.wMid, 50, v.whY, r.wide, 52, v.fY, r.striker, 58, 34, r.sFB, 44, v.fY,
                    q.midS, 52, 34),
                active: [r.sMid, r.wMid, r.wide],
                zones: [{ type: "rect", x: 38, y: 6, width: 22, height: 56, tone: "neutral", label: "SET BLOCK" }]
            },
            {
                id: "se-keep", label: "3 - Win & keep it", phase: "REGAIN",
                title: "Regain and keep the ball", duration: 2000,
                caption: "When the ball is won, there is no rush — secure it, take the sting out of the game and rebuild possession.",
                ballPath: [point(56, 34), point(44, 34), point(40, v.hY)],
                moves: moves(r.pivot, 46, 34, r.sMid, 54, v.hY, r.wMid, 52, v.whY, r.sFB, 50, v.fY, r.cbMid, 36, 34,
                    q.fwdS, 52, 34),
                active: [r.pivot, r.sMid, r.cbMid],
                actions: [{ type: "pass", label: "RECYCLE", path: [point(56, 34), point(44, 34), point(40, v.hY)] }],
                zones: [{ type: "rect", x: 30, y: 8, width: 28, height: 52, tone: "neutral", label: "KEEP-BALL" }]
            }
        ];
        return { initial: initial, ball: point(70, v.fY), steps: steps };
    };

    // ------------------------------------------------------------ profiles
    // shape [DEF,MID,FWD], flank, attack, press, transition.
    var STYLE_PROFILES = {
        BRA: { shape: [4, 3, 3], flank: "left", attack: "wing", press: "high", trans: "swarm" },
        ARG: { shape: [4, 3, 3], flank: "right", attack: "central", press: "high", trans: "swarm" },
        FRA: { shape: [4, 3, 3], flank: "left", attack: "counter", press: "mid", trans: "counter" },
        ENG: { shape: [4, 3, 3], flank: "right", attack: "wing", press: "high", trans: "swarm" },
        NED: { shape: [3, 4, 3], flank: "right", attack: "wingback", press: "mid", trans: "counter" },
        CRO: { shape: [4, 3, 3], flank: "right", attack: "central", press: "mid", trans: "secure" },
        POR: { shape: [4, 3, 3], flank: "left", attack: "buildup", press: "mid", trans: "secure" },
        ESP: { shape: [4, 3, 3], flank: "left", attack: "central", press: "high", trans: "swarm" },
        MAR: { shape: [4, 5, 1], flank: "right", attack: "counter", press: "low", trans: "counter" },
        JPN: { shape: [3, 4, 3], flank: "right", attack: "wingback", press: "low", trans: "counter" },
        KOR: { shape: [4, 4, 2], flank: "left", attack: "counter", press: "low", trans: "counter" },
        POL: { shape: [4, 4, 2], flank: "right", attack: "direct", press: "low", trans: "counter" },
        SEN: { shape: [4, 3, 3], flank: "right", attack: "direct", press: "mid", trans: "counter" },
        SUI: { shape: [4, 4, 2], flank: "left", attack: "direct", press: "low", trans: "secure" },
        AUS: { shape: [4, 4, 2], flank: "left", attack: "direct", press: "low", trans: "counter" },
        USA: { shape: [4, 3, 3], flank: "left", attack: "wing", press: "high", trans: "counter" }
    };

    var ARCHE_TO_ATTACK = { isolate: "wing", box: "direct", between: "central", transition: "counter", buildup: "buildup" };

    function profileFor(ourTeam, oppTeam, code, flankFallback) {
        var arche = attackArchetype(topPlayer(ourTeam));
        var diff = strengthOf(ourTeam) - strengthOf(oppTeam);
        var attack = ARCHE_TO_ATTACK[arche] || "wing";
        if (diff <= -0.06) attack = "counter";
        var prof = {
            shape: null, flank: flankFallback,
            attack: attack,
            press: diff >= 0.04 ? "high" : (diff <= -0.04 ? "low" : "mid"),
            trans: attack === "central" ? "swarm" : (diff <= -0.04 ? "counter" : "secure")
        };
        var c = STYLE_PROFILES[code];
        if (c) {
            if (c.shape) prof.shape = c.shape;
            if (c.flank) prof.flank = c.flank;
            if (c.attack) prof.attack = c.attack;
            if (c.press) prof.press = c.press;
            if (c.trans) prof.trans = c.trans;
        }
        return prof;
    }

    function attackFor(style, a, b, f, s) { return (ATTACK[style] || ATTACK.wing)(a, b, f, s); }
    function pressFor(style, a, b, f, s) { return (PRESS[style] || PRESS.mid)(a, b, f, s); }
    function transFor(style, a, b, f, s) { return (TRANS[style] || TRANS.swarm)(a, b, f, s); }

    function formationStates(ourSlots, oppSlots, counts, scenario) {
        var mergedAttack = {};
        ourSlots.forEach(function (s) {
            mergedAttack[s.id] = point(clamp(s.pos.xMeters + Math.max(0, scenario.lineShift), 8, 96), s.pos.yMeters);
        });
        oppSlots.forEach(function (s) { mergedAttack[s.id] = s.pos; });
        var mergedBlock = {};
        ourSlots.forEach(function (s) {
            mergedBlock[s.id] = point(clamp(s.pos.xMeters - 12, 8, 80), s.pos.yMeters);
        });
        oppSlots.forEach(function (s) { mergedBlock[s.id] = s.pos; });
        var frontIds = ourSlots.filter(function (s) { return s.type === "FWD"; }).map(function (s) { return s.id; });
        var backIds = ourSlots.filter(function (s) { return s.type === "DEF"; }).map(function (s) { return s.id; });
        return [
            {
                id: "formation-possession", label: "In possession · " + formationName(counts),
                phase: "IN POSSESSION", title: "Build in a " + formationName(counts),
                caption: "The base attacking structure with the front line holding width.",
                positions: mergedAttack, active: [],
                bands: [
                    { x: 24, width: 10, label: "BACK " + counts[0], tone: "neutral" },
                    { x: 46, width: 10, label: "MID " + counts[1], tone: "neutral" },
                    { x: 70, width: 16, label: "FRONT " + counts[2], tone: "neutral" }
                ]
            },
            {
                id: "formation-out", label: "Out of possession",
                phase: "OUT OF POSSESSION", title: "Defend in a compact block",
                caption: "Two banks drop to protect the centre.",
                positions: mergedBlock, active: []
            },
            {
                id: "formation-rest", label: "Rest defence",
                phase: "ATTACKING SECURITY", title: "Protect the attack",
                caption: "The back line and screen stay home behind the ball.",
                positions: mergedAttack, active: backIds, protect: backIds
            },
            {
                id: "formation-lanes", label: "Final third · lanes",
                phase: "FINAL-THIRD OCCUPATION", title: "Occupy the attacking lanes",
                caption: "The front line stretches the opponent's last line.",
                positions: mergedAttack, active: frontIds,
                lanes: [
                    { y: 0, height: 13.6, label: "LEFT WING" },
                    { y: 13.6, height: 13.6, label: "LEFT HALF" },
                    { y: 27.2, height: 13.6, label: "CENTRE" },
                    { y: 40.8, height: 13.6, label: "RIGHT HALF" },
                    { y: 54.4, height: 13.6, label: "RIGHT WING" }
                ]
            }
        ];
    }

    function markMove(id, pos) {
        var m = {};
        if (id) m[id] = onPitch(pos);
        return m;
    }
    function pickId(slots, letter, which) {
        var matches = slots.filter(function (s) {
            return s.id.indexOf(letter, s.id.length - (letter.length + 1)) !== -1 ||
                new RegExp(letter + "\\d+$").test(s.id);
        });
        if (!matches.length) return slots[slots.length - 1].id;
        if (which === "first") return matches[0].id;
        if (which === "middle") return matches[Math.floor(matches.length / 2)].id;
        return matches[matches.length - 1].id; // "last" / default
    }

    /**
     * Generate the full plan for a matchup + scenario.
     * @param {Object} opts { teams:{code->team}, ourCode, oppCode, scenario }
     */
    function generate(opts) {
        var teams = opts.teams;
        var squads = opts.squads || null;
        var ourCode = opts.ourCode;
        var oppCode = opts.oppCode;
        var scenarioKey = opts.scenario || "prematch";
        var scenario = SCENARIOS[scenarioKey] || SCENARIOS.prematch;
        var ourTeam = teams[ourCode];
        var oppTeam = teams[oppCode];
        if (!ourTeam || !oppTeam) throw new Error("Unknown team code in matchup " + ourCode + " vs " + oppCode);
        // Fill the XI from the full appearance squad when available (so no slot
        // falls back to a placeholder); the rated ratings still order priority.
        var ourPool = squads && squads[ourCode] ? { players: squads[ourCode] } : ourTeam;
        var oppPool = squads && squads[oppCode] ? { players: squads[oppCode] } : oppTeam;

        // The team's game-plan profile drives the shape, flank and every phase.
        var prof = profileFor(ourTeam, oppTeam, ourCode, hash(ourCode + oppCode) % 2 === 0 ? "right" : "left");
        var flank = prof.flank;
        var ourCounts = prof.shape || formationFor(ourCode);
        var oppCounts = (STYLE_PROFILES[oppCode] && STYLE_PROFILES[oppCode].shape) || formationFor(oppCode);
        // Our attacking shape (toward +x) and the opponent's defensive block.
        var ourSlots = buildShape("us_", ourCounts, 40, 18, 18);
        var oppSlotsRaw = buildShape("op_", oppCounts, 40, 18, 18);
        var oppSlots = oppSlotsRaw.map(function (s) {
            return { id: s.id, type: s.type, pos: mirrorX(s.pos) };
        });

        var roster = {};
        fillRoster(roster, ourSlots, ourCode, "ours", assignPlayers(ourPool, ourCounts), true);
        fillRoster(roster, oppSlots, oppCode, "theirs", assignPlayers(oppPool, oppCounts), false);

        var text = planText(ourTeam, oppTeam, flank, scenarioKey, prof.attack);
        var confidence = confidenceFor(ourTeam, oppTeam, scenarioKey);

        return {
            meta: {
                ourCode: ourCode, oppCode: oppCode, ourName: ourTeam.name, oppName: oppTeam.name,
                flank: flank, ourFormation: formationName(ourCounts), oppFormation: formationName(oppCounts),
                attackStyle: prof.attack, pressStyle: prof.press, transStyle: prof.trans,
                scenario: scenarioKey
            },
            roster: roster,
            attack: attackFor(prof.attack, ourSlots, oppSlots, flank, scenario),
            press: pressFor(prof.press, ourSlots, oppSlots, flank, scenario),
            transition: transFor(prof.trans, ourSlots, oppSlots, flank, scenario),
            formationStates: formationStates(ourSlots, oppSlots, ourCounts, scenario),
            scenarioText: { plan: text.plan, why: text.why, confidence: confidence }
        };
    }

    return {
        KNOCKOUTS: KNOCKOUTS,
        FORMATIONS: FORMATIONS,
        SCENARIOS: Object.keys(SCENARIOS),
        generate: generate,
        _internal: {
            classify: classify, buildShape: buildShape, confidenceFor: confidenceFor,
            strengthOf: strengthOf, mirrorX: mirrorX
        }
    };
});
