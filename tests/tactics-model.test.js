"use strict";

var assert = require("node:assert/strict");
var test = require("node:test");
var model = require("../assets/js/tactics-model.js");

test("pitch coordinate conversion is reversible", function () {
    var point = { xMeters: 52.5, yMeters: 17 };
    var percent = model.pointToPercent(point);
    var restored = model.percentToPoint(percent);

    assert.equal(percent.x, 50);
    assert.equal(percent.y, 25);
    assert.equal(restored.xMeters, point.xMeters);
    assert.equal(restored.yMeters, point.yMeters);
});

test("vertical mirroring preserves pitch distance", function () {
    var pointA = { xMeters: 28, yMeters: 12 };
    var pointB = model.mirrorPointVertically(pointA);

    assert.deepEqual(pointB, { xMeters: 28, yMeters: 56 });
});

test("width, depth, line height, and weak-side gap use rendered coordinates", function () {
    var positions = {
        defenderA: { xMeters: 24, yMeters: 10 },
        defenderB: { xMeters: 30, yMeters: 30 },
        defenderC: { xMeters: 36, yMeters: 50 },
        attacker: { xMeters: 84, yMeters: 58 }
    };
    var metrics = model.computeMetrics(positions, {
        selectedIds: ["defenderA", "defenderB", "defenderC", "attacker"],
        defensiveIds: ["defenderA", "defenderB", "defenderC"],
        weakSideIds: ["attacker"],
        strongSide: "right"
    });

    assert.equal(metrics.attackingWidth, 48);
    assert.equal(metrics.teamDepth, 60);
    assert.equal(metrics.lineHeight, 30);
    assert.equal(metrics.weakSideGap, 58);
});

test("mirroring does not change width or depth magnitude", function () {
    var positions = {
        one: { xMeters: 20, yMeters: 7 },
        two: { xMeters: 62, yMeters: 33 },
        three: { xMeters: 80, yMeters: 61 }
    };
    var settings = {
        selectedIds: ["one", "two", "three"],
        defensiveIds: ["one"],
        strongSide: "right"
    };
    var original = model.computeMetrics(positions, settings);
    var mirrored = model.computeMetrics(model.mirrorPositionsVertically(positions), settings);

    assert.equal(original.attackingWidth, mirrored.attackingWidth);
    assert.equal(original.teamDepth, mirrored.teamDepth);
});

test("path interpolation follows the active tactical action", function () {
    var point = model.interpolatePath([
        { xMeters: 10, yMeters: 10 },
        { xMeters: 30, yMeters: 10 },
        { xMeters: 30, yMeters: 30 }
    ], 0.75);

    assert.deepEqual(point, { xMeters: 30, yMeters: 20 });
});

test("path waypoint progress identifies the moment a pass reaches its receiver", function () {
    var path = [
        { xMeters: 8, yMeters: 34 },
        { xMeters: 25, yMeters: 56 },
        { xMeters: 29, yMeters: 57 },
        { xMeters: 35, yMeters: 56 }
    ];
    var receptionProgress = model.pathWaypointProgress(path, 1);

    assert.ok(receptionProgress > 0.7 && receptionProgress < 0.8);
    assert.deepEqual(
        model.interpolatePath(path, receptionProgress),
        { xMeters: 25, yMeters: 56 }
    );
    assert.deepEqual(
        model.carrierPositionAtProgress({ xMeters: 25, yMeters: 56 }, path, 1, 0.5),
        { xMeters: 25, yMeters: 56 }
    );
    assert.deepEqual(
        model.carrierPositionAtProgress({ xMeters: 25, yMeters: 56 }, path, 1, 0.9),
        model.interpolatePath(path, 0.9)
    );
});

test("explicit owners arrive for passes and stay attached for carries", function () {
    var path = [
        { xMeters: 20, yMeters: 34 },
        { xMeters: 44, yMeters: 24 },
        { xMeters: 56, yMeters: 24 }
    ];
    var owners = ["passer", "receiver", "receiver"];
    var receiverStart = { xMeters: 38, yMeters: 30 };
    var receiverEnd = path[2];
    var receptionProgress = model.touchProgressAtWaypoint(path, 1, owners);
    var receiverAtReception = model.ownerPositionAtStepProgress({
        startPosition: receiverStart,
        endPosition: receiverEnd,
        path: path,
        owners: owners,
        playerId: "receiver",
        progress: receptionProgress
    });

    assert.deepEqual(receiverAtReception, path[1]);

    var carryProgress = (
        receptionProgress +
        model.touchProgressAtWaypoint(path, 2, owners)
    ) / 2;
    var ball = model.interpolateOwnedPath(
        path,
        owners,
        model.ballProgressAtStepProgress(carryProgress)
    );
    var carrier = model.ownerPositionAtStepProgress({
        startPosition: receiverStart,
        endPosition: receiverEnd,
        path: path,
        owners: owners,
        playerId: "receiver",
        progress: carryProgress
    });

    assert.deepEqual(carrier, ball);
});

test("turnovers have their own timing and owner priority handoff", function () {
    var path = [
        { xMeters: 40, yMeters: 32 },
        { xMeters: 48, yMeters: 34 }
    ];
    var owners = ["op_m1", "us_m1"];

    assert.ok(
        model.ownedSegmentWeight(path, owners, 0, ["recovery"]) >
            model.ownedSegmentWeight(path, owners, 0, ["pass"]),
        "a contested recovery is slower than a clean pass"
    );

    var before = model.ballOwnerPrioritiesAtStepProgress(
        path,
        owners,
        0.21,
        ["recovery"]
    );
    var after = model.ballOwnerPrioritiesAtStepProgress(
        path,
        owners,
        0.85,
        ["recovery"]
    );
    assert.equal(before.op_m1, 1);
    assert.equal(after.us_m1, 1);
});

test("overlap resolution is deterministic and never detaches a pinned owner", function () {
    var positions = {
        us_owner: { xMeters: 50, yMeters: 34 },
        us_support: { xMeters: 50, yMeters: 34 },
        op_marker: { xMeters: 50, yMeters: 34 }
    };
    var options = {
        priorities: { us_owner: 1 },
        sameTeamMinimum: 3,
        opponentMinimum: 2,
        maximumDisplacement: 1.8,
        inset: 3.5
    };
    var resolved = model.resolveFrameOverlaps(positions, options);
    var reversed = model.resolveFrameOverlaps({
        op_marker: positions.op_marker,
        us_support: positions.us_support,
        us_owner: positions.us_owner
    }, options);

    assert.deepEqual(resolved, reversed);
    assert.deepEqual(resolved.us_owner, positions.us_owner);
    assert.ok(model.distance(resolved.us_owner, resolved.us_support) >= 0.7);
    assert.ok(model.distance(resolved.us_owner, resolved.op_marker) >= 0.7);
});

test("sequence coordinates can be validated before rendering", function () {
    assert.equal(model.pointsEqual(
        { xMeters: 35, yMeters: 56 },
        { xMeters: 35.0005, yMeters: 56 }
    ), true);
    assert.equal(model.isPointOnPitch({ xMeters: 105, yMeters: 68 }), true);
    assert.equal(model.isPointOnPitch({ xMeters: 106, yMeters: 34 }), false);
});
