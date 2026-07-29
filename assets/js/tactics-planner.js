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
        if (pos.indexOf("goalkeeper") !== -1) return "GK";
        if (pos.indexOf("forward") !== -1 || pos.indexOf("striker") !== -1 ||
            pos.indexOf("winger") !== -1 || pos.indexOf("wing") !== -1) return "FWD";
        if (pos.indexOf("midfield") !== -1) return "MID";
        if (pos.indexOf("back") !== -1 || pos.indexOf("defender") !== -1) return "DEF";
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
            roster[slot.id] = {
                team: teamCode,
                side: teamSideKey,
                isOurs: isOurs,
                number: pickNumber(baseNum),
                name: player ? player.name : teamCode + " " + label,
                surname: player ? shortName(player.name) : label,
                displayName: player ? player.name : teamCode + " " + label,
                wikiTitle: player ? player.name : "",
                rating: player ? player.rating : null,
                role: player ? (player.role || player.position || label) : label,
                slot: label,
                instruction: player
                    ? (isOurs ? "" : "Opponent " + label + ".")
                    : ""
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

    function planText(ourTeam, oppTeam, flank, scenarioKey) {
        var star = topPlayerName(ourTeam);
        var wide = flank === "right" ? "right" : "left";
        var s = scenarioKey;
        if (s === "leading") {
            return {
                plan: "Compact control with selective " + wide + "-channel releases",
                why: "Protect the centre first against " + oppTeam.name + ", then use the space they leave as they push on — release " + star + " on the break."
            };
        }
        if (s === "trailing") {
            return {
                plan: "High 3–2–5 press to force the game",
                why: "Commit six forward, counterpress on every loss, and overload the " + wide + " to isolate " + star + " — accepting more transition risk against " + oppTeam.name + "."
            };
        }
        if (s === "drawing") {
            return {
                plan: "Controlled overload with an earlier " + wide + "-side release",
                why: "Keep the " + wide + "-side route but release earlier while the rest defence stays intact against " + oppTeam.name + "."
            };
        }
        return {
            plan: "Controlled possession, then a " + wide + "-side overload",
            why: "Draw " + oppTeam.name + " in, release " + star + " in the " + wide + " half-space, then attack the cutback zone."
        };
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

    function attackSequence(ourSlots, oppSlots, flank, scenario) {
        var right = flank === "right";
        var lift = scenario.lineShift;
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank);
        var fY = right ? 58 : 10, hY = right ? 44 : 24, wY = right ? 12 : 56;
        var byY = right ? 63 : 5, nearY = right ? 40 : 28, backY = right ? 27 : 41;
        // Base shapes: our team building, opponent in a deep block.
        var initial = {};
        initial[r.gk] = point(9, 34);
        laneAssign(initial, r.u.DEF, 41 + lift, 9);
        laneAssign(initial, r.u.MID, 59 + lift, 13);
        laneAssign(initial, r.u.FWD.length ? r.u.FWD : [r.striker], 75 + lift, r.u.FWD.length >= 3 ? 7 : 20);
        initial[q.gk] = point(99, 34);
        laneAssign(initial, q.o.DEF, 90, 8);
        laneAssign(initial, q.o.MID, 76, 12);
        laneAssign(initial, q.o.FWD, 62, q.o.FWD.length >= 3 ? 7 : 20);
        var ball = point(9, 34);
        var steps = [
            {
                id: "attack-build", label: "1 - Build", phase: "IN POSSESSION",
                title: "Build a base behind the ball", duration: 1500,
                caption: "The pivot drops in, the full-backs set the width, and the front line pins the last line.",
                ballPath: [ball],
                moves: moves(r.pivot, 34, 34, r.sFB, 47, fY, r.wFB, 41, wY, r.sMid, 52, hY,
                    q.fwdS, 58, hY, q.fwdW, 58, right ? 24 : 44),
                active: [r.gk, r.cbMid, r.pivot, r.sFB],
                zones: [{ type: "rect", x: 16, y: 8, width: 32, height: 52, tone: "neutral", label: "BUILD PLATFORM" }]
            },
            {
                id: "attack-draw", label: "2 - Draw them out", phase: "BUILD-UP",
                title: "Carry out and draw the press", duration: 2200,
                caption: "The centre-back steps out with the ball; the opponent's forward jumps and the pivot rotates.",
                ballPath: [point(9, 34), point(24, hY), point(34, hY)],
                moves: moves(r.cbMid, 34, hY, r.pivot, 40, 30, r.sMid, 54, hY, r.sFB, 52, fY,
                    q.fwdS, 42, hY, q.midS, 60, hY),
                active: [r.gk, r.cbMid, r.pivot, r.sMid],
                actions: [
                    { type: "pass", label: "PASS", path: [point(9, 34), point(24, hY)] },
                    { type: "carry", label: "CARRY", path: [point(24, hY), point(30, hY), point(34, hY)] }
                ]
            },
            {
                id: "attack-between", label: "3 - Between the lines", phase: "PROGRESSION",
                title: "Find the creator between the lines", duration: 2000,
                caption: "The ball breaks the midfield line; the winger holds width and the striker pins the centre-backs.",
                ballPath: [point(34, hY), point(54, hY)],
                moves: moves(r.sMid, 54, hY, r.wide, 72, fY, r.striker, 80, 34, r.farFwd, 74, wY,
                    r.sFB, 60, fY, q.fbS, 74, fY, q.midS, 60, hY, q.cb, 82, 30),
                active: [r.cbMid, r.sMid, r.wide, r.striker],
                actions: [{ type: "pass", label: "LINE BREAK", path: [point(34, hY), point(54, hY)] }],
                zones: [{ type: "rect", x: 50, y: right ? 38 : 8, width: 26, height: 22, tone: "neutral", label: (right ? "RIGHT" : "LEFT") + " HALF-SPACE" }]
            },
            {
                id: "attack-overload", label: "4 - Overload", phase: "CREATION",
                title: "Overload the " + (right ? "right" : "left") + " with an overlap", duration: 2200,
                caption: "The creator releases the winger while the full-back overlaps and the striker pins the far centre-back.",
                ballPath: [point(54, hY), point(70, fY)],
                moves: moves(r.wide, 70, fY, r.sFB, 82, byY, r.sMid, 64, hY, r.striker, 82, 34,
                    r.farFwd, 78, wY, q.fbS, 76, fY, q.cb, 80, hY, q.midW, 66, hY),
                active: [r.sMid, r.wide, r.sFB],
                actions: [
                    { type: "pass", label: "PASS", path: [point(54, hY), point(70, fY)] },
                    { type: "run", label: "OVERLAP", path: [point(60, fY), point(82, byY)] },
                    { type: "decoy", label: "PIN", path: [point(80, 34), point(82, 34)] }
                ],
                zones: [{ type: "rect", x: 58, y: right ? 40 : 4, width: 28, height: 24, tone: "neutral", label: "3v2 OVERLOAD" }]
            },
            {
                id: "attack-byline", label: "5 - Reach the byline", phase: "FINAL THIRD",
                title: "Get to the byline", duration: 1900,
                caption: "The overlap reaches the byline as the striker attacks the near post and the far runner the back post.",
                ballPath: [point(70, fY), point(90, byY)],
                moves: moves(r.sFB, 90, byY, r.striker, 90, nearY, r.farFwd, 93, backY, r.sMid, 82, hY,
                    r.wide, 80, 40, q.cb, 92, 30, q.cbW, 92, 38, q.fbS, 88, fY),
                active: [r.wide, r.sFB, r.striker, r.farFwd],
                actions: [
                    { type: "pass", label: "RELEASE", path: [point(70, fY), point(90, byY)] },
                    { type: "run", label: "NEAR POST", path: [point(82, 34), point(90, nearY)] },
                    { type: "run", label: "BACK POST", path: [point(78, wY), point(93, backY)] }
                ]
            },
            {
                id: "attack-cutback", label: "6 - Cut it back", phase: "FINISH",
                title: "Cut it back to the arriving runner", duration: 1800,
                caption: "The low cutback finds the striker at the spot as the midfielder arrives on the edge of the box.",
                ballPath: [point(90, byY), point(93, 34)],
                moves: moves(r.striker, 93, 34, r.pivot, 86, 30, r.farFwd, 95, backY, r.sMid, 84, 38,
                    q.cb, 95, 31, q.cbW, 95, 37),
                active: [r.sFB, r.striker, r.pivot, r.farFwd],
                actions: [
                    { type: "pass", label: "CUTBACK", path: [point(90, byY), point(93, 34)] },
                    { type: "run", label: "ARRIVE", path: [point(70, 30), point(86, 30)] }
                ],
                zones: [{ type: "circle", cx: 93, cy: 34, radius: 8, tone: "press", label: "CUTBACK ZONE" }]
            }
        ];
        return { initial: initial, ball: point(9, 34), steps: steps };
    }

    function pressSequence(ourSlots, oppSlots, flank, scenario) {
        var right = flank === "right";
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank);
        var fY = right ? 57 : 11, hY = right ? 44 : 24, whY = right ? 24 : 44;
        var pressLine = scenario.pressLine;
        // Press shape: our team high; opponent playing out from the keeper.
        var initial = {};
        initial[r.gk] = point(12, 34);
        laneAssign(initial, r.u.DEF, 50, 10);
        laneAssign(initial, r.u.MID, 64, 13);
        laneAssign(initial, r.u.FWD.length ? r.u.FWD : [r.striker], 75, r.u.FWD.length >= 3 ? 8 : 20);
        initial[q.gk] = point(97, 34);
        laneAssign(initial, q.o.DEF, 87, 9);
        laneAssign(initial, q.o.MID, 74, 12);
        laneAssign(initial, q.o.FWD, 58, q.o.FWD.length >= 3 ? 7 : 20);
        var ball = point(86, hY);
        var steps = [
            {
                id: "press-set", label: "1 - Set the trap", phase: "PRESSING",
                title: "Set the front line", duration: 1600,
                caption: "The forwards screen the pivot and shade the ball toward the strong side.",
                ballPath: [ball],
                moves: moves(r.wide, 74, hY, r.striker, 74, 34, r.farFwd, 74, whY, r.sMid, 62, hY,
                    q.midS, 72, 34),
                active: [r.wide, r.striker, r.farFwd],
                zones: [{ type: "band", x: 60, y: right ? 20 : 24, width: 8, height: 24, tone: "neutral", label: "FRONT LINE" }]
            },
            {
                id: "press-trigger", label: "2 - Trigger", phase: "PRESS TRIGGER",
                title: "Trigger on the pass back", duration: 1900,
                caption: "The back pass to the keeper springs the press; the forwards jump together.",
                ballPath: [point(86, hY), point(96, 34)],
                moves: moves(r.striker, 82, 34, r.wide, 80, hY, r.sMid, 68, hY, r.sFB, 60, fY),
                active: [q.gk, r.striker, r.wide],
                actions: [{ type: "pass", label: "BACK PASS", path: [point(86, hY), point(96, 34)] }],
                trigger: { cx: 96, cy: 34, radius: 7, label: "PRESS TRIGGER" }
            },
            {
                id: "press-force", label: "3 - Force wide", phase: "LOCK OUTSIDE",
                title: "Force play to the touchline", duration: 2300,
                caption: "The curved press blocks the middle and sends the keeper wide into the trap.",
                ballPath: [point(96, 34), point(88, fY)],
                moves: moves(r.striker, 86, hY, r.wide, 82, fY, r.sMid, 70, hY, r.sFB, 78, fY,
                    q.fbS, 88, fY, q.fwdS, 80, fY),
                active: [r.striker, r.wide, r.sMid, r.sFB],
                pressing: [r.striker, r.wide],
                actions: [
                    { type: "press", label: "CURVED PRESS", path: [point(82, 34), point(85, hY), point(86, hY)] },
                    { type: "pass", label: "FORCED WIDE", path: [point(96, 34), point(88, fY)] }
                ]
            },
            {
                id: "press-win", label: "4 - Spring the trap", phase: "WIN IT HIGH",
                title: "Trap the ball on the touchline", duration: 2000,
                caption: "The winger and full-back double the flank and win it high, with the block set behind at the engagement line.",
                ballPath: [point(88, fY), point(85, fY)],
                moves: moves(r.wide, 86, fY, r.sFB, 82, fY, r.sMid, 78, hY, r.striker, 84, hY,
                    r.pivot, 62, 34, q.fbS, 90, fY),
                active: [r.wide, r.sFB, r.sMid, r.striker],
                pressing: [r.wide, r.sFB],
                actions: [
                    { type: "press", label: "DOUBLE UP", path: [point(82, fY), point(86, fY)] },
                    { type: "press", label: "SUPPORT", path: [point(78, hY), point(83, hY)] }
                ],
                zones: [
                    { type: "circle", cx: 86, cy: fY, radius: 9, tone: "press", label: "WON HIGH" },
                    { type: "line", x1: pressLine, y1: 3, x2: pressLine, y2: 65, tone: "press", label: "ENGAGEMENT LINE - " + pressLine + " m" }
                ]
            }
        ];
        return { initial: initial, ball: point(86, hY), steps: steps };
    }

    function transitionSequence(ourSlots, oppSlots, flank, scenario) {
        var right = flank === "right";
        var r = roleMap(ourSlots, flank), q = oppRoles(oppSlots, flank);
        var fY = right ? 57 : 11, hY = right ? 44 : 24, wY = right ? 12 : 56;
        var nearY = right ? 40 : 28, backY = right ? 27 : 41;
        var commit = scenario.commit;
        // We have just lost the ball high in the opponent's half.
        var initial = {};
        initial[r.gk] = point(10, 34);
        laneAssign(initial, r.u.DEF, 44, 12);
        laneAssign(initial, r.u.MID, 62, 13);
        laneAssign(initial, r.u.FWD.length ? r.u.FWD : [r.striker], 78, r.u.FWD.length >= 3 ? 7 : 20);
        initial[q.gk] = point(98, 34);
        laneAssign(initial, q.o.DEF, 24, 10);
        laneAssign(initial, q.o.MID, 46, 12);
        laneAssign(initial, q.o.FWD, 66, q.o.FWD.length >= 3 ? 7 : 20);
        var ball = point(76, fY);
        var steps = [
            {
                id: "transition-rest", label: "1 - Rest defence", phase: "BEFORE LOSS",
                title: "Keep a rest defence behind the ball", duration: 1600,
                caption: "Three defenders and the pivot stay home so a loss cannot become a clean counter.",
                ballPath: [ball],
                moves: moves(r.cbMid, 40, 34, r.wFB, 40, wY, r.pivot, 48, 34, r.sFB, 52, fY),
                active: [r.cbMid, r.wFB, r.pivot],
                zones: [{ type: "band", x: 34, y: 6, width: 16, height: 56, tone: "protect", label: "REST DEFENCE" }]
            },
            {
                id: "transition-press", label: "2 - Counterpress", phase: "ON LOSS",
                title: commit + " swarm the ball immediately", duration: 4000,
                caption: "The nearest players collapse on the loose ball within five seconds; the rest screen the centre.",
                ballPath: [point(76, fY), point(82, hY)],
                moves: moves(r.wide, 80, fY, r.sMid, 78, hY, r.striker, 82, 40, r.sFB, 80, right ? 50 : 18,
                    r.pivot, 70, 34, q.fwdS, 82, hY, q.midS, 74, hY),
                active: [r.wide, r.sMid, r.striker, r.sFB, r.pivot],
                pressing: [r.wide, r.sMid, r.striker, r.sFB, r.pivot],
                actions: [
                    { type: "press", label: "P1", path: [point(78, fY), point(82, hY)] },
                    { type: "press", label: "P2", path: [point(70, hY), point(80, hY)] },
                    { type: "press", label: "P3", path: [point(82, 40), point(83, hY)] }
                ],
                zones: [{ type: "circle", cx: 82, cy: hY, radius: 11, tone: "press", label: commit + " PRESS" }],
                countdown: true
            },
            {
                id: "transition-release", label: "3 - Win & release", phase: "REGAIN",
                title: "Win it and attack the " + (right ? "right" : "left") + " channel", duration: 2300,
                caption: "The regain releases the winger down the channel before the opponent can reset.",
                ballPath: [point(82, hY), point(93, fY)],
                moves: moves(r.wide, 93, fY, r.striker, 90, nearY, r.sMid, 84, hY, r.farFwd, 88, backY),
                active: [r.sMid, r.wide, r.striker],
                actions: [
                    { type: "pass", label: "RELEASE", path: [point(82, hY), point(93, fY)] },
                    { type: "run", label: "CHANNEL RUN", path: [point(84, fY), point(93, fY)] },
                    { type: "run", label: "NEAR POST", path: [point(84, 40), point(90, nearY)] }
                ],
                zones: [{ type: "rect", x: 82, y: right ? 46 : 2, width: 22, height: 20, tone: "neutral", label: (right ? "RIGHT" : "LEFT") + " CHANNEL" }]
            }
        ];
        return { initial: initial, ball: point(76, fY), steps: steps };
    }

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
        var ourCode = opts.ourCode;
        var oppCode = opts.oppCode;
        var scenarioKey = opts.scenario || "prematch";
        var scenario = SCENARIOS[scenarioKey] || SCENARIOS.prematch;
        var ourTeam = teams[ourCode];
        var oppTeam = teams[oppCode];
        if (!ourTeam || !oppTeam) throw new Error("Unknown team code in matchup " + ourCode + " vs " + oppCode);

        var ourCounts = formationFor(ourCode);
        var oppCounts = formationFor(oppCode);
        // Our attacking shape (toward +x) and the opponent's defensive block.
        var ourSlots = buildShape("us_", ourCounts, 40, 18, 18);
        var oppSlotsRaw = buildShape("op_", oppCounts, 40, 18, 18);
        var oppSlots = oppSlotsRaw.map(function (s) {
            return { id: s.id, type: s.type, pos: mirrorX(s.pos) };
        });

        // Deterministic-but-varied strong flank per matchup (illustrative).
        var flank = hash(ourCode + oppCode) % 2 === 0 ? "right" : "left";

        var roster = {};
        fillRoster(roster, ourSlots, ourCode, "ours", assignPlayers(ourTeam, ourCounts), true);
        fillRoster(roster, oppSlots, oppCode, "theirs", assignPlayers(oppTeam, oppCounts), false);

        var text = planText(ourTeam, oppTeam, flank, scenarioKey);
        var confidence = confidenceFor(ourTeam, oppTeam, scenarioKey);

        return {
            meta: {
                ourCode: ourCode, oppCode: oppCode, ourName: ourTeam.name, oppName: oppTeam.name,
                flank: flank, ourFormation: formationName(ourCounts), oppFormation: formationName(oppCounts),
                scenario: scenarioKey
            },
            roster: roster,
            attack: attackSequence(ourSlots, oppSlots, flank, scenario),
            press: pressSequence(ourSlots, oppSlots, flank, scenario),
            transition: transitionSequence(ourSlots, oppSlots, flank, scenario),
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
