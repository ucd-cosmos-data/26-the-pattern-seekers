"use strict";

var assert = require("node:assert/strict");
var test = require("node:test");
var planner = require("../assets/js/tactics-planner.js");
var matchupData = require("../assets/matchups.json");
var playerIndex = require("../assets/player-index.json");
var squads = require("../assets/squads.json");

var teams = {};
matchupData.teams.forEach(function (team) {
    teams[team.code] = team;
});

var names = {};
Object.keys(playerIndex).forEach(function (id) {
    names[id] = playerIndex[id].name;
});

function distance(a, b) {
    return Math.hypot(a.xMeters - b.xMeters, a.yMeters - b.yMeters);
}

function assertOnPitch(point, context) {
    assert.ok(point.xMeters >= 0 && point.xMeters <= 105, context + " x coordinate");
    assert.ok(point.yMeters >= 0 && point.yMeters <= 68, context + " y coordinate");
}

function assertMarkerFullyVisible(point, context) {
    assert.ok(point.xMeters >= 3.4 && point.xMeters <= 101.6, context + " x marker inset");
    assert.ok(point.yMeters >= 3.4 && point.yMeters <= 64.6, context + " y marker inset");
}

function assertPlayerSpacing(positions, context) {
    var ids = Object.keys(positions);
    for (var i = 0; i < ids.length; i += 1) {
        for (var j = i + 1; j < ids.length; j += 1) {
            assert.ok(
                distance(positions[ids[i]], positions[ids[j]]) >= 4.9,
                context + " keeps " + ids[i] + " and " + ids[j] + " visually separate"
            );
        }
    }
}

function movementFingerprint(sequence) {
    return JSON.stringify({
        initial: sequence.initial,
        ball: sequence.ball,
        steps: sequence.steps.map(function (step) {
            return {
                duration: step.duration,
                ballPath: step.ballPath,
                moves: step.moves,
                active: step.active,
                avoidance: step.avoidance,
                actions: (step.actions || []).map(function (action) {
                    return { type: action.type, path: action.path };
                }),
                zones: (step.zones || []).map(function (zone) {
                    return {
                        type: zone.type,
                        x: zone.x,
                        y: zone.y,
                        width: zone.width,
                        height: zone.height,
                        cx: zone.cx,
                        cy: zone.cy,
                        radius: zone.radius,
                        x1: zone.x1,
                        y1: zone.y1,
                        x2: zone.x2,
                        y2: zone.y2,
                        points: zone.points
                    };
                })
            };
        })
    });
}

function normalizedPlayerName(name) {
    return String(name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function playerNameMatches(rosterName, focalName) {
    var rosterTokens = normalizedPlayerName(rosterName).split(/\s+/).filter(Boolean);
    var focalTokens = normalizedPlayerName(focalName).split(/\s+/).filter(Boolean);
    return focalTokens.length > 0 && focalTokens.every(function (token) {
        return rosterTokens.indexOf(token) !== -1;
    });
}

function assertSequence(sequence, phase, context) {
    var positions = {};
    Object.keys(sequence.initial).forEach(function (id) {
        positions[id] = sequence.initial[id];
        assertOnPitch(positions[id], context + " " + phase + " initial " + id);
        assertMarkerFullyVisible(positions[id], context + " " + phase + " initial " + id);
    });
    assert.equal(Object.keys(positions).length, 22, context + " " + phase + " renders both XIs");
    assertPlayerSpacing(positions, context + " " + phase + " initial");
    assertOnPitch(sequence.ball, context + " " + phase + " initial ball");
    assert.ok(
        Object.values(positions).some(function (point) {
            return distance(point, sequence.ball) < 0.001;
        }),
        context + " " + phase + " starts with the ball on a player"
    );

    var movers = {};
    var previousBall = sequence.ball;
    sequence.steps.forEach(function (step) {
        assert.ok(step.duration > 0, context + " " + phase + " positive step duration");
        assert.ok(step.ballPath && step.ballPath.length, context + " " + phase + " has a ball path");
        assert.ok(
            distance(step.ballPath[0], previousBall) < 0.001,
            context + " " + phase + " ball path stays continuous"
        );
        Object.keys(step.moves || {}).forEach(function (id) {
            movers[id] = true;
            positions[id] = step.moves[id];
            assertOnPitch(positions[id], context + " " + phase + " move " + id);
            assertMarkerFullyVisible(positions[id], context + " " + phase + " move " + id);
        });
        assertPlayerSpacing(positions, context + " " + phase + " " + step.title);
        step.ballPath.forEach(function (point) {
            assertOnPitch(point, context + " " + phase + " ball path");
        });
        previousBall = step.ballPath[step.ballPath.length - 1];
        assert.ok(
            Object.values(positions).some(function (point) {
                return distance(point, previousBall) < 0.001;
            }),
            context + " " + phase + " ends every step with the ball on a player"
        );
    });

    var minimumMovers = { attack: 8, press: 7, transition: 7 }[phase];
    assert.ok(
        Object.keys(movers).length >= minimumMovers,
        context + " " + phase + " moves enough players to read as coordinated"
    );
}

test("every knockout fixture generates complete plans from both points of view", function () {
    assert.equal(planner.KNOCKOUTS.length, 15);
    assert.equal(Object.keys(planner.MATCHUP_PLANS).length, 30);
    var prematchFingerprints = {
        attack: new Set(),
        press: new Set(),
        transition: new Set()
    };

    planner.KNOCKOUTS.forEach(function (fixture) {
        var directions = [
            [fixture.teamA, fixture.teamB],
            [fixture.teamB, fixture.teamA]
        ];

        planner.SCENARIOS.forEach(function (scenario) {
            var directionalCopy = [];
            directions.forEach(function (pair) {
                var ourCode = pair[0];
                var oppCode = pair[1];
                var context = fixture.code + " " + ourCode + " POV " + scenario;
                var plan = planner.generate({
                    teams: teams,
                    squads: squads,
                    names: names,
                    ourCode: ourCode,
                    oppCode: oppCode,
                    scenario: scenario
                });

                assert.equal(plan.meta.ourCode, ourCode, context + " keeps the selected POV");
                assert.equal(plan.meta.oppCode, oppCode, context + " keeps the selected opponent");
                assert.equal(plan.meta.tailored, true, context + " uses a directed matchup brief");
                assert.ok(plan.meta.attackIntent, context + " has an attack intent");
                assert.ok(plan.meta.pressIntent, context + " has a press intent");
                assert.ok(plan.meta.transitionIntent, context + " has a transition intent");
                assert.equal(Object.keys(plan.roster).length, 22, context + " has 22 players");
                assert.equal(
                    Object.values(plan.roster).filter(function (player) {
                        return player.isOurs;
                    }).length,
                    11,
                    context + " has our XI"
                );
                assert.equal(
                    Object.values(plan.roster).filter(function (player) {
                        return !player.isOurs;
                    }).length,
                    11,
                    context + " has the opponent XI"
                );
                assert.equal(
                    Object.values(plan.roster).filter(function (player) {
                        return player.isPlaceholder;
                    }).length,
                    0,
                    context + " uses real squad players"
                );
                assert.doesNotMatch(
                    plan.scenarioText.plan + " " + plan.scenarioText.why,
                    /undefined|null|unrated squad/i,
                    context + " has usable recommendation copy"
                );
                assert.ok(plan.scenarioText.focalPlayer, context + " exposes its focal player");
                assert.ok(
                    Object.values(plan.roster).some(function (player) {
                        return player.isOurs &&
                            playerNameMatches(player.name, plan.scenarioText.focalPlayer);
                    }),
                    context + " keeps its recommended focal player in the rendered XI"
                );

                assertSequence(plan.attack, "attack", context);
                assertSequence(plan.press, "press", context);
                assertSequence(plan.transition, "transition", context);
                if (scenario === "prematch") {
                    var directedSpec = planner.MATCHUP_PLANS[ourCode + "|" + oppCode];
                    ["attack", "press", "transition"].forEach(function (phase) {
                        assert.deepEqual(
                            plan[phase].steps.map(function (step) { return step.title; }),
                            directedSpec[phase].stepTitles,
                            context + " authors every " + phase + " step title"
                        );
                        assert.deepEqual(
                            plan[phase].steps.map(function (step) { return step.caption; }),
                            directedSpec[phase].stepCaptions,
                            context + " authors every " + phase + " step caption"
                        );
                    });
                    prematchFingerprints.attack.add(movementFingerprint(plan.attack));
                    prematchFingerprints.press.add(movementFingerprint(plan.press));
                    prematchFingerprints.transition.add(movementFingerprint(plan.transition));
                }
                directionalCopy.push(plan.scenarioText.plan + "\n" + plan.scenarioText.why);
            });

            assert.notEqual(
                directionalCopy[0],
                directionalCopy[1],
                fixture.code + " " + scenario + " changes the recommendation when flipped"
            );
        });
    });

    assert.equal(prematchFingerprints.attack.size, 30, "all 30 prematch attack animations are distinct");
    assert.equal(prematchFingerprints.press.size, 30, "all 30 prematch press animations are distinct");
    assert.equal(
        prematchFingerprints.transition.size,
        30,
        "all 30 prematch transition animations are distinct"
    );
});

test("directed matchup briefs satisfy the animation contract", function () {
    var attackStyles = ["wing", "central", "direct", "counter", "wingback", "buildup"];
    var pressStyles = ["high", "mid", "low"];
    var transitionStyles = ["swarm", "counter", "secure"];
    var intents = new Set();
    var titles = new Set();
    var captions = new Set();
    var recommendationPlans = new Set();
    var recommendationReasons = new Set();

    Object.keys(planner.MATCHUP_PLANS).forEach(function (key) {
        var plan = planner.MATCHUP_PLANS[key];
        assert.match(key, /^[A-Z]{3}\|[A-Z]{3}$/, key + " uses a directed key");
        assert.ok(plan.recommendation.player, key + " names a focal player");
        assert.ok(plan.recommendation.plan, key + " has recommendation copy");
        assert.ok(plan.recommendation.why, key + " explains the recommendation");
        assert.ok(
            !recommendationPlans.has(plan.recommendation.plan),
            key + " recommendation is unique"
        );
        assert.ok(
            !recommendationReasons.has(plan.recommendation.why),
            key + " recommendation rationale is unique"
        );
        recommendationPlans.add(plan.recommendation.plan);
        recommendationReasons.add(plan.recommendation.why);

        ["attack", "press", "transition"].forEach(function (phase) {
            var spec = plan[phase];
            var styles = phase === "attack"
                ? attackStyles
                : (phase === "press" ? pressStyles : transitionStyles);
            assert.ok(styles.includes(spec.style), key + " " + phase + " uses a supported style");
            assert.ok(["left", "right"].includes(spec.flank), key + " " + phase + " names a flank");
            assert.ok(spec.tempo >= 0.9 && spec.tempo <= 1.12, key + " " + phase + " tempo");
            assert.ok(spec.widthScale >= 0.94 && spec.widthScale <= 1.08, key + " " + phase + " width");
            assert.ok(spec.depthShift >= -3 && spec.depthShift <= 3, key + " " + phase + " depth");
            assert.ok(spec.laneShift >= -4 && spec.laneShift <= 4, key + " " + phase + " lane");
            assert.ok(spec.stagger >= -1.5 && spec.stagger <= 1.5, key + " " + phase + " stagger");
            var expectedSteps = phase === "transition" ? 3 : 4;
            assert.equal(
                spec.stepTitles.length,
                expectedSteps,
                key + " " + phase + " titles cover every runtime step"
            );
            assert.equal(
                spec.stepCaptions.length,
                expectedSteps,
                key + " " + phase + " captions cover every runtime step"
            );
            spec.stepTitles.forEach(function (title) {
                assert.ok(!titles.has(title), key + " " + phase + " title is unique: " + title);
                titles.add(title);
            });
            spec.stepCaptions.forEach(function (caption) {
                assert.ok(!captions.has(caption), key + " " + phase + " caption is unique");
                captions.add(caption);
            });
            assert.ok(!intents.has(spec.intent), key + " " + phase + " intent is unique");
            intents.add(spec.intent);
        });
    });
});

test("recommendations choose a player who fits the generated attacking pattern", function () {
    var england = planner.generate({
        teams: teams,
        squads: squads,
        names: names,
        ourCode: "ENG",
        oppCode: "SEN",
        scenario: "prematch"
    });
    assert.equal(england.scenarioText.focalPlayer, "Jude Bellingham");
    assert.match(england.scenarioText.plan, /Bellingham/);
    assert.match(england.scenarioText.plan, /Gueye|Diallo|Jakobs/);
    assert.match(england.scenarioText.plan, /Saka/);

    var netherlands = planner.generate({
        teams: teams,
        squads: squads,
        names: names,
        ourCode: "NED",
        oppCode: "USA",
        scenario: "prematch"
    });
    assert.equal(netherlands.scenarioText.focalPlayer, "Denzel Dumfries");
    assert.match(netherlands.scenarioText.plan, /Dumfries/);

    var croatia = planner.generate({
        teams: teams,
        squads: squads,
        names: names,
        ourCode: "CRO",
        oppCode: "JPN",
        scenario: "prematch"
    });
    assert.equal(croatia.scenarioText.focalPlayer, "Luka Modrić");
    assert.match(croatia.scenarioText.plan, /Modrić/);
    assert.match(croatia.scenarioText.plan, /Perišić/);
    assert.ok(
        Object.values(croatia.roster).some(function (player) {
            return player.isOurs && player.name === "Luka Modrić";
        }),
        "Croatia's midfield keeps Luka Modrić in the rendered XI"
    );

    var usa = planner.generate({
        teams: teams,
        squads: squads,
        names: names,
        ourCode: "USA",
        oppCode: "NED",
        scenario: "prematch"
    });
    assert.equal(usa.scenarioText.focalPlayer, "Christian Pulisic");
    assert.match(usa.scenarioText.plan, /Pulisic/);
    assert.match(usa.scenarioText.plan, /Dumfries|Timber/);

    var morocco = planner.generate({
        teams: teams,
        squads: squads,
        names: names,
        ourCode: "MAR",
        oppCode: "ESP",
        scenario: "prematch"
    });
    assert.ok(
        Object.values(morocco.roster).some(function (player) {
            return player.isOurs && player.name === "Hakim Ziyech";
        }),
        "Morocco's recommended wide creator is present in the rendered XI"
    );
});
