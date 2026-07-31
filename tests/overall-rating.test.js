"use strict";

var assert = require("node:assert/strict");
var test = require("node:test");
var rating = require("../assets/js/overall-rating.js");
var matchupData = require("../assets/matchups.json");
var playerIndex = require("../assets/player-index.json");

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

test("outfield v4 cards and goalkeeper v5 profiles share one percentile-bridged scale", function () {
    var players = matchupData.teams.flatMap(function (team) { return team.players; });
    var rankedProfiles = Object.values(playerIndex).filter(function (player) {
        return Number.isInteger(player.overallRank);
    });

    assert.equal(players.length, 553);
    assert.equal(rankedProfiles.length, rating.MAX_RANK);
    assert.deepEqual(
        rankedProfiles.map(function (player) { return player.overallRank; }).sort(function (a, b) { return a - b; }),
        Array.from({ length: rating.MAX_RANK }, function (_, index) { return index + 1; })
    );
    rankedProfiles.forEach(function (player) {
        assert.equal(player.rating, rating.fromRank(player.overallRank), player.name);
    });
    players.forEach(function (player) {
        assert.equal(player.rating, rating.fromRank(player.overall_rank), player.name);
        assert.equal(playerIndex[player.id].overallRank, player.overall_rank, player.name);
    });
});
