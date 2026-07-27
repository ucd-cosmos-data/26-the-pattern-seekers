(function () {
    "use strict";

    var room = document.querySelector("[data-coach-room]");
    var model = window.WorldsCoachModel;
    if (!room || !model) return;

    function point(xMeters, yMeters) {
        return { xMeters: xMeters, yMeters: yMeters };
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
            label: "1 · Set 3–2",
            phase: "IN POSSESSION",
            title: "Set the 3–2 buildup",
            caption: "Martínez has three defenders ahead, two central connectors, and five clearly occupied attacking lanes.",
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
            label: "2 · Invite press",
            phase: "BUILD-UP",
            title: "Invite the central press",
            caption: "Martínez passes to Romero; Romero carries forward while Enzo stays behind the first pressure line and France's left midfielder steps toward the ball.",
            duration: 2300,
            moves: {
                romero: point(35, 56),
                enzo: point(44, 29),
                fra_lm: point(59, 52),
                fra_st: point(48, 37)
            },
            ballPath: [point(8, 34), point(25, 56), point(35, 56)],
            active: ["gk", "romero", "enzo"],
            actions: [
                { type: "pass", label: "PASS", path: [point(8, 34), point(25, 56)] },
                { type: "carry", label: "CARRY", path: [point(25, 56), point(29, 57), point(35, 56)] }
            ]
        },
        {
            id: "attack-release",
            label: "3 · Half-space",
            phase: "PROGRESSION",
            title: "Release Argentina's right half-space",
            caption: "Romero finds De Paul inside the lower half as Messi drops; Rabiot and Hernández shift toward Argentina's right side.",
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
            title: "Create the wide 3v2",
            caption: "De Paul passes to Messi; Molina runs outside, De Paul continues underneath, and France's left-side pair follow to create the visible 3v2.",
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
            label: "5 · Attack byline",
            phase: "FINAL THIRD",
            title: "Release Molina toward the byline",
            caption: "Messi passes outside to Molina while Álvarez crosses the near centre-back, De Paul protects the return, and France's left defenders retreat.",
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
                { type: "run", label: "BYLINE RUN", path: [point(80, 64), point(89, 62)] },
                { type: "run", label: "NEAR-POST RUN", path: [point(82, 35), point(88, 39)] }
            ]
        },
        {
            id: "attack-cutback",
            label: "6 · Cutback",
            phase: "FINISH",
            title: "Deliver the low cutback",
            caption: "Molina cuts the ball behind France's narrowing centre-backs to Álvarez; Mac Allister arrives late for the second ball.",
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
                { type: "pass", label: "LOW CUTBACK", path: [point(89, 62), point(91, 36)] },
                { type: "run", label: "LATE ARRIVAL", path: [point(70, 20), point(83, 23)] }
            ],
            zones: [
                { type: "rect", x: 84, y: 27, width: 12, height: 18, tone: "neutral", label: "CUTBACK ZONE" }
            ]
        },
        {
            id: "attack-reaction",
            label: "7 · On loss",
            phase: "ON LOSS",
            title: "Blocked shot: five-second counterpress",
            caption: "The shot is blocked and possession becomes loose. Messi, Molina, De Paul, Álvarez, and Mac Allister immediately close the ball.",
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
                { type: "pass", label: "BLOCKED SHOT", path: [point(91, 36), point(94, 35)] },
                { type: "press", label: "COUNTERPRESS", path: [point(80, 49), point(86, 43)] },
                { type: "press", label: "CLOSE", path: [point(89, 62), point(88, 55)] },
                { type: "press", label: "CLOSE", path: [point(72, 51), point(78, 49)] }
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
            title: "Three build, two connect, five occupy the last line",
            caption: "The vertical bands identify the three-player build line, the two connectors, and the five advanced lanes.",
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
            title: "Four defenders, four midfielders, two forwards",
            caption: "Each line is grouped by a subtle band, making the compact 4–4–2 readable without shirt-number knowledge.",
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
            title: "Exactly three defenders plus two screeners protect the attack",
            caption: "Tagliafico, Otamendi, and Romero form the first line; Enzo and De Paul screen immediately ahead.",
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
            title: "One primary occupier in each attacking lane",
            caption: "Di María, Mac Allister, Álvarez, Messi, and Molina occupy left wing through Argentina's right wing in order.",
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
            label: "1 · Start 4–4–2",
            phase: "PRESSING",
            title: "Start in a recognizable 4–4–2",
            caption: "Álvarez and Messi form the front two. Di María, Mac Allister, Enzo, and De Paul hold the midfield four.",
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
            label: "2 · Back pass",
            phase: "PRESS TRIGGER",
            title: "The backward pass activates the press",
            caption: "Upamecano passes backward to Lloris. Argentina's front two begin to advance, and the red trigger appears only as the goalkeeper prepares to receive.",
            duration: 2100,
            moves: {
                forward: point(67, 29),
                messi: point(67, 41)
            },
            ballPath: [point(81, 43), point(95, 34)],
            active: ["fra_lcb", "fra_gk", "forward", "messi"],
            actions: [
                { type: "pass", label: "BACKWARD PASS", path: [point(81, 43), point(95, 34)] }
            ],
            trigger: { cx: 95, cy: 34, radius: 7, label: "PRESS TRIGGER" }
        },
        {
            id: "press-lock",
            label: "3 · Lock + screen",
            phase: "LOCK THE OUTSIDE",
            title: "Álvarez jumps while screening the pivot",
            caption: "Álvarez curves his press across Tchouaméni's passing lane and forces Lloris toward Koundé at France's right touchline (top edge).",
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
                { type: "press", label: "SECOND WAVE", path: [point(67, 41), point(75, 40)] },
                { type: "pass", label: "FORCED OUTLET", path: [point(95, 34), point(84, 9)] }
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
            label: "4 · Press broken",
            phase: "FALLBACK",
            title: "If the trigger is beaten, recover the mid-block",
            caption: "France escapes the first jump. Argentina's front line drops and the team finishes in a compact 4–4–2 behind the 59 m engagement line.",
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

    var counterpressEnd = mergeIntoPositions(transitionInitial, {
        molina: point(86, 58),
        depaul: point(78, 50),
        messi: point(84, 47),
        forward: point(87, 39),
        macallister: point(80, 32)
    });

    var transitionSteps = [
        {
            id: "transition-before",
            label: "1 · Before loss",
            phase: "BEFORE LOSS",
            title: "Three plus two protect the attack",
            caption: "Tagliafico, Otamendi, and Romero are the protective three; Enzo and De Paul are the two screeners.",
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
            label: "2 · 0–5 seconds",
            phase: "ON LOSS",
            title: "Five counterpress; five protect the field",
            caption: "Molina, De Paul, Messi, Álvarez, and Mac Allister close the ball. The back three, Enzo, and Di María protect the central release.",
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
            label: "3 · Ball regained",
            phase: "REGAIN",
            title: "First release into Argentina's right channel",
            caption: "Messi regains and immediately releases Molina into the lower, Argentina-right channel.",
            duration: 2300,
            moves: {
                molina: point(94, 59),
                messi: point(86, 46),
                forward: point(92, 38)
            },
            ballPath: [point(85, 45), point(94, 59)],
            active: ["messi", "molina", "forward"],
            actions: [
                { type: "pass", label: "FIRST RELEASE", path: [point(85, 45), point(94, 59)] },
                { type: "run", label: "RIGHT-CHANNEL RUN", path: [point(86, 58), point(94, 59)] }
            ],
            zones: [
                { type: "rect", x: 81, y: 53, width: 22, height: 13, tone: "neutral", label: "ARGENTINA RIGHT CHANNEL" }
            ]
        },
        {
            id: "transition-recover",
            label: "4 · Press bypassed",
            phase: "RECOVERY",
            title: "Alternative outcome: recover into 4–4–2",
            caption: "If the counterpress is bypassed, Argentina sprints inside first and finishes in a compact 4–4–2.",
            duration: 2900,
            resetPositions: counterpressEnd,
            resetHistory: true,
            moves: argMidBlock,
            ballPath: [point(85, 45), point(65, 34)],
            active: ["molina", "depaul", "messi", "forward", "macallister", "dimaria"],
            actions: [
                { type: "recovery", label: "RECOVER", path: [point(86, 58), point(64, 58), point(42, 58)] },
                { type: "recovery", label: "RECOVER", path: [point(78, 50), point(64, 53), point(51, 58)] },
                { type: "recovery", label: "RECOVER", path: [point(84, 47), point(70, 44), point(59, 42)] },
                { type: "recovery", label: "RECOVER", path: [point(80, 32), point(65, 29), point(51, 27)] }
            ],
            zones: [
                { type: "band", x: 39, y: 6, width: 16, height: 56, tone: "neutral", label: "RECOVERED 4–4–2" }
            ]
        }
    ];

    function compileSequence(initialPositions, initialBall, steps) {
        var positions = model.copyPositions(initialPositions);
        var ball = point(initialBall.xMeters, initialBall.yMeters);
        var elapsed = 0;

        var compiledSteps = steps.map(function (step) {
            var startPositions = model.copyPositions(step.resetPositions || positions);
            var endPositions = mergeIntoPositions(startPositions, step.moves || {});
            var ballPath = (step.ballPath || [ball]).map(function (pathPoint) {
                return point(pathPoint.xMeters, pathPoint.yMeters);
            });
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
            plan: "Controlled possession → Argentina-right overload",
            confidence: 78,
            why: "Argentina's strongest route is to attract France centrally, release Messi in the right half-space, and send Molina down the lower touchline for the cutback.",
            effects: {
                chance: ["+14%", "78%"], box: ["+11%", "68%"], retention: ["+8%", "58%"], risk: ["+6%", "42%"]
            },
            instructions: {
                possession: "Build with a 3–2 base. Invite central pressure, then find De Paul or Messi in Argentina's right half-space.",
                finalThird: "Molina owns the lower touchline. Álvarez crosses the near centre-back and the cutback arrives behind the line.",
                out: "Defend in a compact 4–4–2. Screen Tchouaméni and force play toward France's right touchline—the upper edge.",
                transition: "The nearest five counterpress for five seconds; the back three plus two protect the centre."
            },
            options: { controlled: 64, transition: 58, wide: 54 }
        },
        leading: {
            plan: "Compact control → selective right-channel release",
            confidence: 82,
            why: "With the lead, central security comes first. France must advance, creating cleaner releases into Argentina's lower, right-side channel.",
            effects: {
                chance: ["+7%", "54%"], box: ["−3%", "34%"], retention: ["+13%", "76%"], risk: ["−9%", "24%"]
            },
            instructions: {
                possession: "Keep the 3–2 platform and circulate until France's midfield steps beyond the ball.",
                finalThird: "Attack only with a numerical edge; keep the weak-side winger connected to the recovery structure.",
                out: "Hold a compact 4–4–2 mid-block and permit only outside circulation.",
                transition: "Release Argentina's right channel if it is open; otherwise secure possession and reset."
            },
            options: { controlled: 68, transition: 61, wide: 57 }
        },
        drawing: {
            plan: "Controlled overload → earlier Molina release",
            confidence: 75,
            why: "The same right-side route remains strongest, but Molina can advance earlier while the three-plus-two rest defence remains intact.",
            effects: {
                chance: ["+16%", "84%"], box: ["+14%", "77%"], retention: ["+5%", "48%"], risk: ["+9%", "53%"]
            },
            instructions: {
                possession: "Keep the 3–2 base and release Molina up Argentina's lower, right touchline when France's winger narrows.",
                finalThird: "Create the right-side 3v2, occupy the box with two runners, and hold the far-side edge.",
                out: "Jump on the first backward pass, then recover the 4–4–2 if the press is beaten.",
                transition: "The right-side triangle closes immediately while Enzo blocks the central escape."
            },
            options: { controlled: 66, transition: 60, wide: 56 }
        },
        trailing: {
            plan: "Aggressive 3–2–5 → immediate counterpress",
            confidence: 69,
            why: "The need to score outweighs some transition safety. Five attacking lanes increase chance volume, with a clearly higher concession risk.",
            effects: {
                chance: ["+24%", "94%"], box: ["+21%", "88%"], retention: ["−4%", "31%"], risk: ["+18%", "79%"]
            },
            instructions: {
                possession: "Pin France with a 3–2–5 and move the ball before the block can reset.",
                finalThird: "Fill all five lanes and attack the cutback with three runners.",
                out: "Press every restart, screen the pivot, and force the outside pass.",
                transition: "The nearest five counterpress immediately; the other five protect the direct route to goal."
            },
            options: { controlled: 57, transition: 63, wide: 55 }
        }
    };

    var viewSummaries = {
        attack: {
            labels: ["Base shape", "Create", "Finish", "On loss"],
            values: ["3–2 buildup", "Argentina-right 3v2", "Low cutback", "Five-player press"]
        },
        formation: {
            labels: ["In possession", "Out of possession", "Rest defence", "Last line"],
            values: ["3–2–5", "4–4–2", "3 + 2", "Five lanes"]
        },
        press: {
            labels: ["Start shape", "Trigger", "Lock direction", "Fallback"],
            values: ["4–4–2", "Backward pass", "France right touchline", "Compact mid-block"]
        },
        transition: {
            labels: ["Before loss", "Counterpress", "On regain", "If bypassed"],
            values: ["3 + 2", "Five players · 5 s", "Argentina right channel", "Recover 4–4–2"]
        }
    };

    var metricDefinitions = [
        "Attacking width is the vertical distance between the widest selected Argentina outfield players.",
        "Line height is the average distance of the three protective defenders from Argentina's own goal line.",
        "Team depth is the horizontal distance between the deepest and highest selected Argentina outfield players.",
        "Weak-side gap is the distance from Argentina's left touchline to the outermost weak-side attacker."
    ];

    var stateControl = room.querySelector("[data-coach-state]");
    var playerControl = room.querySelector("[data-coach-player]");
    var pitch = room.querySelector("[data-coach-pitch]");
    var playersLayer = room.querySelector("[data-pitch-players]");
    var ballNode = room.querySelector("[data-coach-ball]");
    var zonesLayer = room.querySelector("[data-svg-zones]");
    var completedActionsLayer = room.querySelector("[data-svg-completed-actions]");
    var currentActionsLayer = room.querySelector("[data-svg-current-actions]");
    var annotationsLayer = room.querySelector("[data-svg-annotations]");
    var substateControls = room.querySelector("[data-tactic-substates]");
    var planStrip = room.querySelector("[data-plan-strip]");
    var metricDefinition = room.querySelector("[data-metric-definition]");
    var phaseLabel = room.querySelector("[data-pitch-phase]");
    var pitchDescription = room.querySelector("[data-pitch-description]");
    var notationKey = room.querySelector("[data-notation-key]");
    var animationCount = room.querySelector("[data-animation-count]");
    var animationTitle = room.querySelector("[data-animation-title]");
    var animationCopy = room.querySelector("[data-animation-copy]");
    var animationPlay = room.querySelector("[data-animation-play]");
    var animationPrevious = room.querySelector("[data-animation-previous]");
    var animationNext = room.querySelector("[data-animation-next]");
    var animationSpeed = room.querySelector("[data-animation-speed]");
    var animationScrubber = room.querySelector("[data-animation-scrubber]");
    var animationTime = room.querySelector("[data-animation-time]");
    var animationDurationNode = room.querySelector("[data-animation-duration]");
    var animationControls = room.querySelector(".coach-animation__controls");
    var animationTimeline = room.querySelector(".coach-timeline");
    var tacticalTooltip = room.querySelector("[data-tactical-tooltip]");
    var planName = room.querySelector("[data-plan-name]");
    var planWhy = room.querySelector("[data-plan-why]");
    var confidence = room.querySelector("[data-confidence]");
    var demoNote = room.querySelector("[data-coach-demo-note]");
    var optionDetail = room.querySelector("[data-option-detail]");
    var riskCard = room.querySelector(".coach-effect-grid .is-risk");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    var activeView = "attack";
    var viewProgress = { attack: 0, press: 0, transition: 0 };
    var formationIndex = 0;
    var animationFrame = 0;
    var animationStartedAt = 0;
    var animationBaseProgress = 0;
    var tooltipPinned = false;
    var currentPositions = model.copyPositions(attackInitial);
    var playerNodes = {};
    var activeTooltipId = null;
    var lastSequenceRender = { view: null, index: -1, triggerVisible: null };

    function invalidateSequenceCache() {
        lastSequenceRender.view = null;
        lastSequenceRender.index = -1;
        lastSequenceRender.triggerVisible = null;
    }

    function setText(selector, value) {
        var element = room.querySelector(selector);
        if (element) element.textContent = value;
    }

    function formatTime(milliseconds) {
        var totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = totalSeconds % 60;
        return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    function updateForwardRoster() {
        var lautaro = playerControl.value === "lautaro";
        roster.forward = {
            team: "ARG",
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
        setText("[data-lineup-fit]", "Lineup fit · " + (lautaro ? "82%" : "86%"));
        demoNote.textContent = lautaro
            ? "Demonstration scenario · Recommendation recalculated for Lautaro Martínez"
            : "Demonstration scenario · Illustrative outputs until the production model is connected";
    }

    function updatePlayerNode(node, id) {
        var player = roster[id];
        var marker = node.querySelector(".coach-marker");
        var number = marker.querySelector("b");
        var surname = node.querySelector("small");
        number.textContent = player.number;
        surname.textContent = player.surname;
        node.setAttribute("aria-label", player.name + ", number " + player.number + ", " + player.role + ". " + player.instruction);
    }

    function positionTooltip(id) {
        var position = currentPositions[id];
        if (!position) return;
        var percent = model.pointToPercent(position);
        tacticalTooltip.style.setProperty("--tooltip-x", percent.x + "%");
        tacticalTooltip.style.setProperty("--tooltip-y", percent.y + "%");
        tacticalTooltip.classList.toggle("is-above", percent.y > 42);
    }

    function showPlayerTooltip(node, id, pin) {
        var player = roster[id];
        var position = currentPositions[id];
        if (!player || !position) return;
        tacticalTooltip.innerHTML = "<strong>" + player.name + " · " + player.number + "</strong><span>" + player.role + "</span><small>" + player.instruction + "</small>";
        activeTooltipId = id;
        positionTooltip(id);
        tacticalTooltip.hidden = false;
        tooltipPinned = Boolean(pin);
        playersLayer.querySelectorAll(".coach-player").forEach(function (playerNode) {
            playerNode.setAttribute("aria-expanded", String(playerNode === node));
        });
    }

    function hidePlayerTooltip(force) {
        if (tooltipPinned && !force) return;
        tacticalTooltip.hidden = true;
        tooltipPinned = false;
        activeTooltipId = null;
        playersLayer.querySelectorAll(".coach-player").forEach(function (node) {
            node.setAttribute("aria-expanded", "false");
        });
    }

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
            button.className = "coach-player " + (player.team === "ARG" ? "is-team" : "is-opponent");
            button.dataset.playerId = id;
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-describedby", "coach-player-tooltip");
            marker.className = "coach-marker " + (player.team === "ARG" ? "is-team" : "is-opponent");
            number.textContent = player.number;
            surname.textContent = player.surname;
            marker.appendChild(number);
            button.appendChild(marker);
            button.appendChild(surname);
            updatePlayerNode(button, id);
            button.addEventListener("mouseenter", function () {
                showPlayerTooltip(button, id, false);
            });
            button.addEventListener("mouseleave", function () {
                hidePlayerTooltip(false);
            });
            button.addEventListener("focus", function () {
                showPlayerTooltip(button, id, false);
            });
            button.addEventListener("blur", function () {
                hidePlayerTooltip(false);
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
        if (type === "press" || type === "recovery") return "url(#coach-arrow-red)";
        if (type === "protect") return "url(#coach-arrow-green)";
        return "url(#coach-arrow-blue)";
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
                var endpoint = action.path[action.path.length - 1];
                layer.appendChild(svgElement("text", {
                    x: endpoint.xMeters,
                    y: Math.max(3, endpoint.yMeters - 2.2),
                    class: "coach-action-label is-" + action.type,
                    "text-anchor": "middle"
                }, action.label));
            }
        });
    }

    function zoneLabel(layer, label, x, y, tone) {
        if (!label) return;
        layer.appendChild(svgElement("text", {
            x: x,
            y: y,
            class: "coach-zone-label is-" + (tone || "neutral"),
            "text-anchor": "middle"
        }, label));
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
                zoneLabel(zonesLayer, zone.label, zone.x + zone.width / 2, Math.max(3.2, zone.y + 3.2), zone.tone);
            } else if (zone.type === "circle") {
                shape = svgElement("circle", {
                    cx: zone.cx,
                    cy: zone.cy,
                    r: zone.radius,
                    class: "coach-zone is-" + zone.tone
                });
                addSvgTitle(shape, zone.label);
                zonesLayer.appendChild(shape);
                zoneLabel(zonesLayer, zone.label, zone.cx, Math.max(3.2, zone.cy - zone.radius - 1.5), zone.tone);
            } else if (zone.type === "polygon") {
                shape = svgElement("polygon", {
                    points: zone.points.map(function (zonePoint) {
                        return zonePoint.xMeters + "," + zonePoint.yMeters;
                    }).join(" "),
                    class: "coach-zone is-" + zone.tone
                });
                addSvgTitle(shape, zone.label);
                zonesLayer.appendChild(shape);
                var averageX = zone.points.reduce(function (sum, zonePoint) { return sum + zonePoint.xMeters; }, 0) / zone.points.length;
                var averageY = zone.points.reduce(function (sum, zonePoint) { return sum + zonePoint.yMeters; }, 0) / zone.points.length;
                zoneLabel(zonesLayer, zone.label, averageX, averageY, zone.tone);
            } else if (zone.type === "line") {
                shape = svgElement("line", {
                    x1: zone.x1, y1: zone.y1, x2: zone.x2, y2: zone.y2,
                    class: "coach-measurement is-" + zone.tone,
                    "vector-effect": "non-scaling-stroke"
                });
                addSvgTitle(shape, zone.label);
                zonesLayer.appendChild(shape);
                zoneLabel(zonesLayer, zone.label, zone.x1 + 1.5, (zone.y1 + zone.y2) / 2, zone.tone);
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
            zoneLabel(zonesLayer, revealTrigger.label, revealTrigger.cx, revealTrigger.cy - revealTrigger.radius - 1.5, "press");
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
        var easedProgress = localProgress * localProgress * (3 - 2 * localProgress);
        var positions = {};

        Object.keys(step.startPositions).forEach(function (id) {
            positions[id] = model.interpolatePoint(step.startPositions[id], step.endPositions[id], easedProgress);
        });

        return {
            elapsed: elapsed,
            step: step,
            index: index,
            localProgress: localProgress,
            positions: positions,
            ball: model.interpolatePath(step.ballPath, localProgress)
        };
    }

    function updateCaption(label, title, copy) {
        animationCount.textContent = label;
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
        if (activeView !== "dimensions") {
            planStrip.querySelectorAll(":scope > div").forEach(function (metric, metricIndex) {
                metric.classList.toggle("is-active", activeView !== "attack" && metricIndex === Math.min(index, 3));
            });
        }
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
            var historyStart = 0;
            sequence.steps.slice(0, state.index + 1).forEach(function (step, index) {
                if (step.resetHistory) historyStart = index;
            });
            sequence.steps.slice(historyStart, state.index).forEach(function (step) {
                completedActions = completedActions.concat(step.actions || []);
            });
            renderActions(completedActionsLayer, completedActions, true);
            renderActions(currentActionsLayer, state.step.actions, false);

            phaseLabel.textContent = state.step.phase;
            pitchDescription.textContent = state.step.caption;
            pitch.setAttribute("aria-label", state.step.phase + ". " + state.step.title + ". " + state.step.caption);
            updateCaption(
                (view === "attack" ? "PHASE " : "STAGE ") + String(state.index + 1).padStart(2, "0") + " / " + String(sequence.steps.length).padStart(2, "0"),
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

        // The counterpress countdown changes every frame; other annotations are static per step.
        if (state.step.countdown) {
            renderAnnotations((state.step.annotations || []).concat([{
                x: 85,
                y: 45,
                label: Math.max(0, Math.ceil(5 * (1 - state.localProgress))) + " s",
                tone: "press"
            }]));
        } else if (stepChanged) {
            renderAnnotations(state.step.annotations || []);
        }

        animationScrubber.value = String(progress * 100);
        animationScrubber.setAttribute("aria-valuetext", formatTime(state.elapsed) + " of " + formatTime(sequence.duration));
        animationTime.textContent = formatTime(state.elapsed);

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

        phaseLabel.textContent = state.phase;
        pitchDescription.textContent = state.caption;
        pitch.setAttribute("aria-label", state.phase + ". " + state.title + ". " + state.caption);
        updateCaption("STRUCTURE " + String(formationIndex + 1).padStart(2, "0") + " / 04", state.title, state.caption);
        updateSubstateSelection(formationIndex);
    }

    function dimensionMetrics() {
        return model.computeMetrics(currentPositions, {
            selectedIds: ["molina", "romero", "otamendi", "tagliafico", "enzo", "depaul", "macallister", "messi", "dimaria", "forward"],
            defensiveIds: ["romero", "otamendi", "tagliafico"],
            weakSideIds: ["dimaria", "macallister", "forward", "messi", "molina"],
            strongSide: "right"
        });
    }

    function dimensionSummary(metrics) {
        return {
            labels: ["Attacking width", "Line height", "Team depth", "Weak-side gap"],
            values: [
                metrics.attackingWidth + " m",
                metrics.lineHeight + " m",
                metrics.teamDepth + " m",
                metrics.weakSideGap + " m"
            ],
            definitions: metricDefinitions
        };
    }

    function renderDimensions() {
        invalidateSequenceCache();
        var positions = formationStates[0].positions;
        updatePlayerPositions(positions, { active: [] });
        updateBall(point(46, 46));
        completedActionsLayer.innerHTML = "";
        currentActionsLayer.innerHTML = "";
        annotationsLayer.innerHTML = "";
        var metrics = dimensionMetrics();
        var extents = metrics.extents;
        zonesLayer.innerHTML = "";

        var measurementData = [
            {
                path: "M " + (extents.maximumX + 4) + " " + extents.minimumY + " L " + (extents.maximumX + 4) + " " + extents.maximumY,
                label: metrics.attackingWidth + " m WIDTH",
                x: extents.maximumX + 4,
                y: (extents.minimumY + extents.maximumY) / 2
            },
            {
                path: "M " + extents.minimumX + " " + (extents.maximumY + 3) + " L " + extents.maximumX + " " + (extents.maximumY + 3),
                label: metrics.teamDepth + " m DEPTH",
                x: (extents.minimumX + extents.maximumX) / 2,
                y: extents.maximumY + 3
            },
            {
                path: "M 0 " + 63 + " L " + extents.defensiveLineX + " " + 63,
                label: metrics.lineHeight + " m LINE HEIGHT",
                x: extents.defensiveLineX / 2,
                y: 61
            },
            {
                path: "M 72 " + extents.weakSideTouchlineY + " L 72 " + extents.weakSidePlayerY,
                label: metrics.weakSideGap + " m WEAK-SIDE GAP",
                x: 72,
                y: Math.max(3, extents.weakSidePlayerY / 2)
            }
        ];

        measurementData.forEach(function (measurement) {
            var measurementPath = svgElement("path", {
                d: measurement.path,
                class: "coach-measurement is-dimension",
                "marker-start": "url(#coach-arrow-blue)",
                "marker-end": "url(#coach-arrow-blue)",
                "vector-effect": "non-scaling-stroke"
            });
            addSvgTitle(measurementPath, measurement.label);
            zonesLayer.appendChild(measurementPath);
            zoneLabel(zonesLayer, measurement.label, measurement.x, measurement.y, "dimension");
        });

        updatePlanStrip(dimensionSummary(metrics), -1);
        phaseLabel.textContent = "IN-POSSESSION DIMENSIONS";
        pitchDescription.textContent = "Width, depth, line height, and weak-side gap computed from the displayed Argentina outfield coordinates.";
        pitch.setAttribute("aria-label", pitchDescription.textContent + " Width " + metrics.attackingWidth + " metres; depth " + metrics.teamDepth + " metres.");
        updateCaption(
            "MEASURED LIVE",
            "Every value comes from the displayed player coordinates",
            "Goal-to-goal is depth; touchline-to-touchline is width. The summary and pitch labels share the same metric object."
        );
    }

    function updatePlanStrip(summary, activeIndex) {
        var values = summary.values;
        summary.labels.forEach(function (label, index) {
            var labelNode = room.querySelector('[data-plan-label="' + index + '"]');
            var valueNode = [
                room.querySelector("[data-plan-shape]"),
                room.querySelector("[data-plan-create]"),
                room.querySelector("[data-plan-finish]"),
                room.querySelector("[data-plan-loss]")
            ][index];
            var infoButton = room.querySelector('[data-plan-info="' + index + '"]');
            labelNode.textContent = label;
            valueNode.textContent = values[index];
            infoButton.hidden = !summary.definitions;
            if (summary.definitions) {
                infoButton.dataset.definition = summary.definitions[index];
                infoButton.setAttribute("aria-label", "Explain " + label.toLowerCase());
            } else {
                delete infoButton.dataset.definition;
            }
        });
        planStrip.querySelectorAll(":scope > div").forEach(function (metric, index) {
            metric.classList.toggle("is-active", index === activeIndex);
        });
        metricDefinition.hidden = true;
    }

    function buildSubstateControls(view) {
        substateControls.innerHTML = "";
        var states = view === "formation"
            ? formationStates
            : (sequences[view] ? sequences[view].steps : []);
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
        var speed = Number(animationSpeed.value) || 1;
        var startElapsed = animationBaseProgress * sequence.duration;
        var elapsed = startElapsed + (timestamp - animationStartedAt) * speed;
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
        if (activeView === "dimensions") return;
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
            : sequence.steps[nextIndex].startTime / sequence.duration;
        viewProgress[activeView] = progress;
        renderSequence(activeView, progress);
    }

    function startAnimation() {
        if (activeView === "dimensions" || activeView === "formation") {
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

    function updateControlVisibility(view) {
        var hasSequence = view === "attack" || view === "press" || view === "transition";
        animationControls.hidden = view === "dimensions";
        animationTimeline.hidden = !hasSequence;
        animationPlay.hidden = view === "formation";
        animationSpeed.closest("label").hidden = !hasSequence || reducedMotion.matches;
        animationPrevious.hidden = view === "dimensions";
        animationNext.hidden = view === "dimensions";
        notationKey.hidden = view === "formation" || view === "dimensions";
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
        pitch.setAttribute("aria-labelledby", "coach-tab-" + view);
        updateControlVisibility(view);
        buildSubstateControls(view);

        if (view === "dimensions") {
            renderDimensions();
            return;
        }

        updatePlanStrip(viewSummaries[view], view === "formation" ? formationIndex : stepIndexForView(view));
        if (view === "formation") {
            renderFormation(formationIndex);
        } else {
            renderSequence(view, viewProgress[view]);
        }
    }

    function updateOptionScores(optionScores) {
        Object.keys(optionScores).forEach(function (key) {
            var score = optionScores[key];
            var label = room.querySelector('[data-option-score="' + key + '"]');
            var bar = room.querySelector('[data-option="' + key + '"] em');
            if (label) label.textContent = score + "%";
            if (bar) bar.style.setProperty("--value", score + "%");
        });
    }

    function selectOption(key) {
        var optionCopy = {
            controlled: "Selected because it preserves Argentina's strongest possession pattern while targeting France's left defensive channel with Argentina's right-side overload.",
            transition: "A faster route with more open-field opportunities, but a higher turnover cost and less control over where possession ends.",
            wide: "Safer circulation can widen France's block, though it produces fewer central receptions and lower-value final actions."
        };
        room.querySelectorAll("[data-option]").forEach(function (button) {
            var selected = button.dataset.option === key;
            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
        optionDetail.textContent = optionCopy[key];
    }

    function updateScenario() {
        var scenario = scenarios[stateControl.value];
        planName.textContent = scenario.plan;
        planWhy.textContent = scenario.why;
        confidence.textContent = (scenario.confidence + (playerControl.value === "lautaro" ? -2 : 0)) + "%";

        Object.keys(scenario.effects).forEach(function (key) {
            var value = room.querySelector('[data-effect="' + key + '"]');
            var bar = room.querySelector('[data-effect-bar="' + key + '"]');
            if (value) value.textContent = scenario.effects[key][0];
            if (bar) bar.style.setProperty("--value", scenario.effects[key][1]);
        });
        setText("[data-in-possession]", scenario.instructions.possession);
        setText("[data-final-third]", scenario.instructions.finalThird);
        setText("[data-out-possession]", scenario.instructions.out);
        setText("[data-transition]", scenario.instructions.transition);
        updateOptionScores(scenario.options);
        riskCard.classList.toggle("is-safer", scenario.effects.risk[0].charAt(0) === "−");
        selectOption(stateControl.value === "trailing" ? "transition" : "controlled");
        updateView(activeView);
    }

    function initializeInteractions() {
        createPlayerNodes();
        updateForwardRoster();

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

        room.querySelectorAll("[data-option]").forEach(function (button) {
            button.addEventListener("click", function () {
                selectOption(button.dataset.option);
            });
        });

        room.querySelectorAll("[data-plan-info]").forEach(function (button) {
            function showDefinition() {
                if (!button.dataset.definition) return;
                metricDefinition.textContent = button.dataset.definition;
                metricDefinition.hidden = false;
            }
            button.addEventListener("mouseenter", showDefinition);
            button.addEventListener("focus", showDefinition);
            button.addEventListener("click", showDefinition);
        });

        animationPlay.addEventListener("click", startAnimation);
        animationPrevious.addEventListener("click", function () { goToStep(-1); });
        animationNext.addEventListener("click", function () { goToStep(1); });
        animationSpeed.addEventListener("change", function () {
            if (!animationFrame) return;
            window.cancelAnimationFrame(animationFrame);
            animationBaseProgress = viewProgress[activeView];
            animationStartedAt = performance.now();
            animationFrame = window.requestAnimationFrame(animationTick);
        });
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

        window.addEventListener("pagehide", function () {
            if (animationFrame) window.cancelAnimationFrame(animationFrame);
        });
        window.addEventListener("onColorSchemeChange", function () {
            updateView(activeView);
        });

        updateScenario();
    }

    initializeInteractions();
})();
