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

    function flankY(flank) { return flank === "right" ? 57 : 11; }
    function halfY(flank) { return flank === "right" ? 45 : 23; }

    function attackSequence(ourSlots, oppSlots, flank, scenario) {
        var lift = scenario.lineShift;
        var initial = {};
        ourSlots.forEach(function (s) {
            initial[s.id] = point(clamp(s.pos.xMeters + Math.max(0, lift), 8, 96), s.pos.yMeters);
        });
        oppSlots.forEach(function (s) { initial[s.id] = s.pos; });
        var fY = flankY(flank), hY = halfY(flank);
        var ballStart = point(9, 34);
        // Choose our carriers by slot ids present.
        var cb = pickId(ourSlots, "d");
        var mid = pickId(ourSlots, "m");
        var wide = pickId(ourSlots, "f", flank === "right" ? "last" : "first");
        var target = pickId(ourSlots, "f", "middle");
        var steps = [
            {
                id: "attack-build", label: "1 · Build", phase: "BUILD-UP",
                title: "Build from the back", duration: 1600,
                caption: "Draw the first line, then break it with the free centre-back.",
                moves: {}, ballPath: [ballStart, point(38, hY)],
                active: [ourSlots[0].id, cb],
                actions: [{ type: "pass", label: "SPLIT", path: [ballStart, point(38, hY)] }]
            },
            {
                id: "attack-progress", label: "2 · Progress", phase: "PROGRESSION",
                title: "Progress into the " + (flank === "right" ? "right" : "left") + " half-space",
                duration: 1900,
                caption: "Connect through midfield toward the strong side.",
                moves: markMove(wide, point(66, fY)),
                ballPath: [point(38, hY), point(58, hY)],
                active: [cb, mid],
                actions: [{ type: "pass", label: "LINE BREAK", path: [point(38, hY), point(58, hY)] }],
                zones: [{ type: "band", x: 52, y: fY - 12, width: 8, height: 24, tone: "neutral", label: "HALF-SPACE" }]
            },
            {
                id: "attack-release", label: "3 · Release", phase: "FINAL THIRD",
                title: "Release the overlap",
                duration: 2100,
                caption: "The creator draws the full-back; the runner overlaps outside.",
                moves: markMove(target, point(88, 34)),
                ballPath: [point(58, hY), point(86, fY)],
                active: [mid, wide],
                actions: [
                    { type: "pass", label: "RELEASE", path: [point(58, hY), point(86, fY)] },
                    { type: "run", label: "OVERLAP", path: [point(66, fY), point(86, fY)] }
                ],
                zones: [{ type: "rect", x: 80, y: flank === "right" ? 50 : 2, width: 24, height: 16, tone: "neutral", label: (flank === "right" ? "RIGHT" : "LEFT") + " CHANNEL" }]
            },
            {
                id: "attack-cutback", label: "4 · Cutback", phase: "CHANCE",
                title: "Cut it back to the arriving runner",
                duration: 2300,
                caption: "Low cutback to the top of the box for the depth runner.",
                moves: {},
                ballPath: [point(86, fY), point(90, 34)],
                active: [wide, target],
                actions: [{ type: "pass", label: "CUTBACK", path: [point(86, fY), point(90, 34)] }],
                zones: [{ type: "circle", cx: 90, cy: 34, radius: 8, tone: "press", label: "CUTBACK ZONE" }]
            }
        ];
        return { initial: initial, ball: ballStart, steps: steps };
    }

    function pressSequence(ourSlots, oppSlots, flank, scenario) {
        var initial = {};
        // Press shape: our team steps up; opponent builds from their keeper.
        ourSlots.forEach(function (s) {
            initial[s.id] = point(clamp(s.pos.xMeters + 10, 8, 78), s.pos.yMeters);
        });
        oppSlots.forEach(function (s) { initial[s.id] = s.pos; });
        var oppGk = oppSlots[0].id;
        var fY = flankY(flank);
        var lead = ourSlots[ourSlots.length - 1].id;
        var support = ourSlots[ourSlots.length - 2] ? ourSlots[ourSlots.length - 2].id : lead;
        var pressLine = scenario.pressLine;
        var ballStart = point(81, 43);
        var steps = [
            {
                id: "press-set", label: "1 · Set", phase: "PRESSING",
                title: "Set the block", duration: 1700,
                caption: "Screen the pivot and invite the pass back.",
                moves: {}, ballPath: [ballStart],
                active: [lead, support],
                zones: [{ type: "band", x: 61, y: 22, width: 7, height: 24, tone: "neutral", label: "FRONT LINE" }]
            },
            {
                id: "press-trigger", label: "2 · Trigger", phase: "PRESS TRIGGER",
                title: "Trigger on the pass back", duration: 2000,
                caption: "The back pass to the keeper starts the press.",
                moves: {}, ballPath: [ballStart, point(95, 34)],
                active: [oppGk, lead],
                actions: [{ type: "pass", label: "BACK PASS", path: [ballStart, point(95, 34)] }],
                trigger: { cx: 95, cy: 34, radius: 7, label: "PRESS TRIGGER" }
            },
            {
                id: "press-force", label: "3 · Force wide", phase: "LOCK OUTSIDE",
                title: "Force play to the touchline", duration: 2400,
                caption: "Curve the press to block the middle and send it wide.",
                moves: {}, ballPath: [point(95, 34), point(84, fY)],
                active: [lead, support],
                pressing: [lead, support],
                actions: [
                    { type: "press", label: "CURVED PRESS", path: [point(67, 34), point(78, fY)] },
                    { type: "pass", label: "FORCED WIDE", path: [point(95, 34), point(84, fY)] }
                ]
            },
            {
                id: "press-recover", label: "4 · Recover", phase: "FALLBACK",
                title: "Drop behind the engagement line", duration: 2500,
                caption: "If the press is broken, recover into a compact block.",
                moves: {}, ballPath: [point(84, fY), point(70, 24)],
                active: [lead, support],
                actions: [{ type: "recovery", label: "RECOVER", path: [point(80, fY), point(66, 30), point(58, 28)] }],
                zones: [{ type: "line", x1: pressLine, y1: 3, x2: pressLine, y2: 65, tone: "press", label: "ENGAGEMENT LINE · " + pressLine + " m" }]
            }
        ];
        return { initial: initial, ball: ballStart, steps: steps };
    }

    function transitionSequence(ourSlots, oppSlots, flank, scenario) {
        var initial = {};
        ourSlots.forEach(function (s) {
            initial[s.id] = point(clamp(s.pos.xMeters + 6, 8, 92), s.pos.yMeters);
        });
        oppSlots.forEach(function (s) { initial[s.id] = s.pos; });
        var fY = flankY(flank);
        var wide = pickId(ourSlots, "f", flank === "right" ? "last" : "first");
        var creator = pickId(ourSlots, "m");
        var commit = scenario.commit;
        var ballStart = point(80, 49);
        var steps = [
            {
                id: "transition-before", label: "1 · Rest defence", phase: "BEFORE LOSS",
                title: "Keep a rest defence behind the attack", duration: 1800,
                caption: "Stay balanced so a loss does not become a counter.",
                moves: {}, ballPath: [ballStart],
                active: [ourSlots[1] ? ourSlots[1].id : creator],
                zones: [{ type: "band", x: 30, y: 6, width: 14, height: 56, tone: "protect", label: "REST DEFENCE" }]
            },
            {
                id: "transition-press", label: "2 · Counterpress", phase: "ON LOSS",
                title: commit + " press the ball immediately", duration: 4200,
                caption: "The nearest players swarm the ball; the rest protect the centre.",
                moves: {}, ballPath: [ballStart, point(85, 45)],
                active: [wide, creator],
                pressing: [wide, creator],
                actions: [
                    { type: "press", label: "P1", path: [point(88, fY), point(85, 45)] },
                    { type: "press", label: "P2", path: [point(70, 34), point(82, 44)] }
                ],
                zones: [{ type: "circle", cx: 85, cy: 45, radius: 11, tone: "press", label: commit + " PRESS" }],
                countdown: true
            },
            {
                id: "transition-release", label: "3 · Release", phase: "REGAIN",
                title: "Release into the " + (flank === "right" ? "right" : "left") + " channel",
                duration: 2300,
                caption: "Win it and attack the channel before they reset.",
                moves: markMove(wide, point(94, fY)),
                ballPath: [point(85, 45), point(94, fY)],
                active: [creator, wide],
                actions: [
                    { type: "pass", label: "RELEASE", path: [point(85, 45), point(94, fY)] },
                    { type: "run", label: "CHANNEL RUN", path: [point(86, fY), point(94, fY)] }
                ]
            }
        ];
        return { initial: initial, ball: ballStart, steps: steps };
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
