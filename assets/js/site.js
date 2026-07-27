(function () {
    "use strict";

    var root = document.documentElement;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function initializeNavigation() {
        var navigation = document.querySelector("[data-site-nav]");
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        var menuScrim = document.querySelector("[data-menu-scrim]");
        var mobileTheme = document.querySelector("[data-mobile-theme]");
        var primaryTheme = document.getElementById("dark-mode-toggle");

        function updateScrolledState() {
            if (navigation) {
                navigation.classList.toggle("is-scrolled", window.scrollY > 8);
            }
        }

        function closeMenu() {
            if (!menuButton || !mobileMenu) return;
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.querySelector(".sr-only").textContent = "Open menu";
            mobileMenu.hidden = true;
            if (menuScrim) menuScrim.hidden = true;
            document.body.classList.remove("menu-open");
        }

        function updateThemeLabels() {
            var isDark = root.dataset.scheme === "dark";
            var saved = "auto";

            try {
                saved = window.localStorage.getItem("StackColorScheme") || "auto";
            } catch (error) {
                saved = "auto";
            }

            if (primaryTheme) {
                primaryTheme.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
                primaryTheme.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
                primaryTheme.setAttribute("aria-pressed", String(isDark));
            }

            var label = document.querySelector("[data-theme-label]");
            if (label) {
                label.textContent = saved === "auto" ? "System" : saved.charAt(0).toUpperCase() + saved.slice(1);
            }
        }

        if (menuButton && mobileMenu) {
            menuButton.addEventListener("click", function () {
                var willOpen = menuButton.getAttribute("aria-expanded") !== "true";
                menuButton.setAttribute("aria-expanded", String(willOpen));
                menuButton.querySelector(".sr-only").textContent = willOpen ? "Close menu" : "Open menu";
                mobileMenu.hidden = !willOpen;
                if (menuScrim) menuScrim.hidden = !willOpen;
                document.body.classList.toggle("menu-open", willOpen);
            });

            mobileMenu.querySelectorAll("a").forEach(function (link) {
                link.addEventListener("click", closeMenu);
            });

            window.addEventListener("resize", function () {
                if (window.innerWidth > 900) closeMenu();
            });

            if (menuScrim) {
                menuScrim.addEventListener("click", closeMenu);
            }

            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
                    closeMenu();
                    menuButton.focus();
                }
            });
        }

        if (mobileTheme && primaryTheme) {
            mobileTheme.addEventListener("click", function () {
                primaryTheme.click();
                window.requestAnimationFrame(updateThemeLabels);
            });
        }

        window.addEventListener("scroll", updateScrolledState, { passive: true });
        window.addEventListener("onColorSchemeChange", function () {
            window.requestAnimationFrame(updateThemeLabels);
        });

        updateScrolledState();
        updateThemeLabels();
    }

    function initializeReveals() {
        var elements = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
        if (!elements.length) return;

        document.querySelectorAll("[data-reveal-stagger]").forEach(function (group) {
            var start = Number(group.dataset.revealStart || 180);
            var step = Number(group.dataset.revealStep || 85);
            var children = Array.prototype.slice.call(group.querySelectorAll("[data-reveal]")).filter(function (element) {
                return element.closest("[data-reveal-stagger]") === group;
            });

            children.forEach(function (element, index) {
                if (element.hasAttribute("data-reveal-delay")) return;
                element.dataset.revealDelay = String(start + Math.min(index, 4) * step);
            });
        });

        elements.forEach(function (element) {
            var delay = Number(element.dataset.revealDelay || 0);
            element.style.setProperty("--reveal-delay", Math.max(0, delay) + "ms");
        });

        if (reducedMotion.matches || !("IntersectionObserver" in window)) {
            elements.forEach(function (element) {
                element.classList.add("is-visible");
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.01,
            rootMargin: "0px 0px -6% 0px"
        });

        elements.forEach(function (element) {
            observer.observe(element);
        });
    }

    function initializeScrollspy() {
        if (!("IntersectionObserver" in window)) return;

        document.querySelectorAll("[data-scrollspy]").forEach(function (navigation) {
            var links = Array.prototype.slice.call(navigation.querySelectorAll('a[href^="#"]'));
            var targets = links.map(function (link) {
                var id = decodeURIComponent(link.getAttribute("href").slice(1));
                return document.getElementById(id);
            }).filter(Boolean);

            if (!targets.length) return;

            function setActive(id) {
                links.forEach(function (link) {
                    var isActive = decodeURIComponent(link.getAttribute("href").slice(1)) === id;
                    link.classList.toggle("is-active", isActive);
                    if (isActive) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            }

            var observer = new IntersectionObserver(function (entries) {
                var visible = entries.filter(function (entry) { return entry.isIntersecting; });
                if (!visible.length) return;
                visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; });
                setActive(visible[0].target.id);
            }, {
                rootMargin: "-18% 0px -68% 0px",
                threshold: [0, 0.25, 0.6]
            });

            targets.forEach(function (target) { observer.observe(target); });
        });
    }

    function initializePhotoLightbox() {
        var lightbox = document.querySelector("[data-photo-lightbox]");
        if (!lightbox) return;

        var image = lightbox.querySelector("img");
        var closeButton = lightbox.querySelector("[data-lightbox-close]");
        var previousFocus = null;

        function closeLightbox() {
            lightbox.classList.remove("is-open");
            lightbox.setAttribute("aria-hidden", "true");
            image.removeAttribute("src");
            image.alt = "";
            document.body.classList.remove("menu-open");
            if (previousFocus) previousFocus.focus();
        }

        document.querySelectorAll("[data-photo]").forEach(function (button) {
            button.addEventListener("click", function () {
                previousFocus = button;
                image.src = button.dataset.photo;
                image.alt = button.querySelector("img").alt;
                lightbox.classList.add("is-open");
                lightbox.setAttribute("aria-hidden", "false");
                document.body.classList.add("menu-open");
                closeButton.focus();
            });
        });

        closeButton.addEventListener("click", closeLightbox);
        lightbox.addEventListener("click", function (event) {
            if (event.target === lightbox) closeLightbox();
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
                closeLightbox();
            }
        });
    }

    function initializeEmbeddedFigures() {
        var frames = Array.prototype.slice.call(document.querySelectorAll(".project-figure iframe"));
        if (!frames.length) return;

        function applyFigureTheme(frame) {
            var dark = root.dataset.scheme === "dark";
            var background = dark ? "#000000" : "#ffffff";

            frame.style.backgroundColor = background;

            try {
                var frameDocument = frame.contentDocument;
                var frameWindow = frame.contentWindow;
                if (!frameDocument || !frameWindow) return;

                frameDocument.documentElement.style.backgroundColor = background;
                frameDocument.body.style.backgroundColor = background;

                var plot = frameDocument.querySelector(".plotly-graph-div");
                if (!plot || !frameWindow.Plotly || !plot._fullLayout) return;

                frameWindow.Plotly.relayout(plot, {
                    paper_bgcolor: background,
                    plot_bgcolor: dark ? "#000000" : "#e5ecf6",
                    "font.color": dark ? "#f5f5f7" : "#2a3f5f",
                    "geo.bgcolor": background,
                    "geo.landcolor": dark ? "#111214" : "#e5ecf6",
                    "geo.lakecolor": background,
                    "geo.subunitcolor": dark ? "#55565b" : "#ffffff"
                });
            } catch (error) {
                /* Cross-origin figures retain the themed iframe background. */
            }
        }

        frames.forEach(function (frame) {
            frame.addEventListener("load", function () { applyFigureTheme(frame); });
            applyFigureTheme(frame);
        });

        window.addEventListener("onColorSchemeChange", function () {
            window.requestAnimationFrame(function () {
                frames.forEach(applyFigureTheme);
            });
        });
    }

    function createSignalTraceController(size, randomFunction) {
        var random = typeof randomFunction === "function" ? randomFunction : Math.random;
        var state = { best: 0, inputIndex: 0, level: 0, sequence: [], streak: 0 };

        function chooseNext() {
            var next = Math.floor(random() * size);
            var previous = state.sequence[state.sequence.length - 1];
            if (size > 1) {
                while (next === previous) next = Math.floor(random() * size);
            }
            return next;
        }

        function snapshot() {
            return {
                best: state.best,
                inputIndex: state.inputIndex,
                level: state.level,
                sequence: state.sequence.slice(),
                streak: state.streak
            };
        }

        return {
            addStep: function () {
                state.sequence.push(chooseNext());
                state.level = state.sequence.length;
                state.inputIndex = 0;
                return snapshot();
            },
            getState: snapshot,
            guess: function (index) {
                var expected = state.sequence[state.inputIndex];
                if (index !== expected) {
                    state.best = Math.max(state.best, state.level - 1);
                    state.inputIndex = 0;
                    state.streak = 0;
                    return { complete: false, correct: false, expected: expected, state: snapshot() };
                }

                state.inputIndex += 1;
                state.streak += 1;
                if (state.inputIndex === state.sequence.length) {
                    state.best = Math.max(state.best, state.level);
                    return { complete: true, correct: true, expected: expected, state: snapshot() };
                }
                return { complete: false, correct: true, expected: expected, state: snapshot() };
            },
            resetInput: function () {
                state.inputIndex = 0;
                return snapshot();
            },
            start: function (best) {
                state.best = Math.max(state.best, best || 0);
                state.inputIndex = 0;
                state.level = 1;
                state.sequence = [chooseNext()];
                state.streak = 0;
                return snapshot();
            }
        };
    }

    function initializeSignalTrace() {
        window.createSignalTraceController = createSignalTraceController;

        document.querySelectorAll("[data-pattern-game]").forEach(function (game) {
            var nodes = Array.prototype.slice.call(game.querySelectorAll("[data-node]"));
            var startButton = game.querySelector("[data-start]");
            var replayButton = game.querySelector("[data-replay]");
            var status = game.querySelector("[data-status]");
            var level = game.querySelector("[data-level]");
            var streak = game.querySelector("[data-streak]");
            var best = game.querySelector("[data-best]");
            var storageKey = "pattern-seekers-signal-trace-best";
            var controller = createSignalTraceController(nodes.length);
            var acceptingInput = false;
            var playing = false;

            function readBest() {
                try {
                    return Number(window.localStorage.getItem(storageKey)) || 0;
                } catch (error) {
                    return 0;
                }
            }

            function writeBest(value) {
                try {
                    window.localStorage.setItem(storageKey, String(value));
                } catch (error) {
                    return;
                }
            }

            function wait(milliseconds) {
                return new Promise(function (resolve) { window.setTimeout(resolve, milliseconds); });
            }

            function setStatus(message, tone) {
                status.textContent = message;
                game.dataset.tone = tone || "ready";
            }

            function setBoardEnabled(enabled) {
                nodes.forEach(function (node) { node.disabled = !enabled; });
            }

            function pulseNode(index, className, duration) {
                var node = nodes[index];
                if (!node) return;
                node.classList.add(className);
                window.setTimeout(function () { node.classList.remove(className); }, duration || 420);
            }

            function updateStats(nextState) {
                var current = nextState || controller.getState();
                level.textContent = String(current.level);
                streak.textContent = String(current.streak);
                best.textContent = String(Math.max(current.best, readBest()));
            }

            async function playSequence() {
                var current = controller.getState();
                if (playing || current.sequence.length === 0) return;

                acceptingInput = false;
                playing = true;
                replayButton.disabled = true;
                setBoardEnabled(false);
                setStatus("Reading the signal…", "watch");
                await wait(reducedMotion.matches ? 80 : 300);

                for (var index = 0; index < current.sequence.length; index += 1) {
                    pulseNode(current.sequence[index], "is-pulse", reducedMotion.matches ? 180 : 480);
                    await wait(reducedMotion.matches ? 240 : 560);
                }

                acceptingInput = true;
                playing = false;
                replayButton.disabled = false;
                setBoardEnabled(true);
                setStatus("Your turn. Replay the path.", "play");
            }

            function startGame() {
                var current = controller.start(readBest());
                writeBest(current.best);
                updateStats(current);
                startButton.textContent = "New Trace";
                playSequence();
            }

            function handleGuess(index) {
                if (!acceptingInput || playing) return;
                var result = controller.guess(index);
                pulseNode(index, result.correct ? "is-hit" : "is-miss", 520);

                if (!result.correct) {
                    acceptingInput = false;
                    setBoardEnabled(false);
                    pulseNode(result.expected, "is-expected", 720);
                    writeBest(result.state.best);
                    updateStats(result.state);
                    setStatus("Glitch spotted. Start a fresh trace.", "miss");
                    return;
                }

                updateStats(result.state);
                if (result.complete) {
                    acceptingInput = false;
                    setBoardEnabled(false);
                    replayButton.disabled = true;
                    writeBest(result.state.best);
                    setStatus("Trace locked. Leveling up…", "hit");
                    window.setTimeout(function () {
                        updateStats(controller.addStep());
                        playSequence();
                    }, reducedMotion.matches ? 240 : 760);
                    return;
                }

                setStatus("Good hit. Keep tracing.", "hit");
            }

            nodes.forEach(function (node) {
                node.addEventListener("click", function () { handleGuess(Number(node.dataset.node)); });
            });
            startButton.addEventListener("click", startGame);
            replayButton.addEventListener("click", function () {
                if (playing) return;
                controller.resetInput();
                playSequence();
            });

            best.textContent = String(readBest());
            game.signalTraceGame = { clickNode: handleGuess, controller: controller, play: playSequence, start: startGame };
        });
    }

    function initializeInterferenceCanvas() {
        var canvas = document.querySelector("[data-interference-canvas]");
        if (!canvas) return;

        var context = canvas.getContext("2d", { alpha: true, desynchronized: true });
        var field = document.createElement("canvas");
        var fieldContext = field.getContext("2d", { alpha: false });
        var imageData = null;
        var cssWidth = 0;
        var cssHeight = 0;
        var fieldWidth = 0;
        var fieldHeight = 0;
        var frameId = 0;
        var lastFrame = 0;
        var startTime = performance.now();
        var visible = true;

        function clamp(value, minimum, maximum) {
            return Math.max(minimum, Math.min(maximum, value));
        }

        function smoothstep(value) {
            var amount = clamp(value, 0, 1);
            return amount * amount * (3 - 2 * amount);
        }

        function noise(x, y) {
            var value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            return (value - Math.floor(value)) * 2 - 1;
        }

        function resize() {
            canvas.classList.remove("is-ready");
            var bounds = canvas.getBoundingClientRect();
            cssWidth = Math.max(1, Math.round(bounds.width));
            cssHeight = Math.max(1, Math.round(bounds.height));
            var pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);

            canvas.width = Math.round(cssWidth * pixelRatio);
            canvas.height = Math.round(cssHeight * pixelRatio);
            canvas.style.width = cssWidth + "px";
            canvas.style.height = cssHeight + "px";
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

            fieldWidth = Math.max(180, Math.round(cssWidth * 0.48));
            fieldHeight = Math.max(180, Math.round(cssHeight * 0.48));
            field.width = fieldWidth;
            field.height = fieldHeight;
            imageData = fieldContext.createImageData(fieldWidth, fieldHeight);
        }

        function render(time) {
            if (!visible || document.hidden) {
                frameId = window.requestAnimationFrame(render);
                return;
            }

            if (time - lastFrame < 32 && !reducedMotion.matches) {
                frameId = window.requestAnimationFrame(render);
                return;
            }

            lastFrame = time;
            var dark = root.dataset.scheme === "dark";
            var lightBase = 245;
            var cycle = ((time - startTime) % 12000) / 12000;
            var temporalPhase = cycle * Math.PI * 2 * 6;
            var sourceOne = { x: fieldWidth * 0.68, y: fieldHeight * 0.34 };
            var sourceTwo = { x: fieldWidth * 0.43, y: fieldHeight * 0.70 };
            var data = imageData.data;
            var wavelength = Math.max(15, Math.min(fieldWidth, fieldHeight) * 0.072);
            var waveNumber = (Math.PI * 2) / wavelength;
            var edgeWidthX = Math.max(1, fieldWidth * 0.17);
            var edgeWidthY = Math.max(1, fieldHeight * 0.16);

            for (var y = 0; y < fieldHeight; y += 1) {
                for (var x = 0; x < fieldWidth; x += 1) {
                    var dxOne = x - sourceOne.x;
                    var dyOne = y - sourceOne.y;
                    var dxTwo = x - sourceTwo.x;
                    var dyTwo = y - sourceTwo.y;
                    var radiusOne = Math.sqrt(dxOne * dxOne + dyOne * dyOne) + 0.001;
                    var radiusTwo = Math.sqrt(dxTwo * dxTwo + dyTwo * dyTwo) + 0.001;
                    var envelopeOne = (1 - Math.exp(-radiusOne * 0.09)) * Math.exp(-radiusOne * 0.0065) / Math.sqrt(1 + radiusOne * 0.018);
                    var envelopeTwo = (1 - Math.exp(-radiusTwo * 0.09)) * Math.exp(-radiusTwo * 0.0065) / Math.sqrt(1 + radiusTwo * 0.018);
                    var phaseOne = waveNumber * radiusOne - temporalPhase;
                    var phaseTwo = waveNumber * radiusTwo - temporalPhase;
                    var waveOne = Math.sin(phaseOne) * envelopeOne;
                    var waveTwo = Math.sin(phaseTwo) * envelopeTwo;
                    var height = waveOne + waveTwo;

                    var slopeX = Math.cos(phaseOne) * envelopeOne * dxOne / radiusOne + Math.cos(phaseTwo) * envelopeTwo * dxTwo / radiusTwo;
                    var slopeY = Math.cos(phaseOne) * envelopeOne * dyOne / radiusOne + Math.cos(phaseTwo) * envelopeTwo * dyTwo / radiusTwo;
                    var interference = waveOne * waveTwo;
                    var sourceDepression = -Math.exp(-(radiusOne * radiusOne) / 12) - Math.exp(-(radiusTwo * radiusTwo) / 12);
                    var illumination = (-slopeX * 0.52 - slopeY * 0.72) * 26 + height * 7 + interference * 12 + sourceDepression * 18;

                    var edge = Math.min(
                        x / edgeWidthX,
                        (fieldWidth - 1 - x) / edgeWidthX,
                        y / edgeWidthY,
                        (fieldHeight - 1 - y) / edgeWidthY,
                        1
                    );
                    var fade = smoothstep(edge);
                    var dither = noise(x, y) * (dark ? 0.75 : 2.2) * fade;
                    var offset = (y * fieldWidth + x) * 4;

                    if (dark) {
                        /* Invert the signed relief visible in light mode, then colorize it. */
                        var physicalCaustic = Math.pow(clamp(Math.max(illumination, 0) / 44, 0, 1), 0.78);
                        var refractivePhase = (phaseOne - phaseTwo) * 0.026 + height * 0.72 + temporalPhase * 0.018;
                        var redBand = 0.5 + 0.5 * Math.cos(refractivePhase);
                        var greenBand = 0.5 + 0.5 * Math.cos(refractivePhase + 2.094);
                        var blueBand = 0.5 + 0.5 * Math.cos(refractivePhase + 4.189);
                        var spectralStrength = fade * physicalCaustic * 242;
                        var whiteCore = fade * Math.pow(physicalCaustic, 2.1) * 18;

                        data[offset] = clamp(whiteCore + spectralStrength * (0.08 + redBand * 0.92) + dither, 0, 255);
                        data[offset + 1] = clamp(whiteCore + spectralStrength * (0.08 + greenBand * 0.92) + dither * 0.7, 0, 255);
                        data[offset + 2] = clamp(whiteCore + spectralStrength * (0.08 + blueBand * 0.92) + dither * 0.45, 0, 255);
                    } else {
                        var lightLuma = clamp(lightBase - fade * illumination + dither, 176, 252);
                        data[offset] = clamp(lightLuma, 0, 255);
                        data[offset + 1] = clamp(lightLuma, 0, 255);
                        data[offset + 2] = clamp(lightLuma + 1.5, 0, 255);
                    }
                    data[offset + 3] = 255;
                }
            }

            fieldContext.putImageData(imageData, 0, 0);
            context.fillStyle = dark ? "#000000" : "#f5f5f7";
            context.fillRect(0, 0, cssWidth, cssHeight);
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
            if (dark) {
                context.save();
                context.globalCompositeOperation = "screen";
                context.globalAlpha = 0.86;
                context.filter = "blur(16px) saturate(220%) brightness(135%)";
                context.drawImage(field, 0, 0, cssWidth, cssHeight);
                context.globalAlpha = 0.62;
                context.filter = "blur(5px) saturate(190%) brightness(120%)";
                context.drawImage(field, 0, 0, cssWidth, cssHeight);
                context.restore();
            }
            context.drawImage(field, 0, 0, cssWidth, cssHeight);
            canvas.classList.add("is-ready");

            if (!reducedMotion.matches) {
                frameId = window.requestAnimationFrame(render);
            }
        }

        if ("ResizeObserver" in window) {
            new ResizeObserver(function () {
                resize();
                if (reducedMotion.matches) render(performance.now());
            }).observe(canvas);
        } else {
            window.addEventListener("resize", resize);
        }

        if ("IntersectionObserver" in window) {
            new IntersectionObserver(function (entries) {
                visible = entries[0].isIntersecting;
            }, { rootMargin: "120px" }).observe(canvas);
        }

        window.addEventListener("onColorSchemeChange", function () {
            canvas.classList.remove("is-ready");
            lastFrame = 0;
            if (reducedMotion.matches) render(performance.now());
        });

        resize();
        render(performance.now());

        window.addEventListener("pagehide", function () {
            window.cancelAnimationFrame(frameId);
        });
    }

    function initializeCoachRoom() {
        var room = document.querySelector("[data-coach-room]");
        if (!room) return;

        var stateControl = room.querySelector("[data-coach-state]");
        var playerControl = room.querySelector("[data-coach-player]");
        var pitch = room.querySelector("[data-coach-pitch]");
        var targetArea = room.querySelector("[data-target-zone]");
        var targetZone = targetArea.querySelector("span");
        var shapeLabel = room.querySelector("[data-shape-label]");
        var planName = room.querySelector("[data-plan-name]");
        var planWhy = room.querySelector("[data-plan-why]");
        var confidence = room.querySelector("[data-confidence]");
        var demoNote = room.querySelector("[data-coach-demo-note]");
        var playerNote = room.querySelector("[data-player-note]");
        var optionDetail = room.querySelector("[data-option-detail]");
        var riskCard = room.querySelector(".coach-effect-grid .is-risk");

        var states = {
            prematch: {
                plan: "Controlled possession → right-side overload",
                confidence: 78,
                why: "Argentina creates its best chances through patient central attraction before releasing the right side. France's left channel is the clearest route to a high-quality cutback.",
                effects: {
                    chance: ["+14%", "78%"],
                    box: ["+11%", "68%"],
                    retention: ["+8%", "58%"],
                    risk: ["+6%", "42%"]
                },
                instructions: {
                    possession: "Build with a 3–2 base. Invite central pressure, then find De Paul or Messi on the right half-space.",
                    finalThird: "Keep width on the far side. Send the forward across the near centre-back and prioritize low cutbacks.",
                    out: "Defend in a compact 4–4–2. Screen central access and guide France toward their right side.",
                    transition: "Enzo protects the centre. Counterpress for five seconds; recover shape if the first wave is broken."
                },
                options: { controlled: 64, transition: 58, wide: 54 },
                pitch: {
                    shape: "3–2 build · right overload",
                    aria: "Argentina in a 3–2 buildup creating a right-side overload against France",
                    target: ["5%", "2%", "29%", "42%", "Attack this channel"],
                    routes: [["34%", "53%", "17%", "5deg"], ["36%", "70%", "14%", "37deg"]],
                    team: {
                        gk: [10, 50], molina: [28, 20], romero: [28, 41],
                        otamendi: [28, 61], tagliafico: [31, 82], enzo: [47, 62],
                        depaul: [53, 34], macallister: [58, 77], messi: [70, 38],
                        dimaria: [76, 15], forward: [83, 57]
                    },
                    opponent: {
                        gk: [89, 50], rb: [72, 17], rcb: [74, 44], lcb: [71, 65],
                        lb: [67, 84], rm: [57, 25], cm: [57, 52], lm: [53, 78]
                    }
                }
            },
            leading: {
                plan: "Compact control → selective release",
                confidence: 82,
                why: "With the lead, the model favors central security over constant pressure. France must advance, creating cleaner release moments without exposing Argentina's rest defence.",
                effects: {
                    chance: ["+7%", "54%"],
                    box: ["−3%", "34%"],
                    retention: ["+13%", "76%"],
                    risk: ["−9%", "24%"]
                },
                instructions: {
                    possession: "Slow the restart and keep a 3–2 platform. Circulate until France's midfield line steps beyond the ball.",
                    finalThird: "Attack only with a clear numerical edge. Keep the far-side winger connected to the recovery structure.",
                    out: "Set a compact medium block. Protect the centre first and allow low-value circulation outside.",
                    transition: "First look forward into the space France leaves; otherwise secure possession and reset the block."
                },
                options: { controlled: 68, transition: 61, wide: 57 },
                pitch: {
                    shape: "4–4–2 mid-block · release",
                    aria: "Argentina protecting a lead in a compact medium block with two release players",
                    target: ["23%", "3%", "39%", "56%", "Release into open field"],
                    routes: [["43%", "43%", "23%", "-9deg"], ["39%", "65%", "18%", "-25deg"]],
                    team: {
                        gk: [8, 50], molina: [24, 20], romero: [23, 41],
                        otamendi: [23, 61], tagliafico: [24, 81], enzo: [39, 58],
                        depaul: [42, 31], macallister: [41, 76], messi: [59, 39],
                        dimaria: [55, 78], forward: [68, 52]
                    },
                    opponent: {
                        gk: [90, 50], rb: [66, 16], rcb: [69, 39], lcb: [69, 62],
                        lb: [65, 84], rm: [48, 23], cm: [50, 49], lm: [47, 77]
                    }
                }
            },
            drawing: {
                plan: "Controlled overload → higher fullback",
                confidence: 75,
                why: "The original plan remains the best fit, but the right-back can advance earlier. The extra width increases box access without moving both rest-defence players ahead of the ball.",
                effects: {
                    chance: ["+16%", "84%"],
                    box: ["+14%", "77%"],
                    retention: ["+5%", "48%"],
                    risk: ["+9%", "53%"]
                },
                instructions: {
                    possession: "Keep the 3–2 build, but release Molina one line earlier when France's winger narrows.",
                    finalThird: "Create a 3v2 on the right. Occupy the box with two runners and hold the far-side edge.",
                    out: "Press the first backward pass, then settle into a compact 4–4–2 if the press is bypassed.",
                    transition: "Counterpress around the right half-space. Enzo and the left-back protect the central escape route."
                },
                options: { controlled: 66, transition: 60, wide: 56 },
                pitch: {
                    shape: "3–2 build · higher fullback",
                    aria: "Argentina drawing level opponents with a higher right-back and a three-player right overload",
                    target: ["2%", "1%", "31%", "45%", "Create the 3v2"],
                    routes: [["25%", "55%", "19%", "-12deg"], ["22%", "73%", "15%", "32deg"]],
                    team: {
                        gk: [10, 50], molina: [59, 14], romero: [29, 39],
                        otamendi: [28, 61], tagliafico: [31, 83], enzo: [48, 60],
                        depaul: [62, 31], macallister: [60, 74], messi: [73, 39],
                        dimaria: [76, 84], forward: [85, 55]
                    },
                    opponent: {
                        gk: [91, 50], rb: [75, 17], rcb: [77, 42], lcb: [74, 65],
                        lb: [69, 84], rm: [59, 22], cm: [60, 51], lm: [56, 76]
                    }
                }
            },
            trailing: {
                plan: "Aggressive 3–2–5 → immediate counterpress",
                confidence: 69,
                why: "The need to score now outweighs transition safety. Five attacking lanes and an aggressive counterpress produce the greatest chance volume, with a clearly higher concession risk.",
                effects: {
                    chance: ["+24%", "94%"],
                    box: ["+21%", "88%"],
                    retention: ["−4%", "31%"],
                    risk: ["+18%", "79%"]
                },
                instructions: {
                    possession: "Form a 3–2–5 and pin France's back line. Move the ball quickly enough to prevent the block from resetting.",
                    finalThird: "Fill all five lanes. Attack the six-yard box with two runners and protect the edge for second balls.",
                    out: "Press man-oriented from every restart. Force France long and keep the defensive line near halfway.",
                    transition: "Counterpress immediately with the nearest four players. Accept the one-on-one risk behind the attack."
                },
                options: { controlled: 57, transition: 63, wide: 55 },
                pitch: {
                    shape: "3–2–5 attack · counterpress",
                    aria: "Argentina chasing the match in an aggressive 3–2–5 against a deep France block",
                    target: ["12%", "0%", "27%", "76%", "Flood the last line"],
                    routes: [["48%", "49%", "25%", "-31deg"], ["50%", "48%", "31%", "19deg"]],
                    team: {
                        gk: [9, 50], molina: [70, 10], romero: [29, 30],
                        otamendi: [28, 51], tagliafico: [30, 72], enzo: [48, 57],
                        depaul: [50, 35], macallister: [71, 69], messi: [73, 34],
                        dimaria: [70, 89], forward: [85, 51]
                    },
                    opponent: {
                        gk: [92, 50], rb: [80, 14], rcb: [81, 40], lcb: [81, 61],
                        lb: [79, 86], rm: [67, 23], cm: [68, 49], lm: [66, 76]
                    }
                }
            }
        };

        var optionCopy = {
            controlled: {
                target: "Attack this channel",
                detail: "Selected because it preserves Argentina's strongest possession pattern while targeting France's most vulnerable recovery channel."
            },
            transition: {
                target: "Release behind pressure",
                detail: "A faster route with more open-field opportunities, but a higher turnover cost and less control over where possession ends."
            },
            wide: {
                target: "Stretch the weak side",
                detail: "Safer circulation can widen France's block, though it produces fewer central receptions and lower-value final actions."
            }
        };

        var optionVisuals = {
            controlled: {
                target: ["5%", "2%", "29%", "42%", "Attack this channel"],
                routes: [["34%", "53%", "17%", "5deg"], ["36%", "70%", "14%", "37deg"]]
            },
            transition: {
                target: ["28%", "3%", "42%", "50%", "Release behind pressure"],
                routes: [["48%", "42%", "27%", "-16deg"], ["39%", "67%", "18%", "20deg"]]
            },
            wide: {
                target: ["63%", "2%", "38%", "32%", "Stretch the weak side"],
                routes: [["72%", "48%", "28%", "8deg"], ["79%", "73%", "13%", "-20deg"]]
            }
        };

        var playerJobs = {
            "Martínez": "Martínez · Invite the first press, then find the free centre-back rather than forcing the central pass.",
            "Molina": "Molina · Hold width, arrive beyond De Paul, and protect the immediate recovery lane after a turnover.",
            "Romero": "Romero · Step into midfield when unopposed and defend the first forward transition aggressively.",
            "Otamendi": "Otamendi · Anchor the back three and protect depth while the right side overloads.",
            "Tagliafico": "Tagliafico · Stay connected as the third defender until the attack is securely established.",
            "Enzo": "Enzo · Control the tempo, screen the centre, and become the first rest-defence player after possession loss.",
            "De Paul": "De Paul · Run beyond Messi into the right channel when defenders collapse toward the ball.",
            "Mac Allister": "Mac Allister · Balance the structure, arrive late at the box edge, and connect the far-side switch.",
            "Messi": "Messi · Attract pressure in the half-space, turn if free, and release the runner when the second defender commits.",
            "Di María": "Di María · Preserve weak-side width and attack the back post after the overload reaches the byline.",
            "Álvarez": "Álvarez · Stretch depth, cross the near centre-back, and attack the cutback zone at speed.",
            "Lautaro": "Lautaro · Pin both centre-backs, offer a stronger wall pass, and occupy the central finishing lane."
        };

        function setText(selector, value) {
            var element = room.querySelector(selector);
            if (element) element.textContent = value;
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

        function applyTargetAndRoutes(visual) {
            var target = visual.target;
            var routes = visual.routes;
            targetArea.style.top = target[0];
            targetArea.style.right = target[1];
            targetArea.style.width = target[2];
            targetArea.style.height = target[3];
            targetZone.textContent = target[4];

            room.querySelectorAll("[data-route]").forEach(function (route, index) {
                var values = routes[index];
                route.style.top = values[0];
                route.style.left = values[1];
                route.style.width = values[2];
                route.style.transform = "rotate(" + values[3] + ")";
            });
        }

        function setNodePositions(kind, positions) {
            Object.keys(positions).forEach(function (key) {
                var node = room.querySelector("[data-" + kind + '-node="' + key + '"]');
                if (!node) return;
                node.style.setProperty("--x", positions[key][0] + "%");
                node.style.setProperty("--y", positions[key][1] + "%");
            });
        }

        function applyScenarioPitch(pitchState) {
            setNodePositions("team", pitchState.team);
            setNodePositions("opponent", pitchState.opponent);
            shapeLabel.textContent = pitchState.shape;
            pitch.setAttribute("aria-label", pitchState.aria);
            applyTargetAndRoutes(pitchState);
        }

        function selectOption(key, keepScenarioVisual) {
            room.querySelectorAll("[data-option]").forEach(function (button) {
                var selected = button.dataset.option === key;
                button.classList.toggle("is-selected", selected);
                button.setAttribute("aria-pressed", String(selected));
            });
            pitch.dataset.mode = key;
            if (!keepScenarioVisual) applyTargetAndRoutes(optionVisuals[key]);
            optionDetail.textContent = optionCopy[key].detail;
        }

        function updatePlayer() {
            var lautaro = playerControl.value === "lautaro";
            var currentState = states[stateControl.value];
            var adjustedConfidence = currentState.confidence + (lautaro ? -2 : 0);
            var playerName = lautaro ? "Lautaro Martínez" : "Julián Álvarez";
            var shortName = lautaro ? "Lautaro" : "Álvarez";
            var number = lautaro ? "22" : "9";

            confidence.textContent = adjustedConfidence + "%";
            setText("[data-forward-number]", number);
            setText("[data-forward-name]", shortName);
            setText("[data-role-forward-number]", number);
            setText("[data-role-forward-name]", playerName);
            setText("[data-role-forward-role]", lautaro ? "Reference striker" : "Depth runner");
            setText("[data-role-forward-job]", lautaro ? "Pin both centre-backs" : "Pin the centre-back");
            setText("[data-lineup-fit]", "Lineup fit · " + (lautaro ? "82%" : "86%"));

            var node = room.querySelector("[data-forward-node]");
            if (node) {
                node.setAttribute("aria-label", playerName + ", " + (lautaro ? "reference striker" : "depth runner"));
            }
            demoNote.textContent = lautaro
                ? "Demonstration scenario · Recommendation recalculated for Lautaro Martínez"
                : "Demonstration scenario · Illustrative outputs until the production model is connected";
        }

        function updateState() {
            var current = states[stateControl.value];
            planName.textContent = current.plan;
            planWhy.textContent = current.why;

            Object.keys(current.effects).forEach(function (key) {
                var value = room.querySelector('[data-effect="' + key + '"]');
                var bar = room.querySelector('[data-effect-bar="' + key + '"]');
                if (value) value.textContent = current.effects[key][0];
                if (bar) bar.style.setProperty("--value", current.effects[key][1]);
            });

            setText("[data-in-possession]", current.instructions.possession);
            setText("[data-final-third]", current.instructions.finalThird);
            setText("[data-out-possession]", current.instructions.out);
            setText("[data-transition]", current.instructions.transition);
            updateOptionScores(current.options);
            riskCard.classList.toggle("is-safer", current.effects.risk[0].charAt(0) === "−");
            applyScenarioPitch(current.pitch);
            selectOption(stateControl.value === "trailing" ? "transition" : "controlled", true);
            updatePlayer();
        }

        room.querySelectorAll("[data-option]").forEach(function (button) {
            button.addEventListener("click", function () {
                selectOption(button.dataset.option, false);
            });
        });

        room.querySelectorAll("button.coach-player.is-team").forEach(function (button) {
            button.addEventListener("click", function () {
                var label = button.querySelector("small");
                if (!label) return;
                var name = label.textContent.trim();
                playerNote.textContent = playerJobs[name] || "Role detail will be available when the production player model is connected.";
            });
        });

        stateControl.addEventListener("change", updateState);
        playerControl.addEventListener("change", function () {
            updatePlayer();
            var forwardLabel = playerControl.value === "lautaro" ? "Lautaro" : "Álvarez";
            playerNote.textContent = playerJobs[forwardLabel];
        });

        updateState();
    }

    initializeNavigation();
    initializeReveals();
    initializeScrollspy();
    initializePhotoLightbox();
    initializeEmbeddedFigures();
    initializeSignalTrace();
    initializeInterferenceCanvas();
    initializeCoachRoom();
})();
