(function (root, factory) {
    var api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    if (root) root.WorldsCoachRating = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    var MAX_RANK = 585;
    var ANCHORS = [
        { rank: 1, rating: 95.50 },
        { rank: 100, rating: 84.00 },
        { rank: 300, rating: 72.00 },
        { rank: MAX_RANK, rating: 60.00 }
    ];

    function interpolate(rank, left, right) {
        var progress = (rank - left.rank) / (right.rank - left.rank);
        return left.rating + progress * (right.rating - left.rating);
    }

    function fromRank(rank) {
        if (!Number.isInteger(rank) || rank < 1 || rank > MAX_RANK) return null;
        var segment = rank <= 100 ? [ANCHORS[0], ANCHORS[1]]
            : rank <= 300 ? [ANCHORS[1], ANCHORS[2]]
                : [ANCHORS[2], ANCHORS[3]];
        return Number(interpolate(rank, segment[0], segment[1]).toFixed(2));
    }

    return { MAX_RANK: MAX_RANK, ANCHORS: ANCHORS, fromRank: fromRank };
}));
