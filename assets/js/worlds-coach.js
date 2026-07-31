(function () {
    "use strict";

    var room = document.querySelector("[data-coach-room]");
    var model = window.WorldsCoachModel;
    if (!room || !model) return;
    var PLAYER_INSET_METRES = 3.5;

    function point(xMeters, yMeters) {
        return { xMeters: xMeters, yMeters: yMeters };
    }

    function markerSafePoint(source) {
        return point(
            model.clamp(source.xMeters, PLAYER_INSET_METRES, model.PITCH.length - PLAYER_INSET_METRES),
            model.clamp(source.yMeters, PLAYER_INSET_METRES, model.PITCH.width - PLAYER_INSET_METRES)
        );
    }

    function mergePositions() {
        var result = {};
        Array.prototype.slice.call(arguments).forEach(function (positions) {
            Object.keys(positions).forEach(function (id) {
                result[id] = point(positions[id].xMeters, positions[id].yMeters);
            });
        });
        return result;
    }

    function mergeIntoPositions(base, updates) {
        var result = model.copyPositions(base);
        Object.keys(updates || {}).forEach(function (id) {
            result[id] = point(updates[id].xMeters, updates[id].yMeters);
        });
        return result;
    }

    function svgElement(name, attributes, text) {
        var element = document.createElementNS("http://www.w3.org/2000/svg", name);
        Object.keys(attributes || {}).forEach(function (key) {
            element.setAttribute(key, attributes[key]);
        });
        if (text) element.textContent = text;
        return element;
    }

    var roster = {
        gk: {
            team: "ARG", number: 23, name: "Emiliano Martínez", surname: "Martínez",
            role: "Goalkeeper", instruction: "Invite the first press, then release the free centre-back."
        },
        molina: {
            team: "ARG", number: 26, name: "Nahuel Molina", surname: "Molina",
            role: "Right wing-back", instruction: "Own Argentina's right touchline and attack beyond Messi."
        },
        romero: {
            team: "ARG", number: 13, name: "Cristian Romero", surname: "Romero",
            role: "Right centre-back", instruction: "Carry forward when free and protect the first counter."
        },
        otamendi: {
            team: "ARG", number: 19, name: "Nicolás Otamendi", surname: "Otamendi",
            role: "Central defender", instruction: "Anchor the build and protect depth."
        },
        tagliafico: {
            team: "ARG", number: 3, name: "Nicolás Tagliafico", surname: "Tagliafico",
            role: "Left-back / third defender", instruction: "Stay as the left defender while Molina advances."
        },
        enzo: {
            team: "ARG", number: 24, name: "Enzo Fernández", surname: "Enzo",
            role: "Holding midfielder", instruction: "Control tempo and screen the central transition lane."
        },
        depaul: {
            team: "ARG", number: 7, name: "Rodrigo De Paul", surname: "De Paul",
            role: "Right-sided connector", instruction: "Support below Messi, then run beyond the second defender."
        },
        macallister: {
            team: "ARG", number: 20, name: "Alexis Mac Allister", surname: "Mac Allister",
            role: "Left half-space midfielder", instruction: "Balance the structure and arrive for the cutback."
        },
        messi: {
            team: "ARG", number: 10, name: "Lionel Messi", surname: "Messi",
            role: "Right half-space creator", instruction: "Attract pressure, turn, and release Molina outside."
        },
        dimaria: {
            team: "ARG", number: 11, name: "Ángel Di María", surname: "Di María",
            role: "Left winger", instruction: "Hold the weak-side width and attack the back post."
        },
        forward: {
            team: "ARG", number: 9, name: "Julián Álvarez", surname: "Álvarez",
            role: "Depth-running forward", instruction: "Pin the centre-backs and attack the cutback zone."
        },
        fra_gk: {
            team: "FRA", number: 1, name: "Hugo Lloris", surname: "Lloris",
            role: "Goalkeeper", instruction: "France build-up reference."
        },
        fra_rb: {
            team: "FRA", number: 5, name: "Jules Koundé", surname: "Koundé",
            role: "France right-back", instruction: "The permitted outside outlet during Argentina's press."
        },
        fra_rcb: {
            team: "FRA", number: 4, name: "Raphaël Varane", surname: "Varane",
            role: "Right centre-back", instruction: "Protected by the pressing lock."
        },
        fra_lcb: {
            team: "FRA", number: 18, name: "Dayot Upamecano", surname: "Upamecano",
            role: "Left centre-back", instruction: "Backward-pass trigger source."
        },
        fra_lb: {
            team: "FRA", number: 22, name: "Theo Hernández", surname: "Hernández",
            role: "France left-back", instruction: "Defends Argentina's right-side overload."
        },
        fra_rm: {
            team: "FRA", number: 7, name: "Antoine Griezmann", surname: "Griezmann",
            role: "Right midfielder", instruction: "Supports France's right side."
        },
        fra_cm: {
            team: "FRA", number: 8, name: "Aurélien Tchouaméni", surname: "Tchouaméni",
            role: "Central pivot", instruction: "The pivot Argentina's first presser must screen."
        },
        fra_lm: {
            team: "FRA", number: 14, name: "Adrien Rabiot", surname: "Rabiot",
            role: "Left midfielder", instruction: "Defends France's left half-space."
        },
        fra_rw: {
            team: "FRA", number: 11, name: "Ousmane Dembélé", surname: "Dembélé",
            role: "Right winger", instruction: "France's high right outlet."
        },
        fra_st: {
            team: "FRA", number: 9, name: "Olivier Giroud", surname: "Giroud",
            role: "Centre-forward", instruction: "France's central outlet."
        },
        fra_lw: {
            team: "FRA", number: 10, name: "Kylian Mbappé", surname: "Mbappé",
            role: "Left winger", instruction: "France's primary transition threat."
        }
    };

    // ESPN athlete ids → headshot at a.espncdn.com/i/headshots/soccer/players/full/{id}.png
    var espnIds = {
        gk: 158626, molina: 164826, romero: 96970, otamendi: 119289, tagliafico: 145190,
        enzo: 285450, depaul: 174466, macallister: 249299, messi: 45843, dimaria: 108223,
        forward: 277206, lautaro: 219713,
        fra_gk: 43372, fra_rb: 231692, fra_rcb: 153053, fra_lcb: 222793, fra_lb: 233621,
        fra_rm: 140416, fra_cm: 265919, fra_lm: 176203, fra_rw: 229744, fra_st: 88965, fra_lw: 231388
    };

    function headshotUrl(id) {
        var entry = roster[id];
        var espn = id === "forward" && playerControl && playerControl.value === "lautaro"
            ? espnIds.lautaro
            : (entry && entry.espnId);
        return espn
            ? "https://a.espncdn.com/i/headshots/soccer/players/full/" + espn + ".png"
            : "";
    }

    // Fallback source: ESPN only has cutout headshots for the players it actively
    // covers (Messi, MLS), so every other player falls back to a Wikipedia photo.
    var wikiTitles = {
        gk: "Emiliano Martínez", molina: "Nahuel Molina", romero: "Cristian Romero",
        otamendi: "Nicolás Otamendi", tagliafico: "Nicolás Tagliafico", enzo: "Enzo Fernández",
        depaul: "Rodrigo De Paul", macallister: "Alexis Mac Allister", messi: "Lionel Messi",
        dimaria: "Ángel Di María", forward: "Julián Álvarez", lautaro: "Lautaro Martínez",
        fra_gk: "Hugo Lloris", fra_rb: "Jules Koundé", fra_rcb: "Raphaël Varane",
        fra_lcb: "Dayot Upamecano", fra_lb: "Théo Hernández", fra_rm: "Antoine Griezmann",
        fra_cm: "Aurélien Tchouaméni", fra_lm: "Adrien Rabiot", fra_rw: "Ousmane Dembélé",
        fra_st: "Olivier Giroud", fra_lw: "Kylian Mbappé"
    };

    function wikiTitleFor(id) {
        if (id === "forward" && playerControl && playerControl.value === "lautaro") {
            return wikiTitles.lautaro;
        }
        var entry = roster[id];
        return entry && entry.wikiTitle;
    }

    // Load the tooltip photo: ESPN first, Wikipedia thumbnail as fallback, then
    // hide the frame entirely if neither resolves. Guards against a stale async
    // result landing on a tooltip that has since moved to another player.
    function loadPhotoInto(img, id, onFail) {
        onFail = onFail || function () {};
        function tryWikipedia() {
            var title = wikiTitleFor(id);
            if (!title) return onFail();
            fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title.replace(/ /g, "_")))
                .then(function (response) { return response.ok ? response.json() : Promise.reject(); })
                .then(function (data) {
                    var source = data && data.thumbnail && data.thumbnail.source;
                    if (source) {
                        img.onerror = onFail;
                        img.src = source;
                    } else {
                        onFail();
                    }
                })
                .catch(onFail);
        }
        var espnUrl = headshotUrl(id);
        if (espnUrl) {
            img.onerror = tryWikipedia;
            img.src = espnUrl;
        } else {
            tryWikipedia();
        }
    }

    // Fill a role-card avatar; the number badge stays visible either way.
    function loadRolePhoto(card) {
        var img = card.querySelector(".coach-role-photo");
        if (!img) return;
        img.onload = function () { card.classList.add("has-photo"); };
        loadPhotoInto(img, card.dataset.roleCard, function () {
            card.classList.remove("has-photo");
            img.removeAttribute("src");
        });
    }

    var argAttack = {
        gk: point(8, 34),
        tagliafico: point(25, 12),
        otamendi: point(23, 34),
        romero: point(25, 56),
        enzo: point(42, 27),
        depaul: point(42, 48),
        dimaria: point(75, 5),
        macallister: point(70, 20),
        forward: point(78, 34),
        messi: point(69, 50),
        molina: point(72, 63)
    };

    var arg442 = {
        gk: point(9, 34),
        tagliafico: point(36, 9),
        otamendi: point(36, 26),
        romero: point(36, 42),
        molina: point(36, 59),
        dimaria: point(48, 9),
        macallister: point(48, 26),
        enzo: point(48, 42),
        depaul: point(48, 59),
        forward: point(60, 27),
        messi: point(60, 43)
    };

    var argMidBlock = {
        gk: point(8, 34),
        tagliafico: point(42, 10),
        otamendi: point(42, 27),
        romero: point(42, 41),
        molina: point(42, 58),
        dimaria: point(51, 10),
        macallister: point(51, 27),
        enzo: point(51, 41),
        depaul: point(51, 58),
        forward: point(59, 28),
        messi: point(59, 42)
    };

    var fraBlock = {
        fra_gk: point(96, 34),
        fra_rb: point(79, 8),
        fra_rcb: point(81, 25),
        fra_lcb: point(81, 43),
        fra_lb: point(79, 60),
        fra_rm: point(66, 14),
        fra_cm: point(67, 34),
        fra_lm: point(66, 54),
        fra_rw: point(54, 10),
        fra_st: point(55, 34),
        fra_lw: point(54, 58)
    };

    var fraBuild = {
        fra_gk: point(95, 34),
        fra_rb: point(81, 9),
        fra_rcb: point(81, 25),
        fra_lcb: point(81, 43),
        fra_lb: point(80, 59),
        fra_rm: point(69, 14),
        fra_cm: point(68, 34),
        fra_lm: point(69, 54),
        fra_rw: point(57, 9),
        fra_st: point(57, 34),
        fra_lw: point(57, 59)
    };

    var attackInitial = mergePositions(argAttack, fraBlock);

    var attackSteps = [
        {
            id: "attack-structure",
            label: "1 · Build 3–2",
            phase: "IN POSSESSION",
            title: "Build in a 3–2–5",
            caption: "Three defenders start the move, two midfielders connect, and five attackers stretch France's back line.",
            duration: 1600,
            moves: {},
            ballPath: [point(8, 34)],
            active: ["gk", "tagliafico", "otamendi", "romero", "enzo", "depaul"],
            actions: [],
            zones: [
                { type: "rect", x: 18, y: 7, width: 31, height: 54, tone: "neutral", label: "3 + 2 BUILD PLATFORM" }
            ]
        },
        {
            id: "attack-invite",
            label: "2 · Draw the press",
            phase: "BUILD-UP",
            title: "Draw France toward Romero",
            caption: "Martínez finds Romero. As Romero carries forward, Enzo stays behind France's first line and Rabiot steps out.",
            duration: 2300,
            moves: {
                romero: point(35, 56),
                enzo: point(44, 29),
                fra_lm: point(59, 52),
                fra_st: point(48, 37)
            },
            ballPath: [point(8, 34), point(25, 56), point(29, 57), point(35, 56)],
            ballCarrier: { playerId: "romero", fromWaypoint: 1 },
            active: ["gk", "romero", "enzo"],
            actions: [
                { type: "pass", label: "PASS", path: [point(8, 34), point(25, 56)] },
                { type: "carry", label: "CARRY", path: [point(25, 56), point(29, 57), point(35, 56)] }
            ]
        },
        {
            id: "attack-release",
            label: "3 · Find De Paul",
            phase: "PROGRESSION",
            title: "Find De Paul between the lines",
            caption: "Romero finds De Paul in the right half-space. Messi drops while Rabiot and Hernández shift toward the ball.",
            duration: 1900,
            moves: {
                depaul: point(49, 49),
                messi: point(62, 52),
                fra_lm: point(58, 49),
                fra_lb: point(74, 59)
            },
            ballPath: [point(35, 56), point(49, 49)],
            active: ["romero", "depaul", "messi"],
            actions: [
                { type: "pass", label: "PASS", path: [point(35, 56), point(49, 49)] },
                { type: "run", label: "DROP", path: [point(69, 50), point(62, 52)] }
            ],
            zones: [
                { type: "rect", x: 52, y: 45, width: 25, height: 13, tone: "neutral", label: "ARG RIGHT HALF-SPACE" }
            ]
        },
        {
            id: "attack-overload",
            label: "4 · Create 3v2",
            phase: "CREATION",
            title: "Create a 3v2 on the right",
            caption: "De Paul finds Messi. Molina overlaps and De Paul supports underneath, overloading Rabiot and Hernández.",
            duration: 2200,
            moves: {
                molina: point(80, 64),
                depaul: point(61, 54),
                messi: point(71, 51),
                forward: point(82, 35),
                fra_lb: point(78, 58),
                fra_lm: point(65, 51)
            },
            ballPath: [point(49, 49), point(71, 51)],
            active: ["depaul", "messi", "molina"],
            actions: [
                { type: "pass", label: "PASS", path: [point(49, 49), point(71, 51)] },
                { type: "run", label: "OVERLAP", path: [point(72, 63), point(80, 64)] },
                { type: "decoy", label: "PIN", path: [point(78, 34), point(82, 35)] }
            ],
            zones: [
                { type: "rect", x: 59, y: 47, width: 26, height: 20, tone: "neutral", label: "3v2 OVERLOAD" }
            ]
        },
        {
            id: "attack-byline",
            label: "5 · Release Molina",
            phase: "FINAL THIRD",
            title: "Release Molina outside",
            caption: "Messi sends Molina toward the byline. Álvarez attacks the near post while De Paul protects the return pass.",
            duration: 1900,
            moves: {
                molina: point(89, 62),
                forward: point(88, 39),
                depaul: point(72, 51),
                fra_lb: point(84, 58),
                fra_lcb: point(86, 43)
            },
            ballPath: [point(71, 51), point(89, 62)],
            active: ["messi", "molina", "forward", "depaul"],
            actions: [
                { type: "pass", label: "PASS", path: [point(71, 51), point(89, 62)] },
                { type: "run", label: "BYLINE", path: [point(80, 64), point(89, 62)] },
                { type: "run", label: "NEAR POST", path: [point(82, 35), point(88, 39)] }
            ]
        },
        {
            id: "attack-cutback",
            label: "6 · Cutback",
            phase: "FINISH",
            title: "Cut the ball behind France",
            caption: "Molina cuts back for Álvarez as France narrows. Mac Allister arrives for the second ball.",
            duration: 1800,
            moves: {
                forward: point(91, 36),
                macallister: point(83, 23),
                messi: point(80, 49),
                fra_lcb: point(88, 41),
                fra_rcb: point(87, 27)
            },
            ballPath: [point(89, 62), point(91, 36)],
            active: ["molina", "forward", "macallister"],
            actions: [
                { type: "pass", label: "CUTBACK", path: [point(89, 62), point(91, 36)] },
                { type: "run", label: "ARRIVE", path: [point(70, 20), point(83, 23)] }
            ],
            zones: [
                { type: "rect", x: 84, y: 27, width: 12, height: 18, tone: "neutral", label: "CUTBACK ZONE" }
            ]
        },
        {
            id: "attack-reaction",
            label: "7 · Counterpress",
            phase: "ON LOSS",
            title: "Counterpress the blocked shot",
            caption: "The shot is blocked. The five nearest attackers close the loose ball for five seconds.",
            duration: 2300,
            moves: {
                messi: point(84, 46),
                molina: point(88, 55),
                depaul: point(78, 49),
                forward: point(88, 38),
                macallister: point(82, 31)
            },
            ballPath: [point(91, 36), point(94, 35), point(86, 43)],
            active: ["messi", "molina", "depaul", "forward", "macallister"],
            pressing: ["messi", "molina", "depaul", "forward", "macallister"],
            actions: [
                { type: "pass", label: "SHOT", path: [point(91, 36), point(94, 35)] },
                { type: "press", label: "PRESS", path: [point(80, 49), point(86, 43)] },
                { type: "press", label: "PRESS", path: [point(89, 62), point(88, 55)] },
                { type: "press", label: "PRESS", path: [point(72, 51), point(78, 49)] }
            ],
            zones: [
                { type: "circle", cx: 86, cy: 43, radius: 10, tone: "press", label: "5-SECOND PRESSURE AREA" }
            ]
        }
    ];

    var formationStates = [
        {
            id: "formation-possession",
            label: "In possession · 3–2–5",
            phase: "IN POSSESSION",
            title: "Build in a 3–2–5",
            caption: "Three defenders start the move, two midfielders connect, and five attackers hold the width.",
            positions: mergePositions(argAttack, fraBlock),
            active: [],
            bands: [
                { x: 20, width: 10, label: "BACK 3", tone: "neutral" },
                { x: 37, width: 10, label: "MID 2", tone: "neutral" },
                { x: 65, width: 18, label: "FRONT 5", tone: "neutral" }
            ]
        },
        {
            id: "formation-out",
            label: "Out of possession · 4–4–2",
            phase: "OUT OF POSSESSION",
            title: "Defend in a compact 4–4–2",
            caption: "Two clear lines of four sit behind Álvarez and Messi.",
            positions: mergePositions(arg442, fraBuild),
            active: [],
            bands: [
                { x: 32, width: 8, label: "BACK 4", tone: "neutral" },
                { x: 44, width: 8, label: "MIDFIELD 4", tone: "neutral" },
                { x: 56, width: 8, label: "FRONT 2", tone: "neutral" }
            ]
        },
        {
            id: "formation-rest",
            label: "Rest defence · 3+2",
            phase: "ATTACKING SECURITY",
            title: "Protect the attack with a 3+2",
            caption: "Tagliafico, Otamendi, and Romero cover behind Enzo and De Paul.",
            positions: mergePositions(argAttack, fraBlock),
            active: ["tagliafico", "otamendi", "romero", "enzo", "depaul"],
            protect: ["tagliafico", "otamendi", "romero", "enzo", "depaul"],
            bands: [
                { x: 19, width: 12, label: "3 PROTECT", tone: "protect" },
                { x: 37, width: 11, label: "2 SCREEN", tone: "protect" }
            ]
        },
        {
            id: "formation-lanes",
            label: "Last line · five lanes",
            phase: "FINAL-THIRD OCCUPATION",
            title: "Occupy all five attacking lanes",
            caption: "From left to right: Di María, Mac Allister, Álvarez, Messi, and Molina.",
            positions: mergePositions(argAttack, fraBlock),
            active: ["dimaria", "macallister", "forward", "messi", "molina"],
            lanes: [
                { y: 0, height: 13.6, label: "LEFT WING" },
                { y: 13.6, height: 13.6, label: "LEFT HALF" },
                { y: 27.2, height: 13.6, label: "CENTRE" },
                { y: 40.8, height: 13.6, label: "RIGHT HALF" },
                { y: 54.4, height: 13.6, label: "RIGHT WING" }
            ]
        }
    ];

    var pressInitial = mergePositions({
        gk: point(9, 34),
        tagliafico: point(44, 9),
        otamendi: point(44, 26),
        romero: point(44, 42),
        molina: point(44, 59),
        dimaria: point(54, 9),
        macallister: point(54, 26),
        enzo: point(54, 42),
        depaul: point(54, 59),
        forward: point(64, 27),
        messi: point(64, 43)
    }, fraBuild);

    var pressSteps = [
        {
            id: "press-shape",
            label: "1 · Set 4–4–2",
            phase: "PRESSING",
            title: "Set the 4–4–2 press",
            caption: "Álvarez and Messi lead it; Di María, Mac Allister, Enzo, and De Paul hold the line behind.",
            duration: 1800,
            moves: {},
            ballPath: [point(81, 43)],
            active: ["forward", "messi", "dimaria", "macallister", "enzo", "depaul"],
            actions: [],
            zones: [
                { type: "band", x: 51, y: 5, width: 7, height: 58, tone: "neutral", label: "MIDFIELD 4" },
                { type: "band", x: 61, y: 22, width: 7, height: 26, tone: "neutral", label: "FRONT 2" }
            ]
        },
        {
            id: "press-trigger",
            label: "2 · Trigger",
            phase: "PRESS TRIGGER",
            title: "Trigger on the pass back",
            caption: "Upamecano's pass to Lloris starts the press. Álvarez and Messi step forward as the goalkeeper receives.",
            duration: 2100,
            moves: {
                forward: point(67, 29),
                messi: point(67, 41)
            },
            ballPath: [point(81, 43), point(95, 34)],
            active: ["fra_lcb", "fra_gk", "forward", "messi"],
            actions: [
                { type: "pass", label: "BACK PASS", path: [point(81, 43), point(95, 34)] }
            ],
            trigger: { cx: 95, cy: 34, radius: 7, label: "PRESS TRIGGER" }
        },
        {
            id: "press-lock",
            label: "3 · Force wide",
            phase: "LOCK THE OUTSIDE",
            title: "Force play toward Koundé",
            caption: "Álvarez curves his run to block Tchouaméni, sending Lloris wide toward Koundé.",
            duration: 2500,
            moves: {
                forward: point(80, 31),
                messi: point(75, 40),
                dimaria: point(69, 10),
                fra_rb: point(84, 9)
            },
            ballPath: [point(95, 34), point(84, 9)],
            active: ["forward", "messi", "dimaria", "fra_cm", "fra_rb", "fra_gk"],
            pressing: ["forward", "messi", "dimaria"],
            actions: [
                { type: "press", label: "CURVED PRESS", path: [point(67, 29), point(73, 24), point(80, 31)] },
                { type: "press", label: "SUPPORT PRESS", path: [point(67, 41), point(75, 40)] },
                { type: "pass", label: "PASS", path: [point(95, 34), point(84, 9)] }
            ],
            zones: [
                { type: "polygon", points: [point(80, 31), point(72, 27), point(66, 34), point(75, 40)], tone: "press", label: "COVER SHADOW · PIVOT SCREENED" },
                { type: "rect", x: 77, y: 1, width: 26, height: 14, tone: "neutral", label: "FRANCE RIGHT TOUCHLINE" }
            ],
            annotations: [
                { x: 68, y: 34, label: "TCHOUAMÉNI · SCREENED PIVOT", tone: "press" }
            ]
        },
        {
            id: "press-fallback",
            label: "4 · Recover",
            phase: "FALLBACK",
            title: "Drop if France breaks the press",
            caption: "Argentina recovers into a compact 4–4–2 behind the 59 m engagement line.",
            duration: 2600,
            moves: argMidBlock,
            ballPath: [point(84, 9), point(70, 21)],
            active: ["forward", "messi", "dimaria", "macallister", "enzo", "depaul"],
            actions: [
                { type: "recovery", label: "RECOVER", path: [point(80, 31), point(69, 29), point(59, 28)] },
                { type: "recovery", label: "RECOVER", path: [point(75, 40), point(66, 41), point(59, 42)] },
                { type: "recovery", label: "DROP", path: [point(69, 10), point(59, 10), point(51, 10)] }
            ],
            zones: [
                { type: "line", x1: 59, y1: 3, x2: 59, y2: 65, tone: "press", label: "ENGAGEMENT LINE · 59 m" },
                { type: "band", x: 39, y: 6, width: 16, height: 56, tone: "neutral", label: "COMPACT MID-BLOCK" }
            ]
        }
    ];

    var transitionInitial = mergePositions({
        gk: point(8, 34),
        tagliafico: point(27, 13),
        otamendi: point(25, 34),
        romero: point(27, 55),
        enzo: point(45, 28),
        depaul: point(48, 49),
        dimaria: point(78, 5),
        macallister: point(80, 21),
        forward: point(90, 35),
        messi: point(80, 49),
        molina: point(89, 63)
    }, fraBlock);

    var transitionSteps = [
        {
            id: "transition-before",
            label: "1 · Protect 3+2",
            phase: "BEFORE LOSS",
            title: "Keep a 3+2 behind the attack",
            caption: "Tagliafico, Otamendi, and Romero form the back three; Enzo and De Paul screen ahead.",
            duration: 1800,
            moves: {},
            ballPath: [point(80, 49)],
            active: ["tagliafico", "otamendi", "romero", "enzo", "depaul"],
            protect: ["tagliafico", "otamendi", "romero", "enzo", "depaul"],
            actions: [],
            zones: [
                { type: "polygon", points: [point(27, 13), point(25, 34), point(27, 55), point(48, 49), point(45, 28)], tone: "protect", label: "5 PROTECT · 3 + 2" }
            ]
        },
        {
            id: "transition-counterpress",
            label: "2 · Counterpress",
            phase: "ON LOSS",
            title: "Five press; five protect",
            caption: "The five nearest players close the ball. The other five protect the centre and France's first forward pass.",
            duration: 5000,
            moves: {
                molina: point(86, 58),
                depaul: point(78, 50),
                messi: point(84, 47),
                forward: point(87, 39),
                macallister: point(80, 32),
                dimaria: point(70, 13)
            },
            ballPath: [point(80, 49), point(85, 45)],
            active: ["molina", "depaul", "messi", "forward", "macallister", "tagliafico", "otamendi", "romero", "enzo", "dimaria"],
            pressing: ["molina", "depaul", "messi", "forward", "macallister"],
            protect: ["tagliafico", "otamendi", "romero", "enzo", "dimaria"],
            actions: [
                { type: "press", label: "P1", path: [point(89, 63), point(86, 58)] },
                { type: "press", label: "P2", path: [point(48, 49), point(78, 50)] },
                { type: "press", label: "P3", path: [point(80, 49), point(84, 47)] },
                { type: "press", label: "P4", path: [point(90, 35), point(87, 39)] },
                { type: "press", label: "P5", path: [point(80, 21), point(80, 32)] }
            ],
            zones: [
                { type: "circle", cx: 85, cy: 45, radius: 11, tone: "press", label: "5 PRESS" },
                { type: "polygon", points: [point(27, 13), point(25, 34), point(27, 55), point(45, 28), point(70, 13)], tone: "protect", label: "5 PROTECT" }
            ],
            countdown: true
        },
        {
            id: "transition-regain",
            label: "3 · Release",
            phase: "REGAIN",
            title: "Attack the right channel after the regain",
            caption: "Messi wins the ball and immediately releases Molina into the right channel.",
            duration: 2300,
            moves: {
                molina: point(94, 59),
                messi: point(86, 46),
                forward: point(92, 38)
            },
            ballPath: [point(85, 45), point(94, 59)],
            active: ["messi", "molina", "forward"],
            actions: [
                { type: "pass", label: "RELEASE", path: [point(85, 45), point(94, 59)] },
                { type: "run", label: "CHANNEL RUN", path: [point(86, 58), point(94, 59)] }
            ],
            zones: [
                { type: "rect", x: 81, y: 53, width: 22, height: 13, tone: "neutral", label: "ARGENTINA RIGHT CHANNEL" }
            ]
        }
    ];

    function ownerTeam(ownerId) {
        var value = String(ownerId || "");
        var separator = value.indexOf("_");
        return separator === -1 ? value : value.slice(0, separator);
    }

    function namedSegmentOwners(owners, segmentIndex) {
        var fromOwner = owners[segmentIndex];
        var toOwner = owners[segmentIndex + 1];
        var index;
        if (!fromOwner) {
            for (index = segmentIndex - 1; index >= 0; index -= 1) {
                if (owners[index]) {
                    fromOwner = owners[index];
                    break;
                }
            }
        }
        if (!toOwner) {
            for (index = segmentIndex + 2; index < owners.length; index += 1) {
                if (owners[index]) {
                    toOwner = owners[index];
                    break;
                }
            }
        }
        return { from: fromOwner, to: toOwner };
    }

    function compileSequence(initialPositions, initialBall, steps) {
        var positions = model.copyPositions(initialPositions);
        var ball = point(initialBall.xMeters, initialBall.yMeters);
        var ballOwner = null;
        var elapsed = 0;

        var compiledSteps = steps.map(function (step) {
            if (!Number.isFinite(step.duration) || step.duration <= 0) {
                throw new Error(step.id + " requires a positive duration.");
            }
            var startPositions = model.copyPositions(positions);
            Object.keys(step.moves || {}).forEach(function (id) {
                if (!startPositions[id]) {
                    throw new Error(step.id + " moves unknown player " + id + ".");
                }
            });
            var endPositions = mergeIntoPositions(startPositions, step.moves || {});
            var ballPath = (step.ballPath || [ball]).map(function (pathPoint) {
                return point(pathPoint.xMeters, pathPoint.yMeters);
            });
            if (!model.pointsEqual(ballPath[0], ball)) {
                throw new Error(step.id + " ball path does not continue from the previous step.");
            }
            ballPath.forEach(function (pathPoint) {
                if (!model.isPointOnPitch(pathPoint)) {
                    throw new Error(step.id + " contains an out-of-bounds ball coordinate.");
                }
            });
            if (step.ballOwners) {
                if (step.ballOwners.length !== ballPath.length) {
                    throw new Error(step.id + " requires one ball owner entry per waypoint.");
                }
                step.ballOwners.forEach(function (ownerId, waypointIndex) {
                    if (ownerId !== null && !startPositions[ownerId]) {
                        throw new Error(
                            step.id + " assigns waypoint " + waypointIndex +
                            " to an unknown player."
                        );
                    }
                });
                if (!step.ballSegmentTypes ||
                        step.ballSegmentTypes.length !==
                            Math.max(0, ballPath.length - 1)) {
                    throw new Error(step.id + " requires one ball segment type per movement.");
                }
                step.ballSegmentTypes.forEach(function (segmentType, segmentIndex) {
                    var namedOwners = namedSegmentOwners(
                        step.ballOwners,
                        segmentIndex
                    );
                    var sameOwner = namedOwners.from === namedOwners.to;
                    var sameTeam =
                        ownerTeam(namedOwners.from) === ownerTeam(namedOwners.to);
                    var valid = (
                        segmentType === "carry" && sameOwner
                    ) || (
                        segmentType === "pass" && !sameOwner && sameTeam
                    ) || (
                        segmentType === "recovery" &&
                        ownerTeam(namedOwners.from) === "op" &&
                        ownerTeam(namedOwners.to) === "us"
                    ) || (
                        segmentType === "loss" &&
                        ownerTeam(namedOwners.from) === "us" &&
                        ownerTeam(namedOwners.to) === "op"
                    );
                    if (!valid) {
                        throw new Error(
                            step.id + " has ownership inconsistent with " +
                            segmentType + "."
                        );
                    }
                    if ((!step.ballOwners[segmentIndex] ||
                            !step.ballOwners[segmentIndex + 1]) &&
                            segmentType !== "pass") {
                        throw new Error(
                            step.id + " uses an ownerless bend outside a pass."
                        );
                    }
                });
                if (!step.ballOwners[0] ||
                        !model.pointsEqual(ballPath[0], startPositions[step.ballOwners[0]])) {
                    throw new Error(step.id + " does not start on its named ball owner.");
                }
                if (ballOwner && step.ballOwners[0] !== ballOwner) {
                    throw new Error(step.id + " changes owner between continuous steps.");
                }
                var finalOwner = step.ballOwners[step.ballOwners.length - 1];
                if (!finalOwner ||
                        !model.pointsEqual(
                            ballPath[ballPath.length - 1],
                            endPositions[finalOwner]
                        )) {
                    throw new Error(step.id + " does not finish on its named ball owner.");
                }
                ballOwner = finalOwner;
            }
            if (step.ballCarrier) {
                var carrier = step.ballCarrier;
                if (!startPositions[carrier.playerId]) {
                    throw new Error(step.id + " assigns the ball to an unknown player.");
                }
                if (carrier.fromWaypoint < 0 || carrier.fromWaypoint >= ballPath.length) {
                    throw new Error(step.id + " has an invalid carrier waypoint.");
                }
                if (!model.pointsEqual(
                    ballPath[ballPath.length - 1],
                    endPositions[carrier.playerId]
                )) {
                    throw new Error(step.id + " ball carrier does not finish with the ball.");
                }
            }
            var compiled = Object.assign({}, step, {
                startPositions: startPositions,
                endPositions: endPositions,
                startTime: elapsed,
                endTime: elapsed + step.duration,
                ballPath: ballPath
            });
            positions = endPositions;
            ball = ballPath[ballPath.length - 1];
            elapsed += step.duration;
            return compiled;
        });

        return {
            initialPositions: model.copyPositions(initialPositions),
            steps: compiledSteps,
            duration: elapsed
        };
    }

    var sequences = {
        attack: compileSequence(attackInitial, point(8, 34), attackSteps),
        press: compileSequence(pressInitial, point(81, 43), pressSteps),
        transition: compileSequence(transitionInitial, point(80, 49), transitionSteps)
    };

    var scenarios = {
        prematch: {
            plan: "Controlled possession, then a right-side overload",
            confidence: 78,
            why: "Draw France inside, release Messi in the right half-space, then send Molina outside for a low cutback."
        },
        leading: {
            plan: "Compact control with selective right-channel releases",
            confidence: 82,
            why: "Protect the centre first, then use the space France leaves as they advance."
        },
        drawing: {
            plan: "Controlled overload with an earlier Molina release",
            confidence: 75,
            why: "Keep the right-side route, but release Molina earlier while the 3–2 rest defence stays intact."
        },
        trailing: {
            plan: "Aggressive 3–2–5 with an immediate counterpress",
            confidence: 69,
            why: "Occupy five attacking lanes and counterpress immediately, accepting more transition risk."
        }
    };

    var stateControl = room.querySelector("[data-coach-state]");
    var playerControl = room.querySelector("[data-coach-player]");
    var tacticalStage = room.querySelector("[data-tactical-stage]");
    var presentationPanel = room.querySelector("[data-presentation-panel]");
    var coachTool = room.querySelector("[data-coach-tool]");
    var pitch = room.querySelector("[data-coach-pitch]");
    var playersLayer = room.querySelector("[data-pitch-players]");
    var ballNode = room.querySelector("[data-coach-ball]");
    var zonesLayer = room.querySelector("[data-svg-zones]");
    var completedActionsLayer = room.querySelector("[data-svg-completed-actions]");
    var currentActionsLayer = room.querySelector("[data-svg-current-actions]");
    var annotationsLayer = room.querySelector("[data-svg-annotations]");
    var substateControls = room.querySelector("[data-tactic-substates]");
    var phaseLabel = room.querySelector("[data-pitch-phase]");
    var pitchDescription = room.querySelector("[data-pitch-description]");
    var animationTitle = room.querySelector("[data-animation-title]");
    var animationCopy = room.querySelector("[data-animation-copy]");
    var animationPlay = room.querySelector("[data-animation-play]");
    var animationPrevious = room.querySelector("[data-animation-previous]");
    var animationNext = room.querySelector("[data-animation-next]");
    var animationScrubber = room.querySelector("[data-animation-scrubber]");
    var animationTime = room.querySelector("[data-animation-time]");
    var animationDurationNode = room.querySelector("[data-animation-duration]");
    var animationControls = room.querySelector(".coach-animation__controls");
    var animationTimeline = room.querySelector(".coach-timeline");
    var tacticalTooltip = room.querySelector("[data-tactical-tooltip]");
    var playerReportData = room.querySelector("[data-player-report-data]");
    var planName = room.querySelector("[data-plan-name]");
    var planWhy = room.querySelector("[data-plan-why]");
    var confidence = room.querySelector("[data-confidence]");
    var statusNode = room.querySelector("[data-coach-status]");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var playerReports = {};
    var playerReportBase = playerReportData
        ? playerReportData.dataset.reportBase
        : "";

    if (playerReportData) {
        try {
            playerReports = JSON.parse(playerReportData.textContent);
        } catch (error) {
            console.warn("Player reports could not be loaded.", error);
        }
    }

    // Full knockout player index (name each player goes by, imported report
    // description, and report slug), keyed by StatsBomb player id.
    var playerIndexData = room.querySelector("[data-player-index]");
    var playerIndex = {};
    if (playerIndexData) {
        try {
            playerIndex = JSON.parse(playerIndexData.textContent);
        } catch (error) {
            console.warn("Player index could not be loaded.", error);
        }
    }
    // id -> goes-by name, so the recommendation names players exactly like the board.
    var playerGoesBy = {};
    Object.keys(playerIndex).forEach(function (id) {
        if (playerIndex[id] && playerIndex[id].name) playerGoesBy[id] = playerIndex[id].name;
    });

    // Full appearance squads so generated XIs fill with real players.
    var squadsData = room.querySelector("[data-squads]");
    var squads = {};
    if (squadsData) {
        try {
            squads = JSON.parse(squadsData.textContent);
        } catch (error) {
            console.warn("Squads could not be loaded.", error);
        }
    }

    var activeView = "attack";
    var viewProgress = { attack: 0, press: 0, transition: 0 };
    var formationIndex = 0;
    var animationFrame = 0;
    var animationStartedAt = 0;
    var animationBaseProgress = 0;
    var tooltipPinned = false;
    var tooltipHideTimer = 0;
    var currentPositions = model.copyPositions(attackInitial);
    var playerNodes = {};
    var activeTooltipId = null;
    var lastSequenceRender = { view: null, index: -1, triggerVisible: null };

    // --- Matchup engine ---------------------------------------------------
    // Enrich the hand-authored flagship roster so headshots and side
    // classification read from per-player fields (generated rosters carry the
    // same fields), then snapshot it as the untouched Argentina-France plan.
    Object.keys(roster).forEach(function (id) {
        roster[id].espnId = espnIds[id] || null;
        roster[id].wikiTitle = wikiTitles[id] || roster[id].name;
        roster[id].isOurs = roster[id].team === "ARG";
    });

    var FLAGSHIP = {
        roster: roster,
        sequences: sequences,
        scenarios: scenarios,
        formationStates: formationStates
    };
    var currentMatchup = { ourCode: "ARG", oppCode: "FRA" };

    var teamsByCode = {};
    (function () {
        var node = room.querySelector("[data-matchup-data]");
        if (!node) return;
        try {
            (JSON.parse(node.textContent).teams || []).forEach(function (team) {
                teamsByCode[team.code] = team;
            });
        } catch (error) { /* the selector still works without the coach engine */ }
    })();

    // Scenario nudge for the hand-authored flagship: shift our shape forward
    // when chasing, drop it when protecting a lead. Generated plans bake this in.
    var FLAGSHIP_SHIFT = { prematch: 0, leading: -6, drawing: 2, trailing: 7 };

    function isFlagshipMatchup(ourCode, oppCode) {
        // The hand-authored flagship is specifically Argentina's point of view.
        // France vs Argentina must use the generated France plan; treating this
        // check as order-independent makes a flipped board silently keep showing
        // Argentina's players, roles, recommendation and choreography.
        return ourCode === "ARG" && oppCode === "FRA";
    }

    function shiftPositions(map, dx, ourIds) {
        var out = {};
        Object.keys(map).forEach(function (id) {
            var p = map[id];
            out[id] = ourIds[id]
                ? point(model.clamp(p.xMeters + dx, 6, 100), p.yMeters)
                : point(p.xMeters, p.yMeters);
        });
        return out;
    }

    function shiftSequence(sequence, dx, ourIds) {
        if (!dx) return sequence;
        return {
            initialPositions: shiftPositions(sequence.initialPositions, dx, ourIds),
            duration: sequence.duration,
            steps: sequence.steps.map(function (step) {
                return Object.assign({}, step, {
                    startPositions: shiftPositions(step.startPositions, dx, ourIds),
                    endPositions: shiftPositions(step.endPositions, dx, ourIds)
                });
            })
        };
    }

    function flagshipPlan(scenarioKey) {
        var dx = FLAGSHIP_SHIFT[scenarioKey] || 0;
        var ourIds = {};
        Object.keys(FLAGSHIP.roster).forEach(function (id) {
            if (FLAGSHIP.roster[id].isOurs) ourIds[id] = true;
        });
        return {
            roster: FLAGSHIP.roster,
            sequences: {
                attack: shiftSequence(FLAGSHIP.sequences.attack, dx, ourIds),
                press: shiftSequence(FLAGSHIP.sequences.press, dx, ourIds),
                transition: shiftSequence(FLAGSHIP.sequences.transition, dx, ourIds)
            },
            formationStates: FLAGSHIP.formationStates,
            planText: FLAGSHIP.scenarios[scenarioKey]
        };
    }

    function generatedPlan(ourCode, oppCode, scenarioKey) {
        var gen = window.WorldsCoachPlanner.generate({
            teams: teamsByCode, squads: squads, names: playerGoesBy,
            ourCode: ourCode, oppCode: oppCode, scenario: scenarioKey
        });
        var genRoster = {};
        Object.keys(gen.roster).forEach(function (id) {
            var r = gen.roster[id];
            // Enrich from the knockout player index: goes-by name, report
            // description and report slug, keyed by StatsBomb id.
            var idx = r.playerId ? playerIndex[r.playerId] : null;
            var isRated = idx && typeof idx.rating === "number";
            var meta = "";
            if (idx && isRated) {
                var bits = [];
                if (idx.rankingProduct === "goalkeeper") {
                    if (idx.goalkeeperRank) bits.push("GK #" + idx.goalkeeperRank);
                    bits.push(idx.rating.toFixed(3) + " GK value");
                } else {
                    if (idx.globalRank) bits.push("Global #" + idx.globalRank);
                    if (idx.teamRank) bits.push("Team #" + idx.teamRank);
                    bits.push(idx.rating.toFixed(3) + " outfield score");
                }
                if (idx.minutes) bits.push(idx.minutes + "′");
                meta = bits.join(" · ");
            }
            // Unrated squad players are shown by name + position, with an honest
            // note that they were below the individual-rating minutes floor.
            var description = isRated ? idx.strength
                : (idx ? "Squad player — below the active ranking eligibility floor."
                    : (r.instruction || ""));
            genRoster[id] = {
                team: r.team, isOurs: r.isOurs, number: r.number,
                isPlaceholder: r.isPlaceholder || false,
                name: idx ? idx.name : r.displayName,
                surname: idx ? idx.surname : r.surname,
                role: idx ? (idx.role || r.role) : r.role,
                instruction: description,
                overview: idx && isRated ? idx.overview : "",
                meta: meta,
                reportSlug: idx ? idx.slug : null,
                wikiTitle: idx ? (idx.wiki || idx.name) : (r.wikiTitle || r.displayName),
                rating: isRated ? idx.rating : (typeof r.rating === "number" ? r.rating : null),
                espnId: null
            };
        });
        return {
            roster: genRoster,
            sequences: {
                attack: compileSequence(gen.attack.initial, gen.attack.ball, gen.attack.steps),
                press: compileSequence(gen.press.initial, gen.press.ball, gen.press.steps),
                transition: compileSequence(gen.transition.initial, gen.transition.ball, gen.transition.steps)
            },
            formationStates: gen.formationStates,
            planText: gen.scenarioText
        };
    }

    function buildPlan(ourCode, oppCode, scenarioKey) {
        if (isFlagshipMatchup(ourCode, oppCode) ||
            !window.WorldsCoachPlanner || !teamsByCode[ourCode] || !teamsByCode[oppCode]) {
            return flagshipPlan(scenarioKey);
        }
        return generatedPlan(ourCode, oppCode, scenarioKey);
    }

    function applyPlan(scenarioKey, rebuildNodes) {
        var plan;
        try {
            plan = buildPlan(currentMatchup.ourCode, currentMatchup.oppCode, scenarioKey);
        } catch (error) {
            console.warn("Could not build the game plan; keeping the current one.", error);
            return;
        }
        roster = plan.roster;
        sequences = plan.sequences;
        formationStates = plan.formationStates;
        if (rebuildNodes) createPlayerNodes();
        var text = plan.planText;
        updateRoleCards(text);
        updateForwardRoster();
        var lautaroPenalty = (isFlagshipMatchup(currentMatchup.ourCode, currentMatchup.oppCode) &&
            playerControl && playerControl.value === "lautaro") ? -2 : 0;
        var shownConfidence = text.confidence + lautaroPenalty;
        planName.textContent = text.plan;
        planWhy.textContent = text.why;
        confidence.textContent = shownConfidence + "%";
        updateView(activeView);
        var statusPlan = String(text.plan || "").trim();
        statusNode.textContent = "Plan updated: " + statusPlan +
            (/[.!?]$/.test(statusPlan) ? " " : ". ") +
            "Illustrative confidence " + shownConfidence + "%.";
    }

    function applyMatchup(ourCode, oppCode) {
        currentMatchup = { ourCode: ourCode, oppCode: oppCode };
        // A new point of view is a new plan. Do not strand the opponent on the
        // final frame of the sequence the user just reviewed before flipping.
        viewProgress = { attack: 0, press: 0, transition: 0 };
        formationIndex = 0;
        var ourName = (teamsByCode[ourCode] && teamsByCode[ourCode].name) || ourCode;
        var oppName = (teamsByCode[oppCode] && teamsByCode[oppCode].name) || oppCode;
        var titleEl = room.querySelector("#coach-pitch-title");
        if (titleEl) titleEl.textContent = ourName + " tactical plan against " + oppName;
        if (pitch) {
            pitch.setAttribute("aria-label", ourName + " tactical pitch. " + ourName +
                " attacks from left to right; " + ourName + "'s right side is the lower half.");
        }
        var directionEl = room.querySelector("[data-pitch-direction]");
        if (directionEl) directionEl.innerHTML = escapeHtml(ourName) + " attacks <b>→</b>";

        // Scenario labels name the current team, not always Argentina.
        var stateLabels = {
            prematch: "Pre-match, 0–0", drawing: "70', level",
            leading: "70', " + ourName + " leading",
            trailing: "70', " + ourName + " trailing"
        };
        Array.prototype.forEach.call(stateControl.options, function (opt) {
            if (stateLabels[opt.value]) opt.textContent = stateLabels[opt.value];
        });
        // The Álvarez ↔ Lautaro swap only makes sense for the Argentina flagship.
        var forwardLabel = playerControl && playerControl.closest
            ? playerControl.closest("label") : null;
        if (forwardLabel) forwardLabel.hidden = !isFlagshipMatchup(ourCode, oppCode);

        applyPlan(stateControl.value, true);
    }
    var pitchResizeFrame = 0;
    var pitchResizeObserver = null;

    function invalidateSequenceCache() {
        lastSequenceRender.view = null;
        lastSequenceRender.index = -1;
        lastSequenceRender.triggerVisible = null;
    }

    function queuePitchReflow() {
        if (pitchResizeFrame) window.cancelAnimationFrame(pitchResizeFrame);
        pitchResizeFrame = window.requestAnimationFrame(function () {
            pitchResizeFrame = 0;
            invalidateSequenceCache();
            if (activeView === "formation") renderFormation(formationIndex);
            else renderSequence(activeView, viewProgress[activeView]);
        });
    }

    function setText(selector, value) {
        var element = room.querySelector(selector);
        if (element) element.textContent = value;
    }

    function playerReportFor(id) {
        if (id === "forward" && playerControl.value === "lautaro") return null;
        if (playerReports[id]) return playerReports[id];
        // Generated teams carry a report slug on the roster entry.
        var entry = roster[id];
        if (entry && entry.reportSlug) return { slug: entry.reportSlug };
        return null;
    }

    function formatTime(milliseconds) {
        var totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    function sentenceCase(value) {
        var text = String(value || "").toLowerCase();
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    // A short tactical brief derived from a player's functional role.
    function jobForRole(role) {
        var s = String(role || "").toLowerCase();
        if (s.indexOf("keeper") !== -1) return "Sweep and start the build";
        if (s.indexOf("wing-back") !== -1 || s.indexOf("wingback") !== -1 ||
            s.indexOf("full-back") !== -1 || s.indexOf("fullback") !== -1) return "Overlap and hold the width";
        if (s.indexOf("back") !== -1 || s.indexOf("sweeper") !== -1) return "Hold the line, step out";
        if (s.indexOf("winger") !== -1 || s.indexOf("wing") !== -1 || s.indexOf("wide") !== -1) return "Take your man on, reach the byline";
        if (s.indexOf("target") !== -1 || s.indexOf("striker") !== -1 ||
            s.indexOf("forward") !== -1 || s.indexOf("poacher") !== -1 || s.indexOf("finish") !== -1) return "Lead the line, attack the box";
        if (s.indexOf("playmak") !== -1 || s.indexOf("creat") !== -1 || s.indexOf("attacking") !== -1) return "Find the pocket, release the runners";
        if (s.indexOf("ball-winner") !== -1 || s.indexOf("defensive") !== -1 || s.indexOf("engine") !== -1 ||
            s.indexOf("box-to-box") !== -1 || s.indexOf("deep") !== -1 || s.indexOf("regista") !== -1) return "Screen the defence, win it back";
        return "Support the play, keep the shape";
    }

    var roleGridOriginal = null;

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

    // The Player-roles cards show the CURRENT team's key players. The Argentina
    // flagship keeps its hand-authored cards; every other team populates the
    // four cards with its four highest-rated players.
    function updateRoleCards(planText) {
        var grid = room.querySelector(".coach-role-grid");
        if (!grid) return;
        if (roleGridOriginal === null) roleGridOriginal = grid.innerHTML;
        var flagship = isFlagshipMatchup(currentMatchup.ourCode, currentMatchup.oppCode);
        if (flagship) {
            if (grid.innerHTML !== roleGridOriginal) grid.innerHTML = roleGridOriginal;
            grid.querySelectorAll("[data-role-card]").forEach(function (card) {
                if (card.dataset.roleCard !== "forward") loadRolePhoto(card);
            });
            return;
        }
        var ourIds = Object.keys(roster).filter(function (id) {
            return id.indexOf("us_") === 0 && !roster[id].isPlaceholder;
        }).sort(function (a, b) {
            return (roster[b].rating || 0) - (roster[a].rating || 0);
        });
        // The recommendation's focal player must also appear in Player roles,
        // even when four teammates have a higher imported rating.
        var recommendationCopy = planText
            ? String(planText.plan || "") + " " + String(planText.why || "")
            : "";
        var focalPlayer = planText ? planText.focalPlayer : "";
        var focalId = focalPlayer
            ? ourIds.find(function (id) {
                return roster[id].name &&
                    playerNameMatches(roster[id].name, focalPlayer);
            })
            : ourIds.find(function (id) {
                return roster[id].name &&
                    recommendationCopy.indexOf(roster[id].name) !== -1;
            });
        if (focalId) {
            ourIds = [focalId].concat(ourIds.filter(function (id) {
                return id !== focalId;
            }));
        }
        grid.querySelectorAll("[data-role-card]").forEach(function (card, i) {
            var id = ourIds[i];
            if (!id) { card.hidden = true; return; }
            card.hidden = false;
            var pl = roster[id];
            var h3 = card.querySelector("h3");
            var pEl = card.querySelector("div p");
            var strong = card.querySelector("strong");
            var num = card.querySelector(".coach-role-number");
            var img = card.querySelector(".coach-role-photo");
            if (h3) h3.textContent = pl.name;
            if (pEl) pEl.textContent = pl.role;
            if (strong) strong.textContent = jobForRole(pl.role);
            if (num) num.textContent = pl.number;
            card.dataset.roleCard = id; // so loadPhotoInto resolves this slot's player
            if (img) {
                img.onload = function () { card.classList.add("has-photo"); };
                loadPhotoInto(img, id, function () {
                    card.classList.remove("has-photo");
                    img.removeAttribute("src");
                });
            }
        });
    }

    function updateForwardRoster() {
        // The Álvarez ↔ Lautaro swap only applies to the Argentina flagship plan.
        if (!isFlagshipMatchup(currentMatchup.ourCode, currentMatchup.oppCode) || !roster.forward) return;
        var lautaro = playerControl.value === "lautaro";
        roster.forward = {
            team: "ARG",
            isOurs: true,
            espnId: lautaro ? espnIds.lautaro : espnIds.forward,
            wikiTitle: lautaro ? wikiTitles.lautaro : wikiTitles.forward,
            number: lautaro ? 22 : 9,
            name: lautaro ? "Lautaro Martínez" : "Julián Álvarez",
            surname: lautaro ? "Lautaro" : "Álvarez",
            role: lautaro ? "Reference striker" : "Depth-running forward",
            instruction: lautaro
                ? "Pin both centre-backs and offer the wall pass."
                : "Pin the centre-backs and attack the cutback zone."
        };

        var forwardNode = playerNodes.forward;
        if (forwardNode) updatePlayerNode(forwardNode, "forward");
        setText("[data-role-forward-number]", String(roster.forward.number));
        setText("[data-role-forward-name]", roster.forward.name);
        setText("[data-role-forward-role]", roster.forward.role);
        setText("[data-role-forward-job]", lautaro ? "Pin both centre-backs" : "Pin the centre-back");
        setText("[data-lineup-fit]", lautaro ? "82%" : "86%");

        var forwardCard = room.querySelector('[data-role-card="forward"]');
        if (forwardCard) loadRolePhoto(forwardCard);
    }

    function updatePlayerNode(node, id) {
        var player = roster[id];
        var marker = node.querySelector(".coach-marker");
        var number = marker.querySelector("b");
        var surname = node.querySelector("small");
        number.textContent = player.number;
        surname.textContent = player.surname;
        node.setAttribute(
            "aria-label",
            player.name + ", number " + player.number + ", " + player.role + ". " +
            player.instruction + " Activate for player details and report."
        );
    }

    function positionTooltip(id) {
        var position = currentPositions[id];
        if (!position) return;
        var percent = model.pointToPercent(position);
        tacticalTooltip.style.setProperty("--tooltip-x", model.clamp(percent.x, 22, 78) + "%");
        tacticalTooltip.style.setProperty("--tooltip-y", model.clamp(percent.y, 8, 92) + "%");
        tacticalTooltip.classList.toggle("is-above", percent.y > 42);
    }

    function showPlayerTooltip(node, id, pin) {
        var player = roster[id];
        var position = currentPositions[id];
        if (!player || !position) return;
        if (tooltipHideTimer) {
            window.clearTimeout(tooltipHideTimer);
            tooltipHideTimer = 0;
        }
        var report = playerReportFor(id);
        var reportLink = report
            ? '<a class="coach-report-link" href="' + playerReportBase + report.slug +
                '/" target="_blank" rel="noopener">Open player report ↗</a>'
            : "";
        var metaLine = player.meta
            ? '<em class="coach-tooltip-meta">' + escapeHtml(player.meta) + "</em>"
            : "";
        var description = player.instruction
            ? "<small>" + escapeHtml(player.instruction) + "</small>"
            : "";
        tacticalTooltip.innerHTML =
            '<img class="coach-tooltip-photo" alt="">' +
            '<div class="coach-tooltip-copy"><strong>' + escapeHtml(player.name) + " · " + player.number +
            "</strong><span>" + escapeHtml(player.role) + "</span>" + metaLine +
            description + reportLink + "</div>";
        tacticalTooltip.setAttribute("aria-label", player.name + " details");
        tacticalTooltip.classList.add("has-photo");
        activeTooltipId = id;
        var tooltipPhoto = tacticalTooltip.querySelector(".coach-tooltip-photo");
        loadPhotoInto(tooltipPhoto, id, function () {
            if (activeTooltipId === id && tooltipPhoto.isConnected) {
                tooltipPhoto.remove();
                tacticalTooltip.classList.remove("has-photo");
            }
        });
        positionTooltip(id);
        tacticalTooltip.hidden = false;
        tooltipPinned = Boolean(pin);
        playersLayer.querySelectorAll(".coach-player").forEach(function (playerNode) {
            playerNode.setAttribute("aria-expanded", String(playerNode === node));
        });
    }

    function hidePlayerTooltip(force) {
        if (tooltipPinned && !force) return;
        if (tooltipHideTimer) {
            window.clearTimeout(tooltipHideTimer);
            tooltipHideTimer = 0;
        }
        tacticalTooltip.hidden = true;
        tooltipPinned = false;
        activeTooltipId = null;
        playersLayer.querySelectorAll(".coach-player").forEach(function (node) {
            node.setAttribute("aria-expanded", "false");
        });
    }

    function schedulePlayerTooltipHide() {
        if (tooltipPinned) return;
        if (tooltipHideTimer) window.clearTimeout(tooltipHideTimer);
        tooltipHideTimer = window.setTimeout(function () {
            tooltipHideTimer = 0;
            hidePlayerTooltip(false);
        }, 180);
    }

    function cancelPlayerTooltipHide() {
        if (!tooltipHideTimer) return;
        window.clearTimeout(tooltipHideTimer);
        tooltipHideTimer = 0;
    }

    // National-flag disc per nation (recognisable at marker scale) + a number
    // colour that reads on the centre of each flag. Every dot shows its own
    // country's flag, so knockout matchups no longer reuse Argentina/France.
    var FLAGS = {
        ARG: { grad: "linear-gradient(180deg,#74acdf 0 33.34%,#ffffff 33.34% 66.67%,#74acdf 66.67%)", num: "#0b3563" },
        FRA: { grad: "linear-gradient(90deg,#002395 0 33.34%,#ffffff 33.34% 66.67%,#ed2939 66.67%)", num: "#10203f" },
        BRA: { grad: "radial-gradient(circle at 50% 50%,#002776 0 21%,#ffdf00 21% 46%,#009c3b 46%)", num: "#ffffff" },
        CRO: { grad: "linear-gradient(180deg,#ff0000 0 33.34%,#ffffff 33.34% 66.67%,#171796 66.67%)", num: "#14143c" },
        NED: { grad: "linear-gradient(180deg,#ae1c28 0 33.34%,#ffffff 33.34% 66.67%,#21468b 66.67%)", num: "#1b2f5e" },
        MAR: { grad: "radial-gradient(circle at 50% 50%,#0a6b3a 0 15%,#c1272d 15%)", num: "#ffffff" },
        POR: { grad: "linear-gradient(90deg,#006600 0 40%,#d10a11 40%)", num: "#ffffff" },
        ESP: { grad: "linear-gradient(180deg,#aa151b 0 25%,#f1bf00 25% 75%,#aa151b 75%)", num: "#7a0f13" },
        ENG: { grad: "linear-gradient(0deg,transparent 40%,#cf142b 40% 60%,transparent 60%),linear-gradient(90deg,transparent 40%,#cf142b 40% 60%,transparent 60%),#ffffff", num: "#ffffff" },
        USA: { grad: "linear-gradient(180deg,#3c3b6e 0 42%,#b22234 42% 58%,#ffffff 58% 74%,#b22234 74%)", num: "#ffffff" },
        POL: { grad: "linear-gradient(180deg,#ffffff 50%,#dc143c 50%)", num: "#c8102e" },
        SEN: { grad: "linear-gradient(90deg,#00853f 0 33.34%,#fdef42 33.34% 66.67%,#e31b23 66.67%)", num: "#0a6b34" },
        JPN: { grad: "radial-gradient(circle at 50% 50%,#bc002d 0 32%,#ffffff 32%)", num: "#ffffff" },
        KOR: { grad: "radial-gradient(circle at 50% 50%,#cd2e3a 0 15%,#0047a0 15% 30%,#ffffff 30%)", num: "#ffffff" },
        SUI: { grad: "linear-gradient(0deg,transparent 42%,#ffffff 42% 58%,transparent 58%),linear-gradient(90deg,transparent 42%,#ffffff 42% 58%,transparent 58%),#da291c", num: "#b31b1b" },
        AUS: { grad: "linear-gradient(135deg,#00247d,#001a5e)", num: "#ffffff" },
        _default: { grad: "linear-gradient(135deg,#5b6472,#3a4150)", num: "#ffffff" }
    };

    function createPlayerNodes() {
        playersLayer.innerHTML = "";
        playerNodes = {};
        Object.keys(roster).forEach(function (id) {
            var player = roster[id];
            var button = document.createElement("button");
            var marker = document.createElement("span");
            var number = document.createElement("b");
            var surname = document.createElement("small");
            button.type = "button";
            button.className = "coach-player " + (player.isOurs ? "is-team" : "is-opponent") +
                (player.isPlaceholder ? " is-placeholder" : "");
            button.dataset.playerId = id;
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-controls", "coach-player-tooltip");
            marker.className = "coach-marker " + (player.isOurs ? "is-team" : "is-opponent");
            var flag = FLAGS[player.team] || FLAGS._default;
            if (player.isPlaceholder) {
                // Unrated depth: hollow neutral disc so it recedes behind the
                // real flagged players.
                marker.style.background = "rgba(140, 142, 150, 0.28)";
                marker.style.color = "rgba(247, 242, 233, 0.85)";
            } else {
                // A soft dark scrim sits under the number so a white number is
                // legible on any flag — even a white centre stripe (Croatia,
                // France, Netherlands) — while the flag colours still read as a
                // ring around it.
                var scrim = "radial-gradient(circle at 50% 50%, rgba(8,6,10,0.82) 0%, rgba(8,6,10,0.74) 38%, rgba(8,6,10,0) 64%)";
                marker.style.background = scrim + ", " + flag.grad;
                marker.style.color = "#ffffff";
            }
            number.textContent = player.number;
            surname.textContent = player.surname;
            marker.appendChild(number);
            button.appendChild(marker);
            button.appendChild(surname);
            updatePlayerNode(button, id);
            button.addEventListener("mouseenter", function () {
                cancelPlayerTooltipHide();
                showPlayerTooltip(button, id, false);
            });
            button.addEventListener("mouseleave", function () {
                schedulePlayerTooltipHide();
            });
            button.addEventListener("focus", function () {
                cancelPlayerTooltipHide();
                showPlayerTooltip(button, id, false);
            });
            button.addEventListener("blur", function () {
                schedulePlayerTooltipHide();
            });
            button.addEventListener("click", function (event) {
                event.stopPropagation();
                showPlayerTooltip(button, id, true);
            });
            playerNodes[id] = button;
            playersLayer.appendChild(button);
        });
        pitch.addEventListener("click", function () {
            hidePlayerTooltip(true);
        });
    }

    function updatePlayerPositions(positions, state) {
        currentPositions = model.copyPositions(positions);
        var pressing = (state.pressing || []);
        var protect = (state.protect || []);
        var active = (state.active || []);
        var pressIndex = {};
        var protectIndex = {};
        pressing.forEach(function (id, index) { pressIndex[id] = index + 1; });
        protect.forEach(function (id, index) { protectIndex[id] = index + 1; });

        Object.keys(positions).forEach(function (id) {
            var node = playerNodes[id];
            if (!node) return;
            var percent = model.pointToPercent(positions[id]);
            node.style.setProperty("--x", percent.x + "%");
            node.style.setProperty("--y", percent.y + "%");
            node.classList.toggle("is-active", active.indexOf(id) !== -1);
            node.classList.toggle("is-pressing", pressing.indexOf(id) !== -1);
            node.classList.toggle("is-protecting", protect.indexOf(id) !== -1);
            if (pressIndex[id]) {
                node.dataset.badge = "P" + pressIndex[id];
            } else if (protectIndex[id]) {
                node.dataset.badge = "R" + protectIndex[id];
            } else {
                delete node.dataset.badge;
            }
        });
    }

    function updateBall(pointValue) {
        var percent = model.pointToPercent(pointValue);
        ballNode.style.setProperty("--x", percent.x + "%");
        ballNode.style.setProperty("--y", percent.y + "%");
    }

    function pathData(path, curved) {
        if (!path || !path.length) return "";
        if (curved && path.length === 3) {
            return "M " + path[0].xMeters + " " + path[0].yMeters +
                " Q " + path[1].xMeters + " " + path[1].yMeters +
                " " + path[2].xMeters + " " + path[2].yMeters;
        }
        return path.map(function (pathPoint, index) {
            return (index ? "L " : "M ") + pathPoint.xMeters + " " + pathPoint.yMeters;
        }).join(" ");
    }

    function actionMarker(type) {
        if (type === "press" || type === "recovery" || type === "loss") {
            return "url(#coach-arrow-red)";
        }
        if (type === "protect") return "url(#coach-arrow-green)";
        return "url(#coach-arrow-blue)";
    }

    function actionLabelPlacement(action) {
        var path = action.path;
        var curved = (action.type === "carry" || action.type === "press") && path.length === 3;
        var x;
        var y;
        var angle;

        if (curved) {
            var start = path[0];
            var control = path[1];
            var end = path[2];
            x = 0.25 * start.xMeters + 0.5 * control.xMeters + 0.25 * end.xMeters;
            y = 0.25 * start.yMeters + 0.5 * control.yMeters + 0.25 * end.yMeters;
            angle = Math.atan2(
                end.yMeters - start.yMeters,
                end.xMeters - start.xMeters
            ) * 180 / Math.PI;
        } else {
            var segmentLengths = [];
            var totalLength = 0;
            var index;

            for (index = 1; index < path.length; index += 1) {
                var segmentLength = Math.hypot(
                    path[index].xMeters - path[index - 1].xMeters,
                    path[index].yMeters - path[index - 1].yMeters
                );
                segmentLengths.push(segmentLength);
                totalLength += segmentLength;
            }

            var midpoint = totalLength / 2;
            var traversed = 0;

            for (index = 0; index < segmentLengths.length; index += 1) {
                if (traversed + segmentLengths[index] >= midpoint) {
                    var segmentStart = path[index];
                    var segmentEnd = path[index + 1];
                    var segmentProgress = segmentLengths[index]
                        ? (midpoint - traversed) / segmentLengths[index]
                        : 0;
                    x = segmentStart.xMeters +
                        (segmentEnd.xMeters - segmentStart.xMeters) * segmentProgress;
                    y = segmentStart.yMeters +
                        (segmentEnd.yMeters - segmentStart.yMeters) * segmentProgress;
                    angle = Math.atan2(
                        segmentEnd.yMeters - segmentStart.yMeters,
                        segmentEnd.xMeters - segmentStart.xMeters
                    ) * 180 / Math.PI;
                    break;
                }
                traversed += segmentLengths[index];
            }
        }

        if (angle > 90 || angle < -90) angle += 180;

        return { x: x, y: y, angle: angle };
    }

    function positionActionLabel(label, path, placement) {
        var labelWidth = label.getComputedTextLength();
        var fontSize = parseFloat(window.getComputedStyle(label).fontSize) || 1.65;
        var radians = placement.angle * Math.PI / 180;
        var halfWidth = Math.abs(Math.cos(radians)) * labelWidth / 2 +
            Math.abs(Math.sin(radians)) * fontSize / 2;
        var halfHeight = Math.abs(Math.sin(radians)) * labelWidth / 2 +
            Math.abs(Math.cos(radians)) * fontSize / 2;
        var pathLength = path.getTotalLength();
        var shortPath = pathLength < labelWidth + 7;
        var baseOffset = shortPath
            ? Math.max(5.2, fontSize * 2)
            : Math.max(3.2, fontSize * 1.35);
        var tangentShift = Math.min(5, pathLength * 0.16);
        var escapeShift = Math.min(14, Math.max(5, labelWidth * 0.65));
        var pitchRect = pitch.getBoundingClientRect();
        var obstacles = Array.from(pitch.querySelectorAll(
            ".coach-player .coach-marker, [data-coach-ball], " +
            "[data-svg-current-actions] .coach-action-label"
        )).filter(function (node) {
            return node !== label;
        });
        var tangent = {
            x: Math.cos(radians),
            y: Math.sin(radians)
        };
        var normal = {
            x: -Math.sin(radians),
            y: Math.cos(radians)
        };

        function overlapArea(first, second) {
            var width = Math.max(0, Math.min(first.right, second.right) -
                Math.max(first.left, second.left));
            var height = Math.max(0, Math.min(first.bottom, second.bottom) -
                Math.max(first.top, second.top));
            return width * height;
        }

        function scoreCandidate(direction, offset, along) {
            var x = placement.x + normal.x * offset * direction + tangent.x * along;
            var y = placement.y + normal.y * offset * direction + tangent.y * along;
            x = model.clamp(x, halfWidth + 1, model.PITCH.length - halfWidth - 1);
            y = model.clamp(y, halfHeight + 1, model.PITCH.width - halfHeight - 1);

            label.setAttribute("x", x);
            label.setAttribute("y", y);
            label.setAttribute(
                "transform",
                "rotate(" + placement.angle + " " + x + " " + y + ")"
            );

            var rect = label.getBoundingClientRect();
            var overflow = Math.max(0, pitchRect.left - rect.left) +
                Math.max(0, rect.right - pitchRect.right) +
                Math.max(0, pitchRect.top - rect.top) +
                Math.max(0, rect.bottom - pitchRect.bottom);
            var collision = obstacles.reduce(function (total, obstacle) {
                return total + overlapArea(rect, obstacle.getBoundingClientRect());
            }, 0);

            return {
                x: x,
                y: y,
                score: overflow * 1000 + collision * 10 + offset + Math.abs(along)
            };
        }

        var candidates = [];
        [
            baseOffset,
            baseOffset + 2.4,
            baseOffset + 4.8,
            baseOffset + 7.2,
            baseOffset + 9.6
        ].forEach(function (offset) {
            [-1, 1].forEach(function (direction) {
                [
                    0,
                    -tangentShift,
                    tangentShift,
                    -escapeShift,
                    escapeShift
                ].forEach(function (along) {
                    candidates.push(scoreCandidate(direction, offset, along));
                });
            });
        });
        var chosen = candidates.reduce(function (best, candidate) {
            return !best || candidate.score < best.score ? candidate : best;
        }, null);

        label.setAttribute("x", chosen.x);
        label.setAttribute("y", chosen.y);
        label.setAttribute(
            "transform",
            "rotate(" + placement.angle + " " + chosen.x + " " + chosen.y + ")"
        );
        label.classList.toggle("is-short-path", shortPath);
    }

    function renderActions(layer, actions, completed) {
        layer.innerHTML = "";
        (actions || []).forEach(function (action) {
            if (!action.path || action.path.length < 2) return;
            var path = svgElement("path", {
                d: pathData(action.path, action.type === "carry" || action.type === "press"),
                class: "coach-action is-" + action.type + (completed ? " is-completed" : " is-current"),
                "marker-end": actionMarker(action.type),
                "vector-effect": "non-scaling-stroke"
            });
            path.appendChild(svgElement("title", {}, action.label || action.type));
            layer.appendChild(path);

            if (!completed && action.label) {
                var placement = actionLabelPlacement(action);
                var label = svgElement("text", {
                    x: placement.x,
                    y: placement.y,
                    class: "coach-action-label is-" + action.type,
                    "aria-hidden": "true"
                }, action.label);
                layer.appendChild(label);
                positionActionLabel(label, path, placement);
            }
        });
    }

    function addSvgTitle(shape, label) {
        if (label) shape.appendChild(svgElement("title", {}, label));
    }

    function renderZones(zones, revealTrigger) {
        zonesLayer.innerHTML = "";
        (zones || []).forEach(function (zone) {
            var shape;
            if (zone.type === "rect" || zone.type === "band") {
                shape = svgElement("rect", {
                    x: zone.x,
                    y: zone.y,
                    width: zone.width,
                    height: zone.height,
                    rx: zone.type === "band" ? 2.2 : 1.2,
                    class: "coach-zone is-" + zone.tone
                });
                addSvgTitle(shape, zone.label);
                zonesLayer.appendChild(shape);
            } else if (zone.type === "circle") {
                shape = svgElement("circle", {
                    cx: zone.cx,
                    cy: zone.cy,
                    r: zone.radius,
                    class: "coach-zone is-" + zone.tone
                });
                addSvgTitle(shape, zone.label);
                zonesLayer.appendChild(shape);
            } else if (zone.type === "polygon") {
                shape = svgElement("polygon", {
                    points: zone.points.map(function (zonePoint) {
                        return zonePoint.xMeters + "," + zonePoint.yMeters;
                    }).join(" "),
                    class: "coach-zone is-" + zone.tone
                });
                addSvgTitle(shape, zone.label);
                zonesLayer.appendChild(shape);
            } else if (zone.type === "line") {
                shape = svgElement("line", {
                    x1: zone.x1, y1: zone.y1, x2: zone.x2, y2: zone.y2,
                    class: "coach-measurement is-" + zone.tone,
                    "vector-effect": "non-scaling-stroke"
                });
                addSvgTitle(shape, zone.label);
                zonesLayer.appendChild(shape);
            }
        });

        if (revealTrigger) {
            var triggerShape = svgElement("circle", {
                cx: revealTrigger.cx,
                cy: revealTrigger.cy,
                r: revealTrigger.radius,
                class: "coach-zone is-press is-trigger"
            });
            addSvgTitle(triggerShape, revealTrigger.label);
            zonesLayer.appendChild(triggerShape);
        }
    }

    function renderAnnotations(annotations) {
        annotationsLayer.innerHTML = "";
        (annotations || []).forEach(function (annotation) {
            annotationsLayer.appendChild(svgElement("text", {
                x: annotation.x,
                y: annotation.y,
                class: "coach-annotation is-" + (annotation.tone || "neutral"),
                "text-anchor": "middle"
            }, annotation.label));
        });
    }

    function sequenceAtProgress(sequence, progress) {
        var elapsed = model.clamp(progress, 0, 1) * sequence.duration;
        var step = sequence.steps[sequence.steps.length - 1];
        var index = sequence.steps.length - 1;

        sequence.steps.some(function (candidate, candidateIndex) {
            if (elapsed < candidate.endTime || candidateIndex === sequence.steps.length - 1) {
                step = candidate;
                index = candidateIndex;
                return true;
            }
            return false;
        });

        var localProgress = step.duration
            ? model.clamp((elapsed - step.startTime) / step.duration, 0, 1)
            : 1;
        var easedProgress = model.smoothstep(localProgress);
        var ballProgress = step.ballOwners
            ? model.ballProgressAtStepProgress(localProgress)
            : localProgress;
        var ball = step.ballOwners
            ? model.interpolateOwnedPath(
                step.ballPath,
                step.ballOwners,
                ballProgress,
                step.ballSegmentTypes
            )
            : model.interpolatePath(step.ballPath, ballProgress);
        var positions = {};

        Object.keys(step.startPositions).forEach(function (id) {
            if (step.ballOwners) {
                var ownedPosition = model.ownerPositionAtStepProgress({
                    startPosition: step.startPositions[id],
                    endPosition: step.endPositions[id],
                    path: step.ballPath,
                    owners: step.ballOwners,
                    segmentTypes: step.ballSegmentTypes,
                    playerId: id,
                    progress: localProgress
                });
                positions[id] = markerSafePoint(ownedPosition);
            } else {
                positions[id] = markerSafePoint(
                    model.interpolatePoint(
                        step.startPositions[id],
                        step.endPositions[id],
                        easedProgress
                    )
                );
            }
        });

        if (step.ballCarrier) {
            var carrierId = step.ballCarrier.playerId;
            positions[carrierId] = markerSafePoint(
                model.carrierPositionAtProgress(
                    step.startPositions[carrierId],
                    step.ballPath,
                    step.ballCarrier.fromWaypoint,
                    localProgress
                )
            );
        }
        var ownerPriorities = step.ballOwners
            ? model.ballOwnerPrioritiesAtStepProgress(
                step.ballPath,
                step.ballOwners,
                localProgress,
                step.ballSegmentTypes
            )
            : {};
        if (step.ballCarrier) {
            ownerPriorities[step.ballCarrier.playerId] = 1;
        }
        positions = model.resolveFrameOverlaps(positions, {
            priorities: ownerPriorities,
            startPositions: step.startPositions,
            endPositions: step.endPositions,
            sameTeamMinimum: 3,
            opponentMinimum: 2,
            maximumDisplacement: 1.8,
            inset: 3.5
        });

        return {
            elapsed: elapsed,
            step: step,
            index: index,
            localProgress: localProgress,
            positions: positions,
            ball: ball
        };
    }

    function updateStepButtons(canGoPrevious, canGoNext) {
        animationPrevious.disabled = !canGoPrevious;
        animationNext.disabled = !canGoNext;
    }

    function updateCaption(title, copy) {
        animationTitle.textContent = title;
        animationCopy.textContent = copy;
    }

    function updateSubstateSelection(index) {
        substateControls.querySelectorAll("button").forEach(function (button, buttonIndex) {
            var selected = buttonIndex === index;
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
            if (selected) button.setAttribute("aria-current", "step");
            else button.removeAttribute("aria-current");
        });
    }

    function renderSequence(view, progress) {
        var sequence = sequences[view];
        var state = sequenceAtProgress(sequence, progress);

        // Per-frame work: only the players and ball move continuously.
        updatePlayerPositions(state.positions, state.step);
        updateBall(state.ball);
        if (!tacticalTooltip.hidden && activeTooltipId) positionTooltip(activeTooltipId);

        var triggerVisible = Boolean(state.step.trigger && state.localProgress >= 0.68);
        var stepChanged = lastSequenceRender.view !== view || lastSequenceRender.index !== state.index;
        var triggerChanged = lastSequenceRender.triggerVisible !== triggerVisible;

        // Arrows, zones and step text only change at phase boundaries, so rebuild
        // them then instead of on every animation frame.
        if (stepChanged) {
            var completedActions = [];
            sequence.steps.slice(0, state.index).forEach(function (step) {
                completedActions = completedActions.concat(step.actions || []);
            });
            renderActions(completedActionsLayer, completedActions, true);
            renderActions(currentActionsLayer, state.step.actions, false);

            phaseLabel.textContent = sentenceCase(state.step.phase);
            pitchDescription.textContent = state.step.caption;
            pitch.setAttribute("aria-label", state.step.phase + ". " + state.step.title + ". " + state.step.caption);
            updateCaption(
                state.step.title,
                state.step.caption
            );
            animationDurationNode.textContent = formatTime(sequence.duration);
            updateSubstateSelection(state.index);
        }

        // The press trigger appears mid-step, so refresh zones when it toggles too.
        if (stepChanged || triggerChanged) {
            renderZones(state.step.zones, triggerVisible ? state.step.trigger : null);
        }

        // Only the live counterpress countdown earns on-pitch annotation.
        if (state.step.countdown) {
            renderAnnotations([{
                x: 85,
                y: 45,
                label: Math.max(0, Math.ceil(5 * (1 - state.localProgress))) + " s",
                tone: "press"
            }]);
        } else if (stepChanged) {
            annotationsLayer.innerHTML = "";
        }

        animationScrubber.value = String(progress * 100);
        animationScrubber.setAttribute("aria-valuetext", formatTime(state.elapsed) + " of " + formatTime(sequence.duration));
        animationTime.textContent = formatTime(state.elapsed);
        updateStepButtons(
            state.index > 0 || progress > 0.001,
            state.index < sequence.steps.length - 1 || progress < 0.999
        );

        lastSequenceRender.view = view;
        lastSequenceRender.index = state.index;
        lastSequenceRender.triggerVisible = triggerVisible;
        viewProgress[view] = progress;
    }

    function renderFormation(index) {
        invalidateSequenceCache();
        formationIndex = model.clamp(index, 0, formationStates.length - 1);
        var state = formationStates[formationIndex];
        updatePlayerPositions(state.positions, state);
        updateBall(point(46, 46));
        completedActionsLayer.innerHTML = "";
        currentActionsLayer.innerHTML = "";
        annotationsLayer.innerHTML = "";
        zonesLayer.innerHTML = "";

        if (state.bands) {
            renderZones(state.bands.map(function (band) {
                return {
                    type: "band",
                    x: band.x,
                    y: 4,
                    width: band.width,
                    height: 60,
                    tone: band.tone,
                    label: band.label
                };
            }));
        }

        if (state.lanes) {
            renderZones(state.lanes.map(function (lane) {
                return {
                    type: "rect",
                    x: 62,
                    y: lane.y,
                    width: 39,
                    height: lane.height,
                    tone: "lane",
                    label: lane.label
                };
            }));
        }

        phaseLabel.textContent = sentenceCase(state.phase);
        pitchDescription.textContent = state.caption;
        pitch.setAttribute("aria-label", state.phase + ". " + state.title + ". " + state.caption);
        updateCaption(state.title, state.caption);
        updateSubstateSelection(formationIndex);
        updateStepButtons(
            formationIndex > 0,
            formationIndex < formationStates.length - 1
        );
    }

    function buildSubstateControls(view) {
        substateControls.innerHTML = "";
        var states = view === "formation" ? formationStates : [];
        substateControls.hidden = !states.length;
        substateControls.setAttribute("aria-label", view === "formation" ? "Formation structures" : "Tactical sequence stages");

        states.forEach(function (state, index) {
            var button = document.createElement("button");
            button.type = "button";
            button.textContent = state.label;
            button.setAttribute("aria-pressed", "false");
            button.addEventListener("click", function () {
                stopAnimation("Play sequence");
                if (view === "formation") {
                    renderFormation(index);
                } else {
                    var sequence = sequences[view];
                    var progress = sequence.steps[index].startTime / sequence.duration;
                    viewProgress[view] = progress;
                    renderSequence(view, progress);
                }
            });
            substateControls.appendChild(button);
        });
    }

    function stopAnimation(label) {
        if (animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = 0;
        }
        pitch.classList.remove("is-fluid");
        animationPlay.setAttribute("aria-pressed", "false");
        animationPlay.querySelector("span").textContent = label || "Play sequence";
    }

    function animationTick(timestamp) {
        var sequence = sequences[activeView];
        var startElapsed = animationBaseProgress * sequence.duration;
        var elapsed = startElapsed + (timestamp - animationStartedAt);
        var progress = Math.min(1, elapsed / sequence.duration);
        renderSequence(activeView, progress);
        if (progress >= 1) {
            animationFrame = 0;
            pitch.classList.remove("is-fluid");
            animationPlay.setAttribute("aria-pressed", "false");
            animationPlay.querySelector("span").textContent = "Replay sequence";
            return;
        }
        animationFrame = window.requestAnimationFrame(animationTick);
    }

    function stepIndexForView(view) {
        if (view === "formation") return formationIndex;
        var state = sequenceAtProgress(sequences[view], viewProgress[view]);
        return state.index;
    }

    function goToStep(direction) {
        stopAnimation("Play sequence");
        if (activeView === "formation") {
            renderFormation(model.clamp(formationIndex + direction, 0, formationStates.length - 1));
            return;
        }
        var sequence = sequences[activeView];
        var lastIndex = sequence.steps.length - 1;
        var current = stepIndexForView(activeView);
        var nextIndex = model.clamp(current + direction, 0, lastIndex);
        // Stepping forward while already on the final phase plays it through to the
        // end, so the last action completes instead of freezing at its start.
        var progress = (direction > 0 && current === lastIndex)
            ? 1
            // Land just inside the requested phase. An exact floating-point
            // boundary can multiply back to a fraction below startTime and
            // leave Next stuck on the same step for certain tempo values.
            : (sequence.steps[nextIndex].startTime + (nextIndex ? 0.5 : 0)) /
                sequence.duration;
        viewProgress[activeView] = progress;
        renderSequence(activeView, progress);
    }

    function startAnimation() {
        if (activeView === "formation") {
            goToStep(1);
            return;
        }
        if (reducedMotion.matches) {
            goToStep(1);
            return;
        }
        if (animationFrame) {
            stopAnimation("Continue sequence");
            return;
        }
        if (viewProgress[activeView] >= 0.999) {
            viewProgress[activeView] = 0;
            renderSequence(activeView, 0);
        }
        pitch.classList.add("is-fluid");
        animationPlay.setAttribute("aria-pressed", "true");
        animationPlay.querySelector("span").textContent = "Pause";
        animationBaseProgress = viewProgress[activeView];
        animationStartedAt = performance.now();
        animationFrame = window.requestAnimationFrame(animationTick);
    }

    var presentationInitialized = false;

    function initializePresentation() {
        if (presentationInitialized || !presentationPanel) return;
        presentationInitialized = true;

        var reveals = Array.prototype.slice.call(
            presentationPanel.querySelectorAll("[data-pres-reveal]")
        );
        var chapters = Array.prototype.slice.call(
            presentationPanel.querySelectorAll("[data-pres-chapter]")
        );
        var indexLinks = Array.prototype.slice.call(
            presentationPanel.querySelectorAll("[data-pres-jump]")
        );
        var progressNode = presentationPanel.querySelector("[data-pres-progress]");
        var visibleIndex = -1;

        function formatCount(value) {
            return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        function runCounter(node) {
            if (node.dataset.done) return;
            node.dataset.done = "true";
            var target = Number(node.dataset.count) || 0;
            if (reducedMotion.matches) {
                node.textContent = formatCount(target);
                return;
            }
            var start = performance.now();
            var duration = 1300;
            function tick(now) {
                var progress = Math.min(1, (now - start) / duration);
                var eased = 1 - Math.pow(1 - progress, 3);
                node.textContent = formatCount(Math.round(target * eased));
                if (progress < 1) window.requestAnimationFrame(tick);
            }
            window.requestAnimationFrame(tick);
        }

        function revealNode(node) {
            node.classList.add("is-in");
            Array.prototype.forEach.call(
                node.querySelectorAll("[data-count]"),
                runCounter
            );
        }

        if (reducedMotion.matches || !("IntersectionObserver" in window)) {
            reveals.forEach(revealNode);
        } else {
            var observer = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        revealNode(entry.target);
                        observer.unobserve(entry.target);
                    });
                },
                { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
            );
            reveals.forEach(function (node) {
                observer.observe(node);
            });
        }

        indexLinks.forEach(function (link) {
            link.addEventListener("click", function (event) {
                var target = presentationPanel.querySelector(
                    link.getAttribute("href")
                );
                if (!target) return;
                event.preventDefault();
                // The theme sets `scroll-behavior: smooth` globally, so reduced
                // motion needs an explicit instant scroll, not "auto".
                target.scrollIntoView({
                    behavior: reducedMotion.matches ? "instant" : "smooth",
                    block: "start"
                });
            });
        });

        var progressTicking = false;

        function updatePresentationProgress() {
            progressTicking = false;
            if (presentationPanel.hidden) return;
            var rect = presentationPanel.getBoundingClientRect();
            var viewport = window.innerHeight || 1;
            var total = Math.max(1, rect.height - viewport);
            var progress = Math.min(1, Math.max(0, -rect.top / total));
            if (progressNode) {
                progressNode.style.setProperty("--pres-progress", String(progress));
            }
            var activeIndex = -1;
            chapters.forEach(function (chapter, index) {
                if (chapter.getBoundingClientRect().top < viewport * 0.45) {
                    activeIndex = index;
                }
            });
            // chapters[0] is the hero and the last entry is the coda; index
            // links map to chapters[1..6].
            var effective = Math.min(activeIndex, indexLinks.length);
            indexLinks.forEach(function (link, index) {
                if (index + 1 === effective) link.setAttribute("aria-current", "location");
                else link.removeAttribute("aria-current");
            });
            if (effective > 0 && effective !== visibleIndex) {
                indexLinks[effective - 1].scrollIntoView({
                    behavior: reducedMotion.matches ? "instant" : "smooth",
                    block: "nearest",
                    inline: "center"
                });
            }
            visibleIndex = effective;
        }

        function requestPresentationProgress() {
            if (progressTicking) return;
            progressTicking = true;
            window.requestAnimationFrame(updatePresentationProgress);
        }

        window.addEventListener("scroll", requestPresentationProgress, {
            passive: true
        });
        window.addEventListener("resize", requestPresentationProgress);
        requestPresentationProgress();
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value).replace(/[&<>"]/g, function (character) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[character];
        });
    }

    function formatRating(value) {
        return value == null ? "—" : value.toFixed(3);
    }

    function possessiveTeamName(value) {
        var name = String(value || "");
        return /s$/i.test(name) ? name + "'" : name + "'s";
    }

    var matchupInitialized = false;

    function initializeMatchup() {
        if (matchupInitialized) return;
        var dataNode = room.querySelector("[data-matchup-data]");
        var teamASelect = room.querySelector("[data-team-a]");
        var teamBSelect = room.querySelector("[data-team-b]");
        var breakdown = room.querySelector("[data-matchup-breakdown]");
        var showcase = room.querySelector("[data-featured-showcase]");
        if (!dataNode || !teamASelect || !teamBSelect || !breakdown) return;

        var data;
        try {
            data = JSON.parse(dataNode.textContent);
        } catch (error) {
            return;
        }
        var teams = (data && data.teams) || [];
        if (!teams.length) return;
        matchupInitialized = true;

        var byCode = {};
        teams.forEach(function (team) { byCode[team.code] = team; });

        var optionsHtml = teams.map(function (team) {
            return "<option value=\"" + team.code + "\">" + escapeHtml(team.name) +
                (team.rated_count ? "" : " — no eligible outfield players") + "</option>";
        }).join("");
        teamASelect.innerHTML = optionsHtml;
        teamBSelect.innerHTML = optionsHtml;
        teamASelect.value = byCode.ARG ? "ARG" : teams[0].code;
        teamBSelect.value = byCode.FRA ? "FRA" : teams[Math.min(1, teams.length - 1)].code;

        // Show the name each player goes by (from the player index) in the
        // head-to-head ratings card, falling back to the full name.
        function goesByName(player) {
            var idx = player && player.id != null ? playerIndex[String(player.id)] : null;
            return idx && idx.name ? idx.name : (player ? player.name : "");
        }

        function playerRowHtml(player, index, topRating) {
            var width = Math.max(6, Math.round(((player.rating || 0) / (topRating || 1)) * 100));
            var subtitle = player.role || player.position || "";
            return "<li class=\"matchup-player\">" +
                "<span class=\"matchup-player__rank\">" + (player.team_rank || index + 1) + "</span>" +
                "<span class=\"matchup-player__name\">" + escapeHtml(goesByName(player)) +
                (subtitle ? "<em>" + escapeHtml(subtitle) + "</em>" : "") + "</span>" +
                "<span class=\"matchup-player__bar\"><i style=\"--w: " + width + "%\"></i></span>" +
                "<span class=\"matchup-player__rating\">" + formatRating(player.rating) + "</span>" +
                "</li>";
        }

        function teamCardHtml(team) {
            if (!team.rated_count) {
                return "<article class=\"matchup-card is-empty\">" +
                    "<div class=\"matchup-card__head\"><h3>" + escapeHtml(team.name) + "</h3></div>" +
                    "<p class=\"matchup-card__empty\">No player met the active outfield eligibility floor.</p>" +
                    "</article>";
            }
            var rows = team.players.map(function (player, index) {
                return playerRowHtml(player, index, team.top_rating);
            }).join("");
            return "<article class=\"matchup-card\">" +
                "<div class=\"matchup-card__head\"><h3>" + escapeHtml(team.name) + "</h3>" +
                "<dl><div><dt>Outfield</dt><dd>" + team.rated_count + "</dd></div>" +
                "<div><dt>Avg</dt><dd>" + formatRating(team.avg_rating) + "</dd></div></dl></div>" +
                "<ol class=\"matchup-card__list\">" + rows + "</ol></article>";
        }

        function topLine(team) {
            var top = team.players && team.players[0];
            return top
                ? "<strong>" + escapeHtml(goesByName(top)) + "</strong><em>top outfield · " + formatRating(top.rating) + "</em>"
                : "<em>No eligible outfield players</em>";
        }

        function headToHeadHtml(teamA, teamB) {
            return "<div class=\"matchup-h2h\">" +
                "<div class=\"matchup-h2h__side\"><span class=\"matchup-h2h__team\">" +
                escapeHtml(teamA.name) + "</span>" + topLine(teamA) + "</div>" +
                "<span class=\"matchup-h2h__vs\" aria-hidden=\"true\">vs</span>" +
                "<div class=\"matchup-h2h__side is-right\"><span class=\"matchup-h2h__team\">" +
                escapeHtml(teamB.name) + "</span>" + topLine(teamB) + "</div>" +
                "</div>";
        }

        var showcaseLabel = showcase ? showcase.querySelector(".coach-showcase__label") : null;
        var matchupTitleNode = room.querySelector(".coach-matchup");
        var fixturesNode = room.querySelector("[data-fixtures]");
        var formulateTimer = null;

        // Knockout fixtures as one-tap picks right at the board, so switching
        // matchup is obvious (not just the dropdowns above).
        function fixtureName(code) {
            return byCode[code] ? byCode[code].name : code;
        }

        function renderFixtures() {
            if (!fixturesNode || !window.WorldsCoachPlanner) return;
            var rounds = [];
            var byRound = {};
            window.WorldsCoachPlanner.KNOCKOUTS.forEach(function (fx) {
                if (!byRound[fx.round]) { byRound[fx.round] = []; rounds.push(fx.round); }
                byRound[fx.round].push(fx);
            });
            var groups = rounds.map(function (round) {
                var opts = byRound[round].map(function (fx) {
                    return "<option value=\"" + fx.teamA + "|" + fx.teamB + "\">" +
                        escapeHtml(fixtureName(fx.teamA)) + " vs " + escapeHtml(fixtureName(fx.teamB)) +
                        "</option>";
                }).join("");
                return "<optgroup label=\"" + escapeHtml(round) + "\">" + opts + "</optgroup>";
            }).join("");
            fixturesNode.innerHTML =
                "<label class=\"coach-fixtures__label\">" +
                "<span>Jump to a knockout fixture</span>" +
                "<select data-fixture-select aria-label=\"Jump to a knockout fixture\">" +
                "<option value=\"\">Custom matchup</option>" + groups +
                "</select></label>";
        }

        function markActiveFixture() {
            if (!fixturesNode) return;
            var select = fixturesNode.querySelector("[data-fixture-select]");
            if (!select) return;
            var key = teamASelect.value + "|" + teamBSelect.value;
            var reverse = teamBSelect.value + "|" + teamASelect.value;
            var match = "";
            Array.prototype.forEach.call(select.options, function (opt) {
                if (opt.value === key || opt.value === reverse) match = opt.value;
            });
            select.value = match;
        }

        if (fixturesNode) {
            fixturesNode.addEventListener("change", function (event) {
                var select = event.target.closest("[data-fixture-select]");
                if (!select || !select.value) return;
                var pair = select.value.split("|");
                teamASelect.value = pair[0];
                teamBSelect.value = pair[1];
                render(true);
            });
        }

        // Flip sides: swap which team is "our team" (the point of view the board
        // is built for). Works for every matchup — the whole pipeline (roster,
        // board choreography, recommendation, role cards, flags) keys off the two
        // selects, so swapping them re-plans from the opponent's perspective.
        var flipButton = room.querySelector("[data-flip-sides]");
        if (flipButton) {
            flipButton.addEventListener("click", function () {
                var previousOur = teamASelect.value;
                teamASelect.value = teamBSelect.value;
                teamBSelect.value = previousOur;
                render(true);
            });
        }

        // Drive the tactical board from the selected matchup. The head-to-head
        // ratings card above is rendered separately and always stays in sync.
        function driveCoach(teamACode, teamBCode, teamA, teamB, animate) {
            if (showcase) showcase.hidden = false;
            if (matchupTitleNode) {
                matchupTitleNode.textContent = teamA.name + " vs. " + teamB.name;
                matchupTitleNode.setAttribute("aria-label", teamA.name + " versus " + teamB.name);
            }
            if (flipButton) {
                var flipLabel = flipButton.querySelector(".coach-flip__label");
                if (flipLabel) flipLabel.textContent = "Plan as " + teamB.name;
                flipButton.setAttribute(
                    "aria-label",
                    "Flip sides — build " + possessiveTeamName(teamB.name) + " game plan against " + teamA.name
                );
                flipButton.setAttribute(
                    "title",
                    "Show " + possessiveTeamName(teamB.name) + " tactical plan against " + teamA.name
                );
            }
            function commit() {
                applyMatchup(teamACode, teamBCode);
                if (showcaseLabel) {
                    showcaseLabel.innerHTML = "<span>Featured</span> Interactive tactical plan &mdash; " +
                        escapeHtml(teamA.name) + " vs " + escapeHtml(teamB.name);
                }
                if (pitch) pitch.classList.remove("is-formulating");
            }
            if (!animate) { commit(); return; }
            if (showcaseLabel) {
                showcaseLabel.innerHTML = "<span>Formulating</span> Building a game plan for " +
                    escapeHtml(teamA.name) + " vs " + escapeHtml(teamB.name) + "&hellip;";
            }
            if (pitch) pitch.classList.add("is-formulating");
            statusNode.textContent = "Formulating a game plan for " + teamA.name + " versus " + teamB.name + ".";
            if (formulateTimer) window.clearTimeout(formulateTimer);
            formulateTimer = window.setTimeout(commit, 520);
        }

        function render(animate) {
            if (teamASelect.value === teamBSelect.value) {
                // Nudge the opponent to a different team so a matchup is always valid.
                var alternate = teams.find(function (team) { return team.code !== teamASelect.value; });
                if (alternate) teamBSelect.value = alternate.code;
            }
            var teamA = byCode[teamASelect.value];
            var teamB = byCode[teamBSelect.value];
            if (!teamA || !teamB) return;
            breakdown.innerHTML = headToHeadHtml(teamA, teamB) +
                "<div class=\"matchup-cards\">" + teamCardHtml(teamA) + teamCardHtml(teamB) + "</div>";
            markActiveFixture();
            driveCoach(teamASelect.value, teamBSelect.value, teamA, teamB, animate);
        }

        teamASelect.addEventListener("change", function () { render(true); });
        teamBSelect.addEventListener("change", function () { render(true); });
        renderFixtures();
        render(false);
    }

    var activeMode = "tool";

    function setMode(mode, options) {
        var opts = options || {};
        if (mode === activeMode && !opts.force) return;
        activeMode = mode;
        var isPresentation = mode === "presentation";

        if (isPresentation) stopAnimation("Play sequence");
        if (coachTool) coachTool.hidden = isPresentation;
        if (presentationPanel) presentationPanel.hidden = !isPresentation;

        room.querySelectorAll("[data-coach-mode]").forEach(function (button) {
            var selected = button.dataset.coachMode === mode;
            button.setAttribute("aria-selected", String(selected));
            button.tabIndex = selected ? 0 : -1;
        });

        if (isPresentation) initializePresentation();

        // Fade the newly shown view in (retrigger the animation each switch).
        var shown = isPresentation ? presentationPanel : coachTool;
        if (shown && !opts.silent) {
            shown.classList.remove("is-mode-enter");
            void shown.offsetWidth;
            shown.classList.add("is-mode-enter");
        }

        // Bring the top of the newly shown view into view.
        if (!opts.silent && shown) {
            var top = shown.getBoundingClientRect().top + window.scrollY - 12;
            window.scrollTo({
                top: Math.max(0, top),
                behavior: reducedMotion.matches ? "instant" : "smooth"
            });
        }
    }

    function updateControlVisibility(view) {
        var hasSequence = view === "attack" || view === "press" || view === "transition";
        animationControls.hidden = false;
        animationTimeline.hidden = !hasSequence;
        animationPlay.hidden = view === "formation";
        animationPrevious.hidden = false;
        animationNext.hidden = false;
        animationPlay.querySelector("span").textContent = reducedMotion.matches ? "Next step" : "Play sequence";
    }

    function updateView(view) {
        stopAnimation("Play sequence");
        invalidateSequenceCache();
        activeView = view;
        pitch.dataset.view = view;
        room.querySelectorAll("[data-tactic-tab]").forEach(function (button) {
            var selected = button.dataset.tacticTab === view;
            button.setAttribute("aria-selected", String(selected));
            button.tabIndex = selected ? 0 : -1;
        });

        // "Presentation" is static content, not a tactical view: swap the pitch
        // stage for the presentation panel and skip the sequence rendering.
        tacticalStage.setAttribute("aria-labelledby", "coach-tab-" + view);
        updateControlVisibility(view);
        buildSubstateControls(view);
        animationScrubber.setAttribute("aria-label", "Review the " + view + " timeline");

        if (view === "formation") {
            renderFormation(formationIndex);
        } else {
            renderSequence(view, viewProgress[view]);
        }
    }

    function updateScenario() {
        // Rebuild the plan for the current matchup + scenario (no node rebuild —
        // the roster ids are unchanged, only positions and text move).
        applyPlan(stateControl.value, false);
    }

    function initializeInteractions() {
        createPlayerNodes();
        updateForwardRoster();

        tacticalTooltip.addEventListener("mouseenter", cancelPlayerTooltipHide);
        tacticalTooltip.addEventListener("mouseleave", schedulePlayerTooltipHide);
        tacticalTooltip.addEventListener("focusin", cancelPlayerTooltipHide);
        tacticalTooltip.addEventListener("focusout", function (event) {
            if (!tacticalTooltip.contains(event.relatedTarget)) {
                schedulePlayerTooltipHide();
            }
        });
        tacticalTooltip.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        // Static role cards (the forward card is refreshed by updateForwardRoster).
        room.querySelectorAll("[data-role-card]").forEach(function (card) {
            if (card.dataset.roleCard !== "forward") loadRolePhoto(card);
        });
        initializeMatchup();

        room.querySelectorAll("[data-coach-mode]").forEach(function (button, index, buttons) {
            button.addEventListener("click", function () {
                setMode(button.dataset.coachMode);
            });
            button.addEventListener("keydown", function (event) {
                var nextIndex;
                if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
                else if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
                else if (event.key === "Home") nextIndex = 0;
                else if (event.key === "End") nextIndex = buttons.length - 1;
                else return;
                event.preventDefault();
                var target = buttons[nextIndex];
                setMode(target.dataset.coachMode);
                target.focus();
            });
        });

        room.querySelectorAll("[data-tactic-tab]").forEach(function (button, index, buttons) {
            button.addEventListener("click", function () {
                updateView(button.dataset.tacticTab);
            });
            button.addEventListener("keydown", function (event) {
                var nextIndex;
                if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
                else if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
                else if (event.key === "Home") nextIndex = 0;
                else if (event.key === "End") nextIndex = buttons.length - 1;
                else return;
                event.preventDefault();
                var target = buttons[nextIndex];
                updateView(target.dataset.tacticTab);
                target.focus();
            });
        });

        animationPlay.addEventListener("click", startAnimation);
        animationPrevious.addEventListener("click", function () { goToStep(-1); });
        animationNext.addEventListener("click", function () { goToStep(1); });
        animationScrubber.addEventListener("input", function () {
            stopAnimation("Continue sequence");
            pitch.classList.add("is-fluid");
            viewProgress[activeView] = Number(animationScrubber.value) / 100;
            renderSequence(activeView, viewProgress[activeView]);
        });
        animationScrubber.addEventListener("change", function () {
            pitch.classList.remove("is-fluid");
        });

        stateControl.addEventListener("change", updateScenario);
        playerControl.addEventListener("change", function () {
            updateForwardRoster();
            updateScenario();
        });

        reducedMotion.addEventListener("change", function () {
            stopAnimation("Play sequence");
            updateControlVisibility(activeView);
        });

        if ("ResizeObserver" in window) {
            pitchResizeObserver = new ResizeObserver(queuePitchReflow);
            pitchResizeObserver.observe(pitch);
        } else {
            window.addEventListener("resize", queuePitchReflow);
        }

        window.addEventListener("pagehide", function () {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
            if (pitchResizeFrame) window.cancelAnimationFrame(pitchResizeFrame);
            if (pitchResizeObserver) pitchResizeObserver.disconnect();
            else window.removeEventListener("resize", queuePitchReflow);
        });
        window.addEventListener("onColorSchemeChange", function () {
            updateView(activeView);
        });

        updateScenario();
    }

    initializeInteractions();
})();
