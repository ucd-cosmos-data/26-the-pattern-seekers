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

    function pathWaypointProgress(path, waypointIndex) {
        if (!path || path.length < 2) return 0;
        var index = clamp(Math.round(waypointIndex), 0, path.length - 1);
        var totalDistance = 0;
        var waypointDistance = 0;
        var pathIndex;

        for (pathIndex = 1; pathIndex < path.length; pathIndex += 1) {
            var segmentDistance = distance(path[pathIndex - 1], path[pathIndex]);
            totalDistance += segmentDistance;
            if (pathIndex <= index) waypointDistance += segmentDistance;
        }

        return totalDistance ? waypointDistance / totalDistance : 0;
    }

    function ownedSegmentWeight(path, owners, segmentIndex, segmentTypes) {
        var segmentDistance = distance(path[segmentIndex], path[segmentIndex + 1]);
        var segmentType = segmentTypes && segmentTypes[segmentIndex];
        var sameOwner = owners &&
            owners[segmentIndex] &&
            owners[segmentIndex] === owners[segmentIndex + 1];
        if (segmentType === "carry" || (!segmentType && sameOwner)) {
            return Math.max(0.45, segmentDistance / 7.5);
        }
        if (segmentType === "loss" || segmentType === "recovery") {
            return Math.max(0.55, segmentDistance / 10);
        }
        return Math.max(0.4, segmentDistance / 24);
    }

    // Passes travel faster than carries. Distance-only interpolation made a
    // short carry inherit only a sliver of a long pass/carry step, forcing the
    // carrier to sprint unnaturally. Ownership-aware weights give each action
    // its own plausible share of the animation window.
    function ownedPathWaypointProgress(path, owners, waypointIndex, segmentTypes) {
        if (!path || path.length < 2) return 0;
        var index = clamp(Math.round(waypointIndex), 0, path.length - 1);
        var totalWeight = 0;
        var waypointWeight = 0;
        for (var segmentIndex = 0; segmentIndex < path.length - 1; segmentIndex += 1) {
            var weight = ownedSegmentWeight(
                path,
                owners,
                segmentIndex,
                segmentTypes
            );
            totalWeight += weight;
            if (segmentIndex < index) waypointWeight += weight;
        }
        return totalWeight ? waypointWeight / totalWeight : 0;
    }

    function interpolateOwnedPath(path, owners, progress, segmentTypes) {
        if (!path || path.length < 2) return interpolatePath(path, progress);
        var amount = clamp(progress, 0, 1);
        var weights = [];
        var totalWeight = 0;
        var segmentIndex;
        for (segmentIndex = 0; segmentIndex < path.length - 1; segmentIndex += 1) {
            var weight = ownedSegmentWeight(
                path,
                owners,
                segmentIndex,
                segmentTypes
            );
            weights.push(weight);
            totalWeight += weight;
        }
        if (!totalWeight) return {
            xMeters: path[path.length - 1].xMeters,
            yMeters: path[path.length - 1].yMeters
        };

        var targetWeight = totalWeight * amount;
        var travelledWeight = 0;
        for (segmentIndex = 0; segmentIndex < weights.length; segmentIndex += 1) {
            if (travelledWeight + weights[segmentIndex] >= targetWeight) {
                var localProgress =
                    (targetWeight - travelledWeight) / weights[segmentIndex];
                return interpolatePoint(
                    path[segmentIndex],
                    path[segmentIndex + 1],
                    localProgress
                );
            }
            travelledWeight += weights[segmentIndex];
        }
        return {
            xMeters: path[path.length - 1].xMeters,
            yMeters: path[path.length - 1].yMeters
        };
    }

    function carrierPositionAtProgress(startPosition, path, waypointIndex, progress) {
        var receptionProgress = pathWaypointProgress(path, waypointIndex);
        if (progress < receptionProgress) {
            return {
                xMeters: startPosition.xMeters,
                yMeters: startPosition.yMeters
            };
        }
        return interpolatePath(path, progress);
    }

    // Match the animation rhythm used by the standalone World's Coach
    // explorer: players get a short setup window, the ball action happens,
    // then the board holds the completed frame long enough to read it.
    var BALL_MOTION_START = 0.22;
    var BALL_MOTION_END = 0.84;

    function smoothstep(progress) {
        var amount = clamp(progress, 0, 1);
        return amount * amount * (3 - 2 * amount);
    }

    function ballProgressAtStepProgress(progress) {
        return clamp(
            (clamp(progress, 0, 1) - BALL_MOTION_START) /
                (BALL_MOTION_END - BALL_MOTION_START),
            0,
            1
        );
    }

    function touchProgressAtWaypoint(path, waypointIndex, owners, segmentTypes) {
        return BALL_MOTION_START +
            (owners
                ? ownedPathWaypointProgress(
                    path,
                    owners,
                    waypointIndex,
                    segmentTypes
                )
                : pathWaypointProgress(path, waypointIndex)) *
                (BALL_MOTION_END - BALL_MOTION_START);
    }

    // Resolve an explicitly named ball owner's position at any point in a
    // step. A receiver reaches the touch point exactly when the ball does. A
    // player who owns consecutive waypoints follows the same ball path and
    // timing exactly, which makes carries impossible to detach visually.
    function ownerPositionAtStepProgress(options) {
        var startPosition = options.startPosition;
        var endPosition = options.endPosition;
        var path = options.path || [];
        var owners = options.owners || [];
        var segmentTypes = options.segmentTypes || [];
        var playerId = options.playerId;
        var progress = clamp(options.progress, 0, 1);
        var ownedIndexes = [];

        owners.forEach(function (ownerId, index) {
            if (ownerId === playerId) ownedIndexes.push(index);
        });

        if (!ownedIndexes.length || !path.length) {
            return interpolatePoint(startPosition, endPosition, smoothstep(progress));
        }

        var firstIndex = ownedIndexes[0];
        var firstProgress = touchProgressAtWaypoint(
            path,
            firstIndex,
            owners,
            segmentTypes
        );
        if (progress <= firstProgress) {
            var approachProgress = firstProgress
                ? smoothstep(progress / firstProgress)
                : 1;
            return interpolatePoint(startPosition, path[firstIndex], approachProgress);
        }

        for (var index = 0; index < ownedIndexes.length - 1; index += 1) {
            var fromIndex = ownedIndexes[index];
            var toIndex = ownedIndexes[index + 1];
            var fromProgress = touchProgressAtWaypoint(
                path,
                fromIndex,
                owners,
                segmentTypes
            );
            var toProgress = touchProgressAtWaypoint(
                path,
                toIndex,
                owners,
                segmentTypes
            );

            if (progress > toProgress) continue;

            // Consecutive touches by one player are a carry. Use the ball's
            // exact interpolation instead of a second approximation.
            if (toIndex === fromIndex + 1) {
                return interpolateOwnedPath(
                    path,
                    owners,
                    ballProgressAtStepProgress(progress),
                    segmentTypes
                );
            }

            var travelProgress = toProgress === fromProgress
                ? 1
                : smoothstep((progress - fromProgress) / (toProgress - fromProgress));
            return interpolatePoint(path[fromIndex], path[toIndex], travelProgress);
        }

        var lastIndex = ownedIndexes[ownedIndexes.length - 1];
        var lastProgress = touchProgressAtWaypoint(
            path,
            lastIndex,
            owners,
            segmentTypes
        );
        var releaseProgress = lastProgress >= 1
            ? 1
            : smoothstep((progress - lastProgress) / (1 - lastProgress));
        return interpolatePoint(path[lastIndex], endPosition, releaseProgress);
    }

    function playerTeam(id) {
        var value = String(id || "");
        var separator = value.indexOf("_");
        return separator === -1 ? value : value.slice(0, separator);
    }

    function pairAngle(idA, idB) {
        var key = idA + "|" + idB;
        var seed = 0;
        for (var index = 0; index < key.length; index += 1) {
            seed = (seed * 31 + key.charCodeAt(index)) % 360;
        }
        return seed * Math.PI / 180;
    }

    function ballOwnerPrioritiesAtStepProgress(
        path,
        owners,
        progress,
        segmentTypes
    ) {
        var priorities = {};
        if (!path || !path.length || !owners || !owners.length) {
            return priorities;
        }
        if (path.length === 1 || progress <= BALL_MOTION_START) {
            if (owners[0]) priorities[owners[0]] = 1;
            return priorities;
        }
        if (progress >= BALL_MOTION_END) {
            var finalOwner = owners[owners.length - 1];
            if (finalOwner) priorities[finalOwner] = 1;
            return priorities;
        }

        var pathProgress = ballProgressAtStepProgress(progress);
        var totalWeight = 0;
        var weights = [];
        var segmentIndex;
        for (segmentIndex = 0; segmentIndex < path.length - 1; segmentIndex += 1) {
            var weight = ownedSegmentWeight(
                path,
                owners,
                segmentIndex,
                segmentTypes
            );
            weights.push(weight);
            totalWeight += weight;
        }
        var targetWeight = totalWeight * pathProgress;
        var travelledWeight = 0;
        for (segmentIndex = 0; segmentIndex < weights.length; segmentIndex += 1) {
            if (travelledWeight + weights[segmentIndex] >= targetWeight) break;
            travelledWeight += weights[segmentIndex];
        }
        segmentIndex = Math.min(segmentIndex, weights.length - 1);
        var localProgress = weights[segmentIndex]
            ? (targetWeight - travelledWeight) / weights[segmentIndex]
            : 1;
        var fromOwner = owners[segmentIndex];
        var toOwner = owners[segmentIndex + 1];
        if (fromOwner && fromOwner === toOwner) {
            priorities[fromOwner] = 1;
            return priorities;
        }

        var handoff = smoothstep(localProgress);
        if (fromOwner) priorities[fromOwner] = 1 - handoff;
        if (toOwner) priorities[toOwner] = handoff;
        return priorities;
    }

    function stablePairAxis(idA, idB, startPositions, endPositions) {
        var angle = pairAngle(idA, idB);
        var unitX = Math.cos(angle);
        var unitY = Math.sin(angle);
        var startA = startPositions && startPositions[idA];
        var startB = startPositions && startPositions[idB];
        var endA = endPositions && endPositions[idA];
        var endB = endPositions && endPositions[idB];

        if (startA && startB && endA && endB) {
            var relativeVelocityX =
                (endB.xMeters - startB.xMeters) -
                (endA.xMeters - startA.xMeters);
            var relativeVelocityY =
                (endB.yMeters - startB.yMeters) -
                (endA.yMeters - startA.yMeters);
            var velocityLength = Math.sqrt(
                relativeVelocityX * relativeVelocityX +
                relativeVelocityY * relativeVelocityY
            );
            if (velocityLength > 0.01) {
                unitX = -relativeVelocityY / velocityLength;
                unitY = relativeVelocityX / velocityLength;
                var startDifferenceX = startB.xMeters - startA.xMeters;
                var startDifferenceY = startB.yMeters - startA.yMeters;
                var side = startDifferenceX * unitX +
                    startDifferenceY * unitY;
                if (side < -0.001 ||
                        (Math.abs(side) <= 0.001 && angle >= Math.PI)) {
                    unitX *= -1;
                    unitY *= -1;
                }
            }
        }
        return { x: unitX, y: unitY };
    }

    function cappedPoint(point, original, inset, maximumDisplacement) {
        var bounded = {
            xMeters: clamp(point.xMeters, inset, PITCH.length - inset),
            yMeters: clamp(point.yMeters, inset, PITCH.width - inset)
        };
        var displacement = distance(original, bounded);
        if (displacement <= maximumDisplacement || !displacement) return bounded;
        return interpolatePoint(
            original,
            bounded,
            maximumDisplacement / displacement
        );
    }

    // Resolve only true marker overlaps. This is deliberately much smaller
    // than the old 5.2m collision solver: teammates receive a little label
    // clearance, opponents may stay tight in a duel, and named ball owners
    // are never moved away from their touch/carry route.
    function resolveFrameOverlaps(sourcePositions, options) {
        var settings = options || {};
        var original = copyPositions(sourcePositions);
        var ids = Object.keys(original).sort();
        var priorities = settings.priorities || {};
        var sameTeamMinimum = settings.sameTeamMinimum || 3;
        var opponentMinimum = settings.opponentMinimum || 2;
        var maximumDisplacement = settings.maximumDisplacement || 1.8;
        var inset = settings.inset === undefined ? 3.5 : settings.inset;
        var offsets = {};
        ids.forEach(function (id) {
            offsets[id] = { xMeters: 0, yMeters: 0 };
        });

        for (var firstIndex = 0; firstIndex < ids.length; firstIndex += 1) {
            for (var secondIndex = firstIndex + 1;
                    secondIndex < ids.length;
                    secondIndex += 1) {
                var idA = ids[firstIndex];
                var idB = ids[secondIndex];
                var a = original[idA];
                var b = original[idB];
                var minimumDistance = playerTeam(idA) === playerTeam(idB)
                    ? sameTeamMinimum
                    : opponentMinimum;
                var currentDistance = distance(a, b);
                if (currentDistance >= minimumDistance) continue;
                var mobilityA = 1 - clamp(priorities[idA] || 0, 0, 1);
                var mobilityB = 1 - clamp(priorities[idB] || 0, 0, 1);
                var totalMobility = mobilityA + mobilityB;
                if (totalMobility <= 0.0001) continue;

                var axis = stablePairAxis(
                    idA,
                    idB,
                    settings.startPositions,
                    settings.endPositions
                );
                var proximity = 1 - currentDistance / minimumDistance;
                var correction = minimumDistance * smoothstep(proximity);
                var moveA = correction * mobilityA / totalMobility;
                var moveB = correction * mobilityB / totalMobility;
                offsets[idA].xMeters -= axis.x * moveA;
                offsets[idA].yMeters -= axis.y * moveA;
                offsets[idB].xMeters += axis.x * moveB;
                offsets[idB].yMeters += axis.y * moveB;
            }
        }

        var positions = {};
        ids.forEach(function (id) {
            positions[id] = cappedPoint({
                xMeters: original[id].xMeters + offsets[id].xMeters,
                yMeters: original[id].yMeters + offsets[id].yMeters
            }, original[id], inset, maximumDisplacement);
        });

        // A small final barrier prevents a dense cluster of summed nudges from
        // putting two marker centres back on top of one another. It is only a
        // sub-marker correction, so legitimate shoulder-to-shoulder pressure
        // remains visible and the stable-axis pass above still owns the route.
        for (var cleanupPass = 0; cleanupPass < 3; cleanupPass += 1) {
            for (firstIndex = 0; firstIndex < ids.length; firstIndex += 1) {
                for (secondIndex = firstIndex + 1;
                        secondIndex < ids.length;
                        secondIndex += 1) {
                    idA = ids[firstIndex];
                    idB = ids[secondIndex];
                    a = positions[idA];
                    b = positions[idB];
                    minimumDistance = playerTeam(idA) === playerTeam(idB)
                        ? Math.min(sameTeamMinimum, 1.4)
                        : Math.min(opponentMinimum, 0.7);
                    currentDistance = distance(a, b);
                    if (currentDistance >= minimumDistance) continue;
                    mobilityA = 1 - clamp(priorities[idA] || 0, 0, 1);
                    mobilityB = 1 - clamp(priorities[idB] || 0, 0, 1);
                    totalMobility = mobilityA + mobilityB;
                    if (totalMobility <= 0.0001) continue;
                    if (currentDistance < 0.01) {
                        axis = stablePairAxis(
                            idA,
                            idB,
                            settings.startPositions,
                            settings.endPositions
                        );
                    } else {
                        axis = {
                            x: (b.xMeters - a.xMeters) / currentDistance,
                            y: (b.yMeters - a.yMeters) / currentDistance
                        };
                    }
                    correction = minimumDistance - currentDistance + 0.005;
                    moveA = correction * mobilityA / totalMobility;
                    moveB = correction * mobilityB / totalMobility;
                    positions[idA] = cappedPoint({
                        xMeters: a.xMeters - axis.x * moveA,
                        yMeters: a.yMeters - axis.y * moveA
                    }, original[idA], inset, maximumDisplacement);
                    positions[idB] = cappedPoint({
                        xMeters: b.xMeters + axis.x * moveB,
                        yMeters: b.yMeters + axis.y * moveB
                    }, original[idB], inset, maximumDisplacement);
                }
            }
        }
        return positions;
    }

    function pointsEqual(pointA, pointB, tolerance) {
        if (!pointA || !pointB) return false;
        return distance(pointA, pointB) <= (tolerance === undefined ? 0.001 : tolerance);
    }

    function isPointOnPitch(point) {
        return Boolean(point) &&
            point.xMeters >= 0 &&
            point.xMeters <= PITCH.length &&
            point.yMeters >= 0 &&
            point.yMeters <= PITCH.width;
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
        pathWaypointProgress: pathWaypointProgress,
        ownedSegmentWeight: ownedSegmentWeight,
        ownedPathWaypointProgress: ownedPathWaypointProgress,
        interpolateOwnedPath: interpolateOwnedPath,
        carrierPositionAtProgress: carrierPositionAtProgress,
        smoothstep: smoothstep,
        ballProgressAtStepProgress: ballProgressAtStepProgress,
        touchProgressAtWaypoint: touchProgressAtWaypoint,
        ownerPositionAtStepProgress: ownerPositionAtStepProgress,
        ballOwnerPrioritiesAtStepProgress: ballOwnerPrioritiesAtStepProgress,
        resolveFrameOverlaps: resolveFrameOverlaps,
        distance: distance,
        pointsEqual: pointsEqual,
        isPointOnPitch: isPointOnPitch,
        computeMetrics: computeMetrics
    });
});
