"use strict";

var assert = require("node:assert/strict");
var test = require("node:test");
var planner = require("../assets/js/tactics-planner.js");
var model = require("../assets/js/tactics-model.js");
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

function copyPositions(positions) {
    var copy = {};
    Object.keys(positions).forEach(function (id) {
        copy[id] = {
            xMeters: positions[id].xMeters,
            yMeters: positions[id].yMeters
        };
    });
    return copy;
}

function positionsAtProgress(startPositions, endPositions, step, progress) {
    var rawFrame = {};
    Object.keys(startPositions).forEach(function (id) {
        rawFrame[id] = model.ownerPositionAtStepProgress({
            startPosition: startPositions[id],
            endPosition: endPositions[id],
            path: step.ballPath,
            owners: step.ballOwners,
            segmentTypes: step.ballSegmentTypes,
            playerId: id,
            progress: progress
        });
    });
    return model.resolveFrameOverlaps(rawFrame, {
        priorities: model.ballOwnerPrioritiesAtStepProgress(
            step.ballPath,
            step.ballOwners,
            progress,
            step.ballSegmentTypes
        ),
        startPositions: startPositions,
        endPositions: endPositions,
        sameTeamMinimum: 3,
        opponentMinimum: 2,
        maximumDisplacement: 1.8,
        inset: 3.5
    });
}

function assertRuntimeSpacing(positions, context) {
    var ids = Object.keys(positions);
    for (var firstIndex = 0; firstIndex < ids.length; firstIndex += 1) {
        for (var secondIndex = firstIndex + 1;
                secondIndex < ids.length;
                secondIndex += 1) {
            var idA = ids[firstIndex];
            var idB = ids[secondIndex];
            var minimum = idA.slice(0, 3) === idB.slice(0, 3) ? 1.4 : 0.65;
            assert.ok(
                distance(positions[idA], positions[idB]) >= minimum,
                context + " keeps " + idA + " clear of " + idB
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
                ballOwners: step.ballOwners,
                ballSegmentTypes: step.ballSegmentTypes,
                moves: step.moves,
                active: step.active,
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
    assertRuntimeSpacing(positions, context + " " + phase + " initial");
    assertOnPitch(sequence.ball, context + " " + phase + " initial ball");

    var previousBall = sequence.ball;
    var previousOwner = null;
    sequence.steps.forEach(function (step) {
        var stepContext = context + " " + phase + " " + step.id;
        var startPositions = copyPositions(positions);
        var endPositions = copyPositions(positions);

        assert.ok(step.duration > 0, context + " " + phase + " positive step duration");
        assert.ok(step.duration <= 5500, stepContext + " remains readable");
        assert.ok(step.ballPath && step.ballPath.length, context + " " + phase + " has a ball path");
        assert.equal(
            step.ballOwners.length,
            step.ballPath.length,
            stepContext + " names every touch or explicit pass bend"
        );
        assert.equal(
            step.ballSegmentTypes.length,
            step.ballPath.length - 1,
            stepContext + " names every ball movement"
        );
        assert.ok(step.ballOwners[0], stepContext + " names the starting owner");
        assert.ok(
            step.ballOwners[step.ballOwners.length - 1],
            stepContext + " names the final owner"
        );
        assert.ok(
            distance(step.ballPath[0], previousBall) < 0.001,
            context + " " + phase + " ball path stays continuous"
        );
        assert.ok(
            startPositions[step.ballOwners[0]],
            stepContext + " starting owner exists"
        );
        assert.ok(
            distance(
                step.ballPath[0],
                startPositions[step.ballOwners[0]]
            ) < 0.001,
            stepContext + " starts on its named owner"
        );
        if (previousOwner) {
            assert.equal(
                step.ballOwners[0],
                previousOwner,
                stepContext + " preserves ownership between steps"
            );
        }

        assert.equal(
            step.avoidance,
            undefined,
            stepContext + " has no synthetic collision arc"
        );
        Object.keys(step.moves || {}).forEach(function (id) {
            assert.ok(startPositions[id], stepContext + " moves a present player " + id);
            endPositions[id] = step.moves[id];
            assertOnPitch(endPositions[id], context + " " + phase + " move " + id);
            assertMarkerFullyVisible(endPositions[id], context + " " + phase + " move " + id);
        });
        step.ballPath.forEach(function (point, waypointIndex) {
            assertOnPitch(point, context + " " + phase + " ball path");
            var ownerId = step.ballOwners[waypointIndex];
            if (ownerId === null) {
                assert.ok(
                    waypointIndex > 0 && waypointIndex < step.ballPath.length - 1,
                    stepContext + " only uses ownerless waypoints as pass bends"
                );
                return;
            }
            assert.ok(startPositions[ownerId], stepContext + " owner " + ownerId + " exists");
            var touchProgress = model.touchProgressAtWaypoint(
                step.ballPath,
                waypointIndex,
                step.ballOwners,
                step.ballSegmentTypes
            );
            var frameAtTouch = positionsAtProgress(
                startPositions,
                endPositions,
                step,
                touchProgress
            );
            var ownerAtTouch = frameAtTouch[ownerId];
            assert.ok(
                distance(ownerAtTouch, point) < 0.001,
                stepContext + " waypoint " + waypointIndex + " reaches named owner " + ownerId
            );
        });
        step.ballSegmentTypes.forEach(function (segmentType, segmentIndex) {
            var fromOwner = step.ballOwners[segmentIndex];
            var toOwner = step.ballOwners[segmentIndex + 1];
            var scanIndex;
            if (!fromOwner) {
                for (scanIndex = segmentIndex - 1; scanIndex >= 0; scanIndex -= 1) {
                    if (step.ballOwners[scanIndex]) {
                        fromOwner = step.ballOwners[scanIndex];
                        break;
                    }
                }
            }
            if (!toOwner) {
                for (scanIndex = segmentIndex + 2;
                        scanIndex < step.ballOwners.length;
                        scanIndex += 1) {
                    if (step.ballOwners[scanIndex]) {
                        toOwner = step.ballOwners[scanIndex];
                        break;
                    }
                }
            }
            var sameOwner = fromOwner === toOwner;
            var sameTeam = fromOwner.slice(0, 3) === toOwner.slice(0, 3);
            if (segmentType === "carry") assert.ok(sameOwner, stepContext + " carry keeps one owner");
            if (segmentType === "pass") {
                assert.ok(!sameOwner && sameTeam, stepContext + " pass changes same-team owner");
            }
            if (segmentType === "recovery") {
                assert.ok(
                    fromOwner.slice(0, 3) === "op_" &&
                        toOwner.slice(0, 3) === "us_",
                    stepContext + " recovery changes opponent to us"
                );
            }
            if (segmentType === "loss") {
                assert.ok(
                    fromOwner.slice(0, 3) === "us_" &&
                        toOwner.slice(0, 3) === "op_",
                    stepContext + " loss changes us to opponent"
                );
            }
        });

        var previousFrame = positionsAtProgress(
            startPositions,
            endPositions,
            step,
            0
        );
        for (var sampleIndex = 1; sampleIndex <= 40; sampleIndex += 1) {
            var progress = sampleIndex / 40;
            var frame = positionsAtProgress(
                startPositions,
                endPositions,
                step,
                progress
            );
            assertRuntimeSpacing(frame, stepContext + " sample " + sampleIndex);
            var seconds = step.duration / 1000 / 40;
            Object.keys(frame).forEach(function (id) {
                assertOnPitch(frame[id], stepContext + " sampled " + id);
                var sampledSpeed = distance(frame[id], previousFrame[id]) / seconds;
                assert.ok(
                    sampledSpeed <= 11.5,
                    stepContext + " keeps " + id +
                        " below sprint speed (sampled " +
                        sampledSpeed.toFixed(2) + "m/s)"
                );
            });

            var ballProgress = model.ballProgressAtStepProgress(progress);
            var ball = model.interpolateOwnedPath(
                step.ballPath,
                step.ballOwners,
                ballProgress,
                step.ballSegmentTypes
            );
            for (var segmentIndex = 0;
                    segmentIndex < step.ballOwners.length - 1;
                    segmentIndex += 1) {
                var carrierId = step.ballOwners[segmentIndex];
                if (step.ballSegmentTypes[segmentIndex] !== "carry") {
                    continue;
                }
                var segmentStart = model.ownedPathWaypointProgress(
                    step.ballPath,
                    step.ballOwners,
                    segmentIndex,
                    step.ballSegmentTypes
                );
                var segmentEnd = model.ownedPathWaypointProgress(
                    step.ballPath,
                    step.ballOwners,
                    segmentIndex + 1,
                    step.ballSegmentTypes
                );
                if (ballProgress + 0.0001 < segmentStart ||
                        ballProgress - 0.0001 > segmentEnd) {
                    continue;
                }
                assert.ok(
                    distance(frame[carrierId], ball) < 0.001,
                    stepContext + " keeps carrier " + carrierId + " attached to the ball"
                );
            }
            previousFrame = frame;
        }

        var ballActions = (step.actions || []).filter(function (action) {
            return action.type === "pass" ||
                action.type === "carry" ||
                action.type === "recovery" ||
                action.type === "loss";
        });
        if (ballActions.length === step.ballPath.length - 1) {
            ballActions.forEach(function (action, actionIndex) {
                assert.equal(
                    action.type,
                    step.ballSegmentTypes[actionIndex],
                    stepContext + " labels the ball segment honestly"
                );
                assert.deepEqual(
                    action.path,
                    [step.ballPath[actionIndex], step.ballPath[actionIndex + 1]],
                    stepContext + " keeps " + action.type + " annotation on the ball route"
                );
            });
        } else if (ballActions.length === 1) {
            assert.ok(
                step.ballSegmentTypes.every(function (segmentType) {
                    return segmentType === ballActions[0].type;
                }),
                stepContext + " full-path action matches every segment"
            );
            assert.deepEqual(
                ballActions[0].path,
                step.ballPath,
                stepContext + " keeps the action annotation on the full ball route"
            );
        }

        positions = endPositions;
        previousBall = step.ballPath[step.ballPath.length - 1];
        previousOwner = step.ballOwners[step.ballOwners.length - 1];
        assert.ok(
            distance(positions[previousOwner], previousBall) < 0.001,
            stepContext + " ends on its named owner"
        );
    });
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

test("turnovers and back-three passes keep honest ownership semantics", function () {
    function planFor(ourCode, oppCode) {
        return planner.generate({
            teams: teams,
            squads: squads,
            names: names,
            ourCode: ourCode,
            oppCode: oppCode,
            scenario: "prematch"
        });
    }

    var usa = planFor("USA", "NED");
    var backThreePass = usa.press.steps.find(function (step) {
        return step.id === "hp-trigger";
    });
    assert.deepEqual(backThreePass.ballSegmentTypes, ["pass"]);
    assert.notEqual(
        backThreePass.ballOwners[0],
        backThreePass.ballOwners[1],
        "the centre-back and back-three wide outlet are distinct players"
    );

    var argentina = planFor("ARG", "AUS");
    var highRegain = argentina.press.steps.find(function (step) {
        return step.id === "hp-win";
    });
    var counterpressLoss = argentina.transition.steps.find(function (step) {
        return step.id === "sw-swarm";
    });
    assert.deepEqual(highRegain.ballSegmentTypes, ["recovery", "pass"]);
    assert.deepEqual(
        highRegain.actions
            .filter(function (action) {
                return ["recovery", "pass", "carry", "loss"].includes(action.type);
            })
            .map(function (action) { return action.type; }),
        ["recovery", "pass"]
    );
    assert.deepEqual(counterpressLoss.ballSegmentTypes, ["loss"]);
    assert.ok(
        counterpressLoss.actions.some(function (action) {
            return action.type === "loss" && action.label === "TURNOVER";
        }),
        "the possession loss is shown as a turnover, not a pass"
    );

    var netherlands = planFor("NED", "USA");
    var midBlockRegain = netherlands.press.steps.find(function (step) {
        return step.id === "mb-spring";
    });
    assert.deepEqual(midBlockRegain.ballSegmentTypes, ["recovery", "pass"]);
});
