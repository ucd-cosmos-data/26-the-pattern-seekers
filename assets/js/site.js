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
        var optionDetail = room.querySelector("[data-option-detail]");
        var riskCard = room.querySelector(".coach-effect-grid .is-risk");
        var coachBall = room.querySelector("[data-coach-ball]");
        var animationPlay = room.querySelector("[data-animation-play]");
        var animationCount = room.querySelector("[data-animation-count]");
        var animationTitle = room.querySelector("[data-animation-title]");
        var animationCopy = room.querySelector("[data-animation-copy]");
        var animationControls = room.querySelector(".coach-animation__controls");
        var animationTimeline = room.querySelector(".coach-timeline");
        var animationScrubber = room.querySelector("[data-animation-scrubber]");
        var animationTime = room.querySelector("[data-animation-time]");
        var animationSpeed = room.querySelector("[data-animation-speed]");
        var tacticCanvas = room.querySelector("[data-coach-canvas]");
        var tacticContext = tacticCanvas.getContext("2d");
        var animationFrameId = 0;
        var animationStartTime = 0;
        var animationElapsed = 0;
        var animationDuration = 12000;
        var activeTacticView = "attack";
        var currentPhaseIndex = 0;
        var motionCache = {};

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
                        lb: [67, 84], rm: [57, 25], cm: [57, 52], lm: [53, 78],
                        rw: [42, 18], st: [39, 50], lw: [42, 82]
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
                        lb: [65, 84], rm: [48, 23], cm: [50, 49], lm: [47, 77],
                        rw: [35, 17], st: [32, 50], lw: [35, 83]
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
                        lb: [69, 84], rm: [59, 22], cm: [60, 51], lm: [56, 76],
                        rw: [44, 18], st: [41, 50], lw: [44, 82]
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
                        lb: [79, 86], rm: [67, 23], cm: [68, 49], lm: [66, 76],
                        rw: [55, 19], st: [53, 50], lw: [55, 81]
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

        var attackAnimations = {
            prematch: {
                overview: ["3–2 buildup", "Right-side 3v2", "Low cutback", "Five-second press"],
                steps: [
                    {
                        title: "Set the structure",
                        copy: "Build with three behind the ball and two central outlets. Keep both wings available.",
                        shape: "Overall plan · 3–2 buildup",
                        ball: [10, 50],
                        involved: ["gk", "romero", "otamendi", "enzo"],
                        team: {},
                        opponent: {},
                        routes: [["49%", "10%", "0%", "0deg", 0], ["30%", "53%", "0%", "0deg", 0]],
                        targetOpacity: 0.08
                    },
                    {
                        title: "Invite the central press",
                        copy: "Romero carries forward. Enzo stays available while France's midfield steps toward the ball.",
                        shape: "Step 2 · draw pressure",
                        ball: [30, 41],
                        involved: ["romero", "enzo"],
                        team: { romero: [30, 41], enzo: [45, 58], depaul: [53, 31] },
                        opponent: { rm: [47, 25], cm: [48, 49], lm: [46, 75] },
                        routes: [["50%", "10%", "20%", "-12deg", 1], ["58%", "45%", "12%", "-18deg", 0.75]],
                        targetOpacity: 0.12
                    },
                    {
                        title: "Create the right-side overload",
                        copy: "Messi drops toward the ball, De Paul runs beyond him, and Molina holds the outside lane.",
                        shape: "Step 3 · right-side 3v2",
                        ball: [69, 38],
                        involved: ["messi", "depaul", "molina"],
                        team: { molina: [64, 15], depaul: [63, 29], messi: [69, 38], forward: [79, 57] },
                        opponent: { rb: [70, 21], rcb: [72, 40], cm: [61, 47] },
                        routes: [["41%", "30%", "39%", "-4deg", 1], ["31%", "53%", "18%", "-18deg", 1]],
                        targetOpacity: 0.45
                    },
                    {
                        title: "Release and cut back",
                        copy: "Molina attacks the outside shoulder. The forward crosses the centre-back and the cutback arrives behind the defensive line.",
                        shape: "Step 4 · finish the attack",
                        ball: [87, 43],
                        involved: ["molina", "forward", "messi", "depaul"],
                        team: { molina: [84, 18], depaul: [77, 32], messi: [75, 43], forward: [85, 51], dimaria: [79, 78] },
                        opponent: { rb: [78, 22], rcb: [82, 40], lcb: [81, 60], cm: [69, 48] },
                        routes: [["38%", "69%", "20%", "5deg", 1], ["18%", "84%", "25%", "78deg", 1]],
                        targetOpacity: 0.72
                    }
                ]
            },
            leading: {
                overview: ["Compact 4–4–2", "Wait for pressure", "Counter release", "Reset if blocked"],
                steps: [
                    {
                        title: "Protect the centre",
                        copy: "Stay compact behind the ball. Keep Messi and the forward ready to become the first two outlets.",
                        shape: "Overall plan · compact control",
                        ball: [39, 58],
                        involved: ["enzo", "messi", "forward"],
                        team: {},
                        opponent: {},
                        routes: [["58%", "39%", "0%", "0deg", 0], ["39%", "59%", "0%", "0deg", 0]],
                        targetOpacity: 0.06
                    },
                    {
                        title: "Let France step forward",
                        copy: "Secure the first pass and allow France's midfield to advance beyond its defensive cover.",
                        shape: "Step 2 · invite pressure safely",
                        ball: [42, 31],
                        involved: ["depaul", "enzo"],
                        team: { depaul: [42, 31], enzo: [40, 57], messi: [58, 40] },
                        opponent: { rm: [43, 24], cm: [45, 48], lm: [43, 75] },
                        routes: [["57%", "39%", "15%", "-54deg", 1], ["40%", "58%", "12%", "-15deg", 0.65]],
                        targetOpacity: 0.1
                    },
                    {
                        title: "Find the free release player",
                        copy: "Use Messi between the lines as France's midfield loses contact with its back four.",
                        shape: "Step 3 · break the pressure",
                        ball: [61, 39],
                        involved: ["messi", "forward", "depaul"],
                        team: { messi: [61, 39], forward: [70, 51], dimaria: [60, 76] },
                        opponent: { rb: [63, 16], rcb: [69, 39], cm: [52, 49] },
                        routes: [["31%", "42%", "20%", "20deg", 1], ["51%", "61%", "14%", "15deg", 0.9]],
                        targetOpacity: 0.38
                    },
                    {
                        title: "Attack only with the clear edge",
                        copy: "Release the forward into open field. If the lane closes, retain possession and reset the block.",
                        shape: "Step 4 · selective counter",
                        ball: [79, 48],
                        involved: ["forward", "messi", "dimaria"],
                        team: { forward: [79, 48], messi: [68, 38], dimaria: [70, 72] },
                        opponent: { rcb: [76, 39], lcb: [76, 61], cm: [60, 49] },
                        routes: [["39%", "61%", "18%", "14deg", 1], ["72%", "60%", "14%", "-29deg", 0.8]],
                        targetOpacity: 0.58
                    }
                ]
            },
            drawing: {
                overview: ["3–2 buildup", "Higher right-back", "Two box runners", "3+2 rest defence"],
                steps: [
                    {
                        title: "Hold the 3–2 platform",
                        copy: "Keep three players behind the ball and two central protectors before committing the right-back.",
                        shape: "Overall plan · controlled aggression",
                        ball: [29, 39],
                        involved: ["romero", "enzo", "depaul"],
                        team: {},
                        opponent: {},
                        routes: [["39%", "29%", "0%", "0deg", 0], ["31%", "62%", "0%", "0deg", 0]],
                        targetOpacity: 0.08
                    },
                    {
                        title: "Send Molina early",
                        copy: "Molina advances before France's winger can recover. De Paul supports underneath the run.",
                        shape: "Step 2 · raise the fullback",
                        ball: [50, 34],
                        involved: ["molina", "depaul", "romero"],
                        team: { molina: [62, 13], depaul: [56, 31], messi: [69, 40] },
                        opponent: { rm: [54, 22], rb: [71, 18], cm: [57, 49] },
                        routes: [["39%", "29%", "22%", "-13deg", 1], ["31%", "56%", "17%", "-31deg", 1]],
                        targetOpacity: 0.28
                    },
                    {
                        title: "Lock in the 3v2",
                        copy: "Messi receives inside, Molina stays outside, and De Paul runs through the gap between defenders.",
                        shape: "Step 3 · overload the channel",
                        ball: [72, 39],
                        involved: ["messi", "molina", "depaul"],
                        team: { molina: [72, 14], depaul: [69, 29], messi: [72, 39], forward: [82, 54] },
                        opponent: { rb: [75, 21], rcb: [78, 41], cm: [65, 48] },
                        routes: [["34%", "50%", "22%", "8deg", 1], ["29%", "56%", "18%", "-17deg", 1]],
                        targetOpacity: 0.5
                    },
                    {
                        title: "Fill the box with two runners",
                        copy: "The forward attacks the near space, Mac Allister arrives late, and the far winger protects the back-post option.",
                        shape: "Step 4 · two-runner finish",
                        ball: [88, 47],
                        involved: ["forward", "macallister", "dimaria", "molina"],
                        team: { molina: [85, 18], forward: [87, 47], macallister: [80, 63], dimaria: [80, 80], messi: [76, 39] },
                        opponent: { rcb: [83, 40], lcb: [82, 61], lb: [79, 81], cm: [70, 50] },
                        routes: [["39%", "72%", "17%", "12deg", 1], ["18%", "85%", "26%", "83deg", 1]],
                        targetOpacity: 0.74
                    }
                ]
            },
            trailing: {
                overview: ["3–2–5 attack", "Pin all five lanes", "Flood the box", "Immediate counterpress"],
                steps: [
                    {
                        title: "Occupy all five attacking lanes",
                        copy: "Stretch France's back line across the pitch while Enzo and De Paul secure the second ball.",
                        shape: "Overall plan · aggressive 3–2–5",
                        ball: [48, 57],
                        involved: ["enzo", "depaul", "messi"],
                        team: {},
                        opponent: {},
                        routes: [["57%", "48%", "0%", "0deg", 0], ["35%", "50%", "0%", "0deg", 0]],
                        targetOpacity: 0.2
                    },
                    {
                        title: "Move the block before it settles",
                        copy: "Play quickly through the two midfielders. Force France's narrow block to shift toward Messi.",
                        shape: "Step 2 · accelerate circulation",
                        ball: [61, 36],
                        involved: ["depaul", "messi", "enzo"],
                        team: { depaul: [55, 35], messi: [67, 34], enzo: [49, 57] },
                        opponent: { rm: [63, 24], cm: [65, 48], lm: [64, 74] },
                        routes: [["57%", "48%", "18%", "-35deg", 1], ["35%", "55%", "16%", "-3deg", 0.8]],
                        targetOpacity: 0.3
                    },
                    {
                        title: "Pin the line, then find the free lane",
                        copy: "Five attackers occupy five lanes. The central forward pins both centre-backs while the outside lane opens.",
                        shape: "Step 3 · pin the last line",
                        ball: [73, 34],
                        involved: ["messi", "forward", "molina", "dimaria"],
                        team: { molina: [74, 9], messi: [73, 34], forward: [85, 51], macallister: [76, 68], dimaria: [74, 89] },
                        opponent: { rb: [80, 15], rcb: [82, 40], lcb: [82, 61], lb: [80, 85] },
                        routes: [["36%", "61%", "13%", "-5deg", 1], ["51%", "73%", "14%", "31deg", 0.9]],
                        targetOpacity: 0.55
                    },
                    {
                        title: "Flood the finish and counterpress",
                        copy: "Attack the cutback with three players. The nearest four immediately close the ball if the final action is blocked.",
                        shape: "Step 4 · finish, then lock it in",
                        ball: [90, 49],
                        involved: ["forward", "messi", "macallister", "dimaria"],
                        team: { forward: [88, 48], messi: [80, 36], macallister: [84, 63], dimaria: [83, 78], molina: [85, 17] },
                        opponent: { rcb: [85, 39], lcb: [85, 60], cm: [73, 49], rb: [83, 19], lb: [82, 80] },
                        routes: [["34%", "73%", "19%", "25deg", 1], ["17%", "85%", "30%", "83deg", 1]],
                        targetOpacity: 0.8
                    }
                ]
            }
        };

        var tacticViewProfiles = {
            prematch: {
                formation: {
                    labels: ["In possession", "Out of possession", "Rest defence", "Last line"],
                    values: ["3–2–5", "4–4–2", "3 + 2", "Five lanes"],
                    shape: "Formation · 3–2–5",
                    title: "Three build, two connect, five attack",
                    copy: "The fullbacks are asymmetric: Molina advances while Tagliafico protects the back three. Messi owns the right half-space.",
                    progress: 0.08
                },
                dimensions: {
                    labels: ["Attacking width", "Line height", "Team depth", "Weak-side gap"],
                    values: ["62 m", "48 m", "43 m", "14 m"],
                    shape: "Dimensions · stretch then connect",
                    title: "Stretch the block without disconnecting",
                    copy: "Hold maximum width in the first two thirds, then reduce the gaps around the ball before the final pass.",
                    progress: 0.52
                },
                press: {
                    labels: ["Press shape", "Primary trigger", "Lock direction", "Fallback"],
                    values: ["4–4–2", "Backward pass", "France right", "Mid-block"],
                    shape: "Press · curved front two",
                    title: "Screen the pivot, force the outside pass",
                    copy: "The first forward curves the press to remove the central return. The near winger jumps only after the fullback receives.",
                    progress: 0.38
                },
                transition: {
                    labels: ["Rest defence", "Counterpress", "First release", "Recovery"],
                    values: ["3 + 2", "5 seconds", "Right channel", "4–4–2"],
                    shape: "Transition · protect the centre",
                    title: "Five close the ball, five protect the field",
                    copy: "The nearest unit counterpresses while the back three and Enzo defend the central counterattack lane.",
                    progress: 0.92
                }
            },
            leading: {
                formation: {
                    labels: ["In possession", "Out of possession", "Rest defence", "Release"],
                    values: ["3–2–3–2", "4–4–2", "4 + 1", "Front two"],
                    shape: "Formation · compact control",
                    title: "Keep one more player behind the attack",
                    copy: "The wide players start lower, the midfield stays connected, and only the front two remain beyond the ball.",
                    progress: 0.08
                },
                dimensions: {
                    labels: ["Defensive width", "Line height", "Unit depth", "Vertical gap"],
                    values: ["44 m", "41 m", "31 m", "9 m"],
                    shape: "Dimensions · deny the centre",
                    title: "Shorter distances make the lead safer",
                    copy: "The block narrows and compresses vertically. France can circulate outside but cannot play cleanly through the middle.",
                    progress: 0.42
                },
                press: {
                    labels: ["Press shape", "Primary trigger", "Lock direction", "Do not chase"],
                    values: ["4–4–2", "Loose touch", "Touchline", "Centre-backs"],
                    shape: "Press · selective, not constant",
                    title: "Press the mistake, not every pass",
                    copy: "Hold the medium block until a poor touch, bouncing pass, or isolated fullback creates a high-probability regain.",
                    progress: 0.38
                },
                transition: {
                    labels: ["First action", "Release target", "Support", "If blocked"],
                    values: ["Secure", "Messi", "Forward + wing", "Reset"],
                    shape: "Transition · selective release",
                    title: "Counter only when the field is open",
                    copy: "The first look is forward into the space France vacates. If the lane is not clean, secure the ball and restore the block.",
                    progress: 0.94
                }
            },
            drawing: {
                formation: {
                    labels: ["In possession", "Out of possession", "Rest defence", "Extra runner"],
                    values: ["3–2–5", "4–4–2", "3 + 2", "Molina"],
                    shape: "Formation · higher right-back",
                    title: "Add one runner without losing the platform",
                    copy: "Molina joins the last line earlier, but Enzo and the three defenders remain positioned for the turnover.",
                    progress: 0.12
                },
                dimensions: {
                    labels: ["Attacking width", "Line height", "Team depth", "Box spacing"],
                    values: ["64 m", "53 m", "46 m", "10–12 m"],
                    shape: "Dimensions · aggressive width",
                    title: "Stretch wider, arrive closer together",
                    copy: "The first line stays wide to move France. The finishing unit then compresses around the box for combinations and second balls.",
                    progress: 0.58
                },
                press: {
                    labels: ["Press shape", "Primary trigger", "Second wave", "Fallback"],
                    values: ["4–3–3", "Back pass", "Man-oriented", "4–4–2"],
                    shape: "Press · raise the first wave",
                    title: "Use one aggressive press, then recover",
                    copy: "Jump on the first backward pass with three players. If France escapes, recover the compact shape instead of chasing.",
                    progress: 0.46
                },
                transition: {
                    labels: ["Rest defence", "Counterpress", "Box runners", "Risk level"],
                    values: ["3 + 2", "Immediate", "Two", "Medium-high"],
                    shape: "Transition · close the right half-space",
                    title: "The overload must also secure the loss",
                    copy: "The right-side triangle closes immediately after a turnover while Enzo blocks the direct central release.",
                    progress: 0.95
                }
            },
            trailing: {
                formation: {
                    labels: ["In possession", "Last line", "Rest defence", "Box occupation"],
                    values: ["3–2–5", "Five lanes", "2 + 2", "Three runners"],
                    shape: "Formation · maximum pressure",
                    title: "Five pin the line, four secure the wave",
                    copy: "The front five occupy every lane. Two midfielders and two defenders control clearances and restart the attack.",
                    progress: 0.12
                },
                dimensions: {
                    labels: ["Attacking width", "Line height", "Team depth", "Box density"],
                    values: ["67 m", "59 m", "51 m", "Three + two"],
                    shape: "Dimensions · squeeze the pitch",
                    title: "Make the field wide for us and short for them",
                    copy: "Use the full width in possession while the back line holds near halfway to keep second balls inside the attacking half.",
                    progress: 0.62
                },
                press: {
                    labels: ["Press shape", "Primary trigger", "Marking", "Line height"],
                    values: ["3–4–3", "Every restart", "Man-oriented", "59 m"],
                    shape: "Press · lock the restart",
                    title: "Do not let France leave its defensive third",
                    copy: "Match the short options, force the long clearance, and position the midfield underneath the second ball.",
                    progress: 0.52
                },
                transition: {
                    labels: ["Rest defence", "Counterpress", "Risk", "Recovery"],
                    values: ["2 + 2", "Immediate", "Accepted", "Sprint inside"],
                    shape: "Transition · attack the next action",
                    title: "Treat the loss as the start of the next attack",
                    copy: "Four players close the ball and nearby exits. The remaining defenders protect only the direct route to goal.",
                    progress: 0.97
                }
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
                route.style.opacity = values.length > 4 ? String(values[4]) : "1";
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

        function selectOption(key) {
            room.querySelectorAll("[data-option]").forEach(function (button) {
                var selected = button.dataset.option === key;
                button.classList.toggle("is-selected", selected);
                button.setAttribute("aria-pressed", String(selected));
            });
            optionDetail.textContent = optionCopy[key].detail;
        }

        function clonePositions(positions) {
            var clone = {};
            Object.keys(positions).forEach(function (key) {
                clone[key] = positions[key].slice();
            });
            return clone;
        }

        function clamp(value, minimum, maximum) {
            return Math.min(maximum, Math.max(minimum, value));
        }

        function getMotionFrames(stateKey) {
            if (motionCache[stateKey]) return motionCache[stateKey];

            var sequence = attackAnimations[stateKey];
            var base = states[stateKey].pitch;
            var accumulatedTeam = clonePositions(base.team);
            var accumulatedOpponent = clonePositions(base.opponent);
            var teamFlow = {
                gk: 0.12,
                molina: 0.8,
                romero: 0.32,
                otamendi: 0.28,
                tagliafico: 0.24,
                enzo: 0.5,
                depaul: 0.72,
                macallister: 0.67,
                messi: 0.76,
                dimaria: 0.68,
                forward: 0.88
            };

            motionCache[stateKey] = sequence.steps.map(function (step, stepIndex) {
                Object.keys(step.team).forEach(function (key) {
                    accumulatedTeam[key] = step.team[key].slice();
                });
                Object.keys(step.opponent).forEach(function (key) {
                    accumulatedOpponent[key] = step.opponent[key].slice();
                });

                var phase = stepIndex / Math.max(sequence.steps.length - 1, 1);
                var team = clonePositions(accumulatedTeam);
                var opponent = clonePositions(accumulatedOpponent);

                Object.keys(team).forEach(function (key, playerIndex) {
                    var flow = teamFlow[key] || 0.4;
                    var ballPull = (step.ball[1] - team[key][1]) * phase * 0.018;
                    var collectivePulse = Math.sin((stepIndex + 1) * 1.35 + playerIndex * 0.7) * phase * 0.45;
                    team[key][0] = clamp(team[key][0] + phase * flow * 1.35, 3, 96);
                    team[key][1] = clamp(team[key][1] + ballPull + collectivePulse, 4, 96);
                });

                Object.keys(opponent).forEach(function (key, playerIndex) {
                    var ballPull = (step.ball[1] - opponent[key][1]) * phase * 0.014;
                    var blockShift = Math.cos((stepIndex + 1) * 1.1 + playerIndex * 0.55) * phase * 0.35;
                    opponent[key][0] = clamp(opponent[key][0] + phase * 0.55, 4, 97);
                    opponent[key][1] = clamp(opponent[key][1] + ballPull + blockShift, 4, 96);
                });

                return {
                    team: team,
                    opponent: opponent,
                    ball: step.ball.slice(),
                    targetOpacity: step.targetOpacity
                };
            });

            return motionCache[stateKey];
        }

        function catmullRom(p0, p1, p2, p3, amount) {
            var amountSquared = amount * amount;
            var amountCubed = amountSquared * amount;
            return 0.5 * (
                (2 * p1) +
                (-p0 + p2) * amount +
                (2 * p0 - 5 * p1 + 4 * p2 - p3) * amountSquared +
                (-p0 + 3 * p1 - 3 * p2 + p3) * amountCubed
            );
        }

        function interpolatePoint(frames, getter, progress) {
            var segmentFloat = clamp(progress, 0, 1) * (frames.length - 1);
            var segment = Math.min(Math.floor(segmentFloat), frames.length - 2);
            var amount = segmentFloat - segment;
            var point0 = getter(frames[Math.max(0, segment - 1)]);
            var point1 = getter(frames[segment]);
            var point2 = getter(frames[Math.min(frames.length - 1, segment + 1)]);
            var point3 = getter(frames[Math.min(frames.length - 1, segment + 2)]);

            return [
                clamp(catmullRom(point0[0], point1[0], point2[0], point3[0], amount), 2, 98),
                clamp(catmullRom(point0[1], point1[1], point2[1], point3[1], amount), 2, 98)
            ];
        }

        function interpolateValue(frames, getter, progress) {
            var segmentFloat = clamp(progress, 0, 1) * (frames.length - 1);
            var segment = Math.min(Math.floor(segmentFloat), frames.length - 2);
            var amount = segmentFloat - segment;
            var value0 = getter(frames[Math.max(0, segment - 1)]);
            var value1 = getter(frames[segment]);
            var value2 = getter(frames[Math.min(frames.length - 1, segment + 1)]);
            var value3 = getter(frames[Math.min(frames.length - 1, segment + 2)]);
            return catmullRom(value0, value1, value2, value3, amount);
        }

        function getInterpolatedMotion(progress) {
            var frames = getMotionFrames(stateControl.value);
            var team = {};
            var opponent = {};

            Object.keys(frames[0].team).forEach(function (key) {
                team[key] = interpolatePoint(frames, function (frame) {
                    return frame.team[key];
                }, progress);
            });
            Object.keys(frames[0].opponent).forEach(function (key) {
                opponent[key] = interpolatePoint(frames, function (frame) {
                    return frame.opponent[key];
                }, progress);
            });

            return {
                team: team,
                opponent: opponent,
                ball: interpolatePoint(frames, function (frame) {
                    return frame.ball;
                }, progress)
            };
        }

        var canvasSize = { width: 0, height: 0 };

        function resizeTacticCanvas() {
            if (!tacticContext) return;
            var bounds = pitch.getBoundingClientRect();
            var density = Math.min(window.devicePixelRatio || 1, 2);
            canvasSize.width = Math.max(1, bounds.width);
            canvasSize.height = Math.max(1, bounds.height);
            tacticCanvas.width = Math.round(canvasSize.width * density);
            tacticCanvas.height = Math.round(canvasSize.height * density);
            tacticContext.setTransform(density, 0, 0, density, 0, 0);
        }

        function toCanvasPoint(point) {
            return [
                point[0] * canvasSize.width / 100,
                point[1] * canvasSize.height / 100
            ];
        }

        function canvasColor(name, fallback) {
            var value = window.getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            return value || fallback;
        }

        function drawPath(points, color, width, dash, alpha, closePath) {
            if (!points.length) return;
            tacticContext.save();
            tacticContext.beginPath();
            points.forEach(function (point, index) {
                var canvasPoint = toCanvasPoint(point);
                if (index === 0) {
                    tacticContext.moveTo(canvasPoint[0], canvasPoint[1]);
                } else {
                    tacticContext.lineTo(canvasPoint[0], canvasPoint[1]);
                }
            });
            if (closePath) tacticContext.closePath();
            tacticContext.strokeStyle = color;
            tacticContext.lineWidth = width;
            tacticContext.globalAlpha = alpha;
            tacticContext.lineJoin = "round";
            tacticContext.lineCap = "round";
            tacticContext.setLineDash(dash || []);
            tacticContext.stroke();
            tacticContext.restore();
        }

        function drawArrow(from, to, color, alpha, dash) {
            var start = toCanvasPoint(from);
            var end = toCanvasPoint(to);
            var angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
            var head = 8;

            tacticContext.save();
            tacticContext.beginPath();
            tacticContext.moveTo(start[0], start[1]);
            tacticContext.lineTo(end[0], end[1]);
            tacticContext.strokeStyle = color;
            tacticContext.lineWidth = 2;
            tacticContext.globalAlpha = alpha;
            tacticContext.setLineDash(dash || []);
            tacticContext.stroke();
            tacticContext.setLineDash([]);
            tacticContext.beginPath();
            tacticContext.moveTo(end[0], end[1]);
            tacticContext.lineTo(end[0] - head * Math.cos(angle - Math.PI / 6), end[1] - head * Math.sin(angle - Math.PI / 6));
            tacticContext.lineTo(end[0] - head * Math.cos(angle + Math.PI / 6), end[1] - head * Math.sin(angle + Math.PI / 6));
            tacticContext.closePath();
            tacticContext.fillStyle = color;
            tacticContext.fill();
            tacticContext.restore();
        }

        function drawCanvasLabel(text, point, color) {
            var canvasPoint = toCanvasPoint(point);
            tacticContext.save();
            tacticContext.font = "600 11px system-ui, sans-serif";
            var width = tacticContext.measureText(text).width + 14;
            tacticContext.fillStyle = canvasColor("--ps-surface", "#ffffff");
            tacticContext.globalAlpha = 0.9;
            tacticContext.fillRect(canvasPoint[0] - width / 2, canvasPoint[1] - 11, width, 22);
            tacticContext.globalAlpha = 1;
            tacticContext.fillStyle = color;
            tacticContext.textAlign = "center";
            tacticContext.textBaseline = "middle";
            tacticContext.fillText(text, canvasPoint[0], canvasPoint[1]);
            tacticContext.restore();
        }

        function drawAttackOverlay(progress) {
            var frames = getMotionFrames(stateControl.value);
            var accent = canvasColor("--ps-accent", "#7c5cff");
            var textColor = canvasColor("--ps-text", "#151515");
            var ballPath = [];
            var samples = Math.max(2, Math.ceil(progress * 42));
            var sampleIndex;

            for (sampleIndex = 0; sampleIndex <= samples; sampleIndex += 1) {
                ballPath.push(interpolatePoint(frames, function (frame) {
                    return frame.ball;
                }, progress * sampleIndex / samples));
            }
            drawPath(ballPath, accent, 3, [], 0.86, false);

            ["molina", "depaul", "messi", "forward"].forEach(function (key, playerIndex) {
                var trail = [];
                for (sampleIndex = 0; sampleIndex <= samples; sampleIndex += 1) {
                    trail.push(interpolatePoint(frames, function (frame) {
                        return frame.team[key];
                    }, progress * sampleIndex / samples));
                }
                drawPath(trail, textColor, 1.35, [5, 5], 0.22 + playerIndex * 0.025, false);
            });
        }

        function drawFormationOverlay(motion) {
            var accent = canvasColor("--ps-accent", "#7c5cff");
            var textColor = canvasColor("--ps-text", "#151515");
            var units = [
                ["tagliafico", "otamendi", "romero"],
                ["enzo", "depaul"],
                ["dimaria", "macallister", "forward", "messi", "molina"]
            ];
            units.forEach(function (unit, index) {
                drawPath(unit.map(function (key) {
                    return motion.team[key];
                }), index === 2 ? accent : textColor, index === 2 ? 2.2 : 1.7, [], index === 2 ? 0.65 : 0.34, false);
            });
        }

        function drawDimensionsOverlay(motion) {
            var accent = canvasColor("--ps-accent", "#7c5cff");
            var points = Object.keys(motion.team).map(function (key) {
                return motion.team[key];
            });
            var xValues = points.map(function (point) { return point[0]; });
            var yValues = points.map(function (point) { return point[1]; });
            var minimumX = Math.min.apply(null, xValues);
            var maximumX = Math.max.apply(null, xValues);
            var minimumY = Math.min.apply(null, yValues);
            var maximumY = Math.max.apply(null, yValues);
            var widthMetres = Math.round((maximumY - minimumY) * 0.68);
            var depthMetres = Math.round((maximumX - minimumX) * 1.05);

            drawPath([
                [minimumX, minimumY],
                [maximumX, minimumY],
                [maximumX, maximumY],
                [minimumX, maximumY]
            ], accent, 1.6, [6, 5], 0.58, true);
            drawArrow([maximumX + 2, minimumY], [maximumX + 2, maximumY], accent, 0.85, []);
            drawArrow([minimumX, maximumY + 3], [maximumX, maximumY + 3], accent, 0.85, []);
            drawCanvasLabel(widthMetres + " m width", [maximumX - 3, (minimumY + maximumY) / 2], accent);
            drawCanvasLabel(depthMetres + " m depth", [(minimumX + maximumX) / 2, maximumY + 3], accent);
        }

        function drawPressOverlay(motion) {
            var accent = canvasColor("--ps-accent", "#7c5cff");
            var danger = canvasColor("--ps-danger", "#d85d5d");
            [["forward", "rcb"], ["messi", "cm"], ["dimaria", "rb"], ["molina", "rm"]].forEach(function (pair) {
                drawArrow(motion.team[pair[0]], motion.opponent[pair[1]], accent, 0.76, [5, 4]);
            });

            var trigger = toCanvasPoint(motion.opponent.rb);
            tacticContext.save();
            tacticContext.beginPath();
            tacticContext.arc(trigger[0], trigger[1], Math.min(canvasSize.width, canvasSize.height) * 0.08, 0, Math.PI * 2);
            tacticContext.strokeStyle = danger;
            tacticContext.lineWidth = 2;
            tacticContext.globalAlpha = 0.58;
            tacticContext.setLineDash([6, 5]);
            tacticContext.stroke();
            tacticContext.restore();
            drawCanvasLabel("PRESS TRIGGER", [motion.opponent.rb[0], motion.opponent.rb[1] - 11], danger);
        }

        function drawTransitionOverlay(motion) {
            var accent = canvasColor("--ps-accent", "#7c5cff");
            var positive = canvasColor("--ps-positive", "#318d6a");
            var restDefence = ["tagliafico", "otamendi", "romero", "enzo", "depaul"];
            drawPath(restDefence.map(function (key) {
                return motion.team[key];
            }), positive, 2.1, [], 0.68, true);

            var ball = toCanvasPoint(motion.ball);
            tacticContext.save();
            tacticContext.beginPath();
            tacticContext.arc(ball[0], ball[1], Math.min(canvasSize.width, canvasSize.height) * 0.15, 0, Math.PI * 2);
            tacticContext.fillStyle = accent;
            tacticContext.globalAlpha = 0.08;
            tacticContext.fill();
            tacticContext.strokeStyle = accent;
            tacticContext.lineWidth = 2;
            tacticContext.globalAlpha = 0.55;
            tacticContext.setLineDash([7, 5]);
            tacticContext.stroke();
            tacticContext.restore();
            ["messi", "forward", "molina", "depaul"].forEach(function (key) {
                drawArrow(motion.team[key], motion.ball, accent, 0.7, [4, 4]);
            });
            drawCanvasLabel("5-SECOND COUNTERPRESS", [motion.ball[0], clamp(motion.ball[1] - 17, 7, 92)], accent);
        }

        function drawTacticalOverlay(progress, motion) {
            if (!tacticContext || !canvasSize.width) return;
            tacticContext.clearRect(0, 0, canvasSize.width, canvasSize.height);

            if (activeTacticView === "attack") drawAttackOverlay(progress);
            if (activeTacticView === "formation") drawFormationOverlay(motion);
            if (activeTacticView === "dimensions") drawDimensionsOverlay(motion);
            if (activeTacticView === "press") drawPressOverlay(motion);
            if (activeTacticView === "transition") drawTransitionOverlay(motion);
        }

        function setPlanStrip(labels, values) {
            labels.forEach(function (label, index) {
                var labelNode = room.querySelector('[data-plan-label="' + index + '"]');
                if (labelNode) labelNode.textContent = label;
            });
            setText("[data-plan-shape]", values[0]);
            setText("[data-plan-create]", values[1]);
            setText("[data-plan-finish]", values[2]);
            setText("[data-plan-loss]", values[3]);
        }

        function formatAnimationTime(milliseconds) {
            var seconds = Math.min(12, Math.floor(milliseconds / 1000));
            return "00:" + String(seconds).padStart(2, "0");
        }

        function updateAttackCaption(progress) {
            var sequence = attackAnimations[stateControl.value];
            var phaseFloat = clamp(progress, 0, 1) * sequence.steps.length;
            var phaseIndex = Math.min(sequence.steps.length - 1, Math.floor(phaseFloat));
            var frame = sequence.steps[phaseIndex];
            currentPhaseIndex = phaseIndex;

            room.querySelectorAll("[data-team-node]").forEach(function (node) {
                node.classList.toggle("is-involved", frame.involved.indexOf(node.dataset.teamNode) !== -1);
            });
            animationCount.textContent = "PHASE " + String(phaseIndex + 1).padStart(2, "0") + " / 04";
            animationTitle.textContent = frame.title;
            animationCopy.textContent = frame.copy;
            shapeLabel.textContent = frame.shape;
            pitch.setAttribute("aria-label", states[stateControl.value].pitch.aria + ". Current phase: " + frame.title + ".");
        }

        function renderMotion(progress, updateCaption) {
            var motion = getInterpolatedMotion(progress);
            var frames = getMotionFrames(stateControl.value);
            var targetOpacity = interpolateValue(frames, function (frame) {
                return frame.targetOpacity;
            }, progress);

            setNodePositions("team", motion.team);
            setNodePositions("opponent", motion.opponent);
            coachBall.style.setProperty("--x", motion.ball[0] + "%");
            coachBall.style.setProperty("--y", motion.ball[1] + "%");
            targetArea.style.opacity = String(clamp(targetOpacity, 0, 1));
            animationScrubber.value = String(progress * 100);
            animationTime.textContent = formatAnimationTime(progress * animationDuration);
            if (updateCaption) updateAttackCaption(progress);
            drawTacticalOverlay(progress, motion);
        }

        function stopAnimation(endLabel) {
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
                animationFrameId = 0;
            }
            animationPlay.setAttribute("aria-pressed", "false");
            animationPlay.querySelector("span").textContent = endLabel || "Play attack";
        }

        function animationTick(timestamp) {
            var speed = Number(animationSpeed.value) || 1;
            animationElapsed = Math.min(animationDuration, (timestamp - animationStartTime) * speed);
            renderMotion(animationElapsed / animationDuration, true);

            if (animationElapsed >= animationDuration) {
                animationFrameId = 0;
                animationPlay.setAttribute("aria-pressed", "false");
                animationPlay.querySelector("span").textContent = "Replay attack";
                return;
            }
            animationFrameId = window.requestAnimationFrame(animationTick);
        }

        function startAnimation() {
            if (animationFrameId) {
                stopAnimation("Continue attack");
                return;
            }
            if (animationElapsed >= animationDuration) {
                animationElapsed = 0;
                renderMotion(0, true);
            }

            pitch.classList.add("is-realtime");
            animationPlay.setAttribute("aria-pressed", "true");
            animationPlay.querySelector("span").textContent = "Pause";
            animationStartTime = performance.now() - animationElapsed / (Number(animationSpeed.value) || 1);
            animationFrameId = window.requestAnimationFrame(animationTick);
        }

        function updateTacticView(view) {
            var sequence = attackAnimations[stateControl.value];
            activeTacticView = view;
            pitch.dataset.view = view;
            stopAnimation(view === "attack" && animationElapsed > 0 ? "Continue attack" : "Play attack");

            room.querySelectorAll("[data-tactic-tab]").forEach(function (button) {
                var selected = button.dataset.tacticTab === view;
                button.setAttribute("aria-selected", String(selected));
                button.tabIndex = selected ? 0 : -1;
            });

            animationControls.hidden = view !== "attack";
            animationTimeline.hidden = view !== "attack";
            room.querySelectorAll("[data-team-node]").forEach(function (node) {
                node.classList.remove("is-involved");
            });

            if (view === "attack") {
                setPlanStrip(["Base shape", "Create", "Finish", "On loss"], sequence.overview);
                renderMotion(animationElapsed / animationDuration, true);
                return;
            }

            var profile = tacticViewProfiles[stateControl.value][view];
            setPlanStrip(profile.labels, profile.values);
            renderMotion(profile.progress, false);
            shapeLabel.textContent = profile.shape;
            animationCount.textContent = view === "dimensions" ? "WIDTH & DEPTH" : view.toUpperCase() + " VIEW";
            animationTitle.textContent = profile.title;
            animationCopy.textContent = profile.copy;
            targetArea.style.opacity = view === "transition" ? "0.18" : "0.05";
            pitch.setAttribute("aria-label", states[stateControl.value].pitch.aria + ". Tactical view: " + profile.title + ".");
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
            stopAnimation("Play attack");
            animationElapsed = 0;
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
            selectOption(stateControl.value === "trailing" ? "transition" : "controlled");
            updatePlayer();
            updateTacticView(activeTacticView);
        }

        room.querySelectorAll("[data-option]").forEach(function (button) {
            button.addEventListener("click", function () {
                selectOption(button.dataset.option);
            });
        });

        room.querySelectorAll("button.coach-player.is-team").forEach(function (button) {
            button.addEventListener("click", function () {
                var label = button.querySelector("small");
                if (!label) return;
                var name = label.textContent.trim();
                stopAnimation(animationElapsed > 0 ? "Continue attack" : "Play attack");
                room.querySelectorAll("[data-team-node]").forEach(function (node) {
                    node.classList.toggle("is-involved", node === button);
                });
                animationCount.textContent = "PLAYER ROLE";
                animationTitle.textContent = name;
                animationCopy.textContent = playerJobs[name] || "Role detail will be available when the production player model is connected.";
            });
        });

        stateControl.addEventListener("change", updateState);
        playerControl.addEventListener("change", function () {
            updatePlayer();
            var forwardLabel = playerControl.value === "lautaro" ? "Lautaro" : "Álvarez";
            stopAnimation(animationElapsed > 0 ? "Continue attack" : "Play attack");
            animationCount.textContent = "LINEUP CHANGE";
            animationTitle.textContent = forwardLabel;
            animationCopy.textContent = playerJobs[forwardLabel];
        });

        animationPlay.addEventListener("click", startAnimation);

        animationScrubber.addEventListener("input", function () {
            stopAnimation("Continue attack");
            animationElapsed = Number(animationScrubber.value) / 100 * animationDuration;
            renderMotion(animationElapsed / animationDuration, true);
        });

        animationSpeed.addEventListener("change", function () {
            if (!animationFrameId) return;
            window.cancelAnimationFrame(animationFrameId);
            animationStartTime = performance.now() - animationElapsed / (Number(animationSpeed.value) || 1);
            animationFrameId = window.requestAnimationFrame(animationTick);
        });

        room.querySelectorAll("[data-tactic-tab]").forEach(function (button, index, buttons) {
            button.addEventListener("click", function () {
                updateTacticView(button.dataset.tacticTab);
            });
            button.addEventListener("keydown", function (event) {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                event.preventDefault();
                var direction = event.key === "ArrowRight" ? 1 : -1;
                var nextIndex = (index + direction + buttons.length) % buttons.length;
                buttons[nextIndex].focus();
                updateTacticView(buttons[nextIndex].dataset.tacticTab);
            });
        });

        resizeTacticCanvas();
        updateState();

        if ("ResizeObserver" in window) {
            new ResizeObserver(function () {
                resizeTacticCanvas();
                if (activeTacticView === "attack") {
                    renderMotion(animationElapsed / animationDuration, true);
                } else {
                    updateTacticView(activeTacticView);
                }
            }).observe(pitch);
        } else {
            window.addEventListener("resize", function () {
                resizeTacticCanvas();
                updateTacticView(activeTacticView);
            });
        }

        window.addEventListener("onColorSchemeChange", function () {
            if (activeTacticView === "attack") {
                renderMotion(animationElapsed / animationDuration, false);
            } else {
                updateTacticView(activeTacticView);
            }
        });

        window.addEventListener("pagehide", function () {
            if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
        });
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
