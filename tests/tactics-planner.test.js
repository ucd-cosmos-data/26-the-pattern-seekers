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

function assertSequence(sequence, phase, context) {
    var positions = {};
    Object.keys(sequence.initial).forEach(function (id) {
        positions[id] = sequence.initial[id];
        assertOnPitch(positions[id], context + " " + phase + " initial " + id);
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
                var recommendationCopy = plan.scenarioText.plan + " " + plan.scenarioText.why;
                assert.ok(
                    Object.values(plan.roster).some(function (player) {
                        return player.isOurs && recommendationCopy.indexOf(player.name) !== -1;
                    }),
                    context + " keeps its recommended focal player in the rendered XI"
                );

                assertSequence(plan.attack, "attack", context);
                assertSequence(plan.press, "press", context);
                assertSequence(plan.transition, "transition", context);
                directionalCopy.push(plan.scenarioText.plan + "\n" + plan.scenarioText.why);
            });

            assert.notEqual(
                directionalCopy[0],
                directionalCopy[1],
                fixture.code + " " + scenario + " changes the recommendation when flipped"
            );
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
    assert.match(england.scenarioText.plan, /Luke Shaw/);
    assert.match(england.scenarioText.why, /on the left/);
    assert.doesNotMatch(england.scenarioText.plan, /Harry Kane/);
    assert.doesNotMatch(england.scenarioText.why, /on the right/);

    var netherlands = planner.generate({
        teams: teams,
        squads: squads,
        names: names,
        ourCode: "NED",
        oppCode: "USA",
        scenario: "prematch"
    });
    assert.match(netherlands.scenarioText.why, /Denzel Dumfries/);

    var croatia = planner.generate({
        teams: teams,
        squads: squads,
        names: names,
        ourCode: "CRO",
        oppCode: "JPN",
        scenario: "prematch"
    });
    assert.match(croatia.scenarioText.plan, /Ivan Perišić/);
    assert.doesNotMatch(croatia.scenarioText.plan, /Borna Sosa/);
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
    assert.match(usa.scenarioText.why, /Netherlands' block/);
    assert.doesNotMatch(usa.scenarioText.why, /Netherlands's/);

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
            return player.isOurs && player.name.indexOf("En-Nesyri") !== -1;
        }),
        "Morocco's recommended target forward is present in the rendered XI"
    );
});
