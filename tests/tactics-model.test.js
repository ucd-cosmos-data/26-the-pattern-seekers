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
