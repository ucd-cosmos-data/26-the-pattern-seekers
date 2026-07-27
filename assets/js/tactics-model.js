(function (root, factory) {
    "use strict";

    var model = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = model;
    } else {
        root.WorldsCoachModel = model;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    var PITCH = Object.freeze({ length: 105, width: 68 });

    function clamp(value, minimum, maximum) {
        return Math.min(maximum, Math.max(minimum, value));
    }

    function roundMetres(value) {
        return Math.round(value);
    }

    function pointToPercent(point) {
        return {
            x: clamp(point.xMeters / PITCH.length * 100, 0, 100),
            y: clamp(point.yMeters / PITCH.width * 100, 0, 100)
        };
    }

    function percentToPoint(point) {
        return {
            xMeters: clamp(point.x / 100 * PITCH.length, 0, PITCH.length),
            yMeters: clamp(point.y / 100 * PITCH.width, 0, PITCH.width)
        };
    }

    function mirrorPointVertically(point) {
        return {
            xMeters: point.xMeters,
            yMeters: PITCH.width - point.yMeters
        };
    }

    function distance(pointA, pointB) {
        var xDifference = pointB.xMeters - pointA.xMeters;
        var yDifference = pointB.yMeters - pointA.yMeters;
        return Math.sqrt(xDifference * xDifference + yDifference * yDifference);
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

    function interpolatePoint(pointA, pointB, progress) {
        var amount = clamp(progress, 0, 1);
        return {
            xMeters: pointA.xMeters + (pointB.xMeters - pointA.xMeters) * amount,
            yMeters: pointA.yMeters + (pointB.yMeters - pointA.yMeters) * amount
        };
    }

    function interpolatePath(path, progress) {
        if (!path || !path.length) return { xMeters: 0, yMeters: 0 };
        if (path.length === 1) return {
            xMeters: path[0].xMeters,
            yMeters: path[0].yMeters
        };

        var amount = clamp(progress, 0, 1);
        var distances = [];
        var totalDistance = 0;
        var index;

        for (index = 1; index < path.length; index += 1) {
            var segmentDistance = distance(path[index - 1], path[index]);
            distances.push(segmentDistance);
            totalDistance += segmentDistance;
        }

        if (!totalDistance) return {
            xMeters: path[path.length - 1].xMeters,
            yMeters: path[path.length - 1].yMeters
        };

        var targetDistance = totalDistance * amount;
        var travelled = 0;

        for (index = 0; index < distances.length; index += 1) {
            if (travelled + distances[index] >= targetDistance) {
                var localProgress = (targetDistance - travelled) / distances[index];
                return interpolatePoint(path[index], path[index + 1], localProgress);
            }
            travelled += distances[index];
        }

        return {
            xMeters: path[path.length - 1].xMeters,
            yMeters: path[path.length - 1].yMeters
        };
    }

    function computeMetrics(positions, options) {
        var settings = options || {};
        var selectedIds = settings.selectedIds || Object.keys(positions);
        var defensiveIds = settings.defensiveIds || selectedIds;
        var weakSideIds = settings.weakSideIds || selectedIds;
        var strongSide = settings.strongSide || "right";
        var selected = selectedIds.map(function (id) {
            return positions[id];
        }).filter(Boolean);
        var defensive = defensiveIds.map(function (id) {
            return positions[id];
        }).filter(Boolean);
        var weakSidePlayers = weakSideIds.map(function (id) {
            return positions[id];
        }).filter(Boolean);

        if (!selected.length || !defensive.length || !weakSidePlayers.length) {
            throw new Error("Tactical metrics require selected and defensive player coordinates.");
        }

        var xValues = selected.map(function (point) { return point.xMeters; });
        var yValues = selected.map(function (point) { return point.yMeters; });
        var defensiveX = defensive.map(function (point) { return point.xMeters; });
        var minimumX = Math.min.apply(null, xValues);
        var maximumX = Math.max.apply(null, xValues);
        var minimumY = Math.min.apply(null, yValues);
        var maximumY = Math.max.apply(null, yValues);
        var defensiveLineX = defensiveX.reduce(function (sum, value) {
            return sum + value;
        }, 0) / defensiveX.length;
        var weakSideY = weakSidePlayers.map(function (point) {
            return point.yMeters;
        });
        var weakSideMinimumY = Math.min.apply(null, weakSideY);
        var weakSideMaximumY = Math.max.apply(null, weakSideY);
        var weakSideGap = strongSide === "right"
            ? weakSideMinimumY
            : PITCH.width - weakSideMaximumY;

        return {
            attackingWidth: roundMetres(maximumY - minimumY),
            teamDepth: roundMetres(maximumX - minimumX),
            lineHeight: roundMetres(defensiveLineX),
            weakSideGap: roundMetres(weakSideGap),
            extents: {
                minimumX: minimumX,
                maximumX: maximumX,
                minimumY: minimumY,
                maximumY: maximumY,
                defensiveLineX: defensiveLineX,
                weakSideTouchlineY: strongSide === "right" ? 0 : PITCH.width,
                weakSidePlayerY: strongSide === "right" ? weakSideMinimumY : weakSideMaximumY
            }
        };
    }

    function mirrorPositionsVertically(positions) {
        var mirrored = {};
        Object.keys(positions).forEach(function (id) {
            mirrored[id] = mirrorPointVertically(positions[id]);
        });
        return mirrored;
    }

    return Object.freeze({
        PITCH: PITCH,
        clamp: clamp,
        copyPositions: copyPositions,
        pointToPercent: pointToPercent,
        percentToPoint: percentToPoint,
        mirrorPointVertically: mirrorPointVertically,
        mirrorPositionsVertically: mirrorPositionsVertically,
        interpolatePoint: interpolatePoint,
        interpolatePath: interpolatePath,
        computeMetrics: computeMetrics
    });
});
