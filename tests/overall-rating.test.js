"use strict";

var assert = require("node:assert/strict");
var test = require("node:test");
var rating = require("../assets/js/overall-rating.js");
var matchupData = require("../assets/matchups.json");

test("overall scale preserves all 585 ranks with distinct two-decimal ratings", function () {
    var values = Array.from({ length: rating.MAX_RANK }, function (_, index) {
        return rating.fromRank(index + 1);
    });

    assert.equal(values[0], 95.5);
    assert.equal(values[99], 84);
    assert.equal(values[299], 72);
    assert.equal(values[584], 60);
    assert.equal(new Set(values).size, rating.MAX_RANK);
    values.slice(1).forEach(function (value, index) {
        assert.ok(values[index] > value, "rank " + (index + 1) + " must outrate rank " + (index + 2));
    });
});

test("matchup data publishes every unified player on the canonical overall scale", function () {
    var players = matchupData.teams.flatMap(function (team) { return team.players; });
    assert.equal(players.length, rating.MAX_RANK);
    assert.equal(new Set(players.map(function (player) { return player.global_rank; })).size, rating.MAX_RANK);
    players.forEach(function (player) {
        assert.equal(player.rating, rating.fromRank(player.global_rank), player.name);
    });
});
