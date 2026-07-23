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

    initializeNavigation();
    initializeReveals();
    initializeScrollspy();
    initializePhotoLightbox();
    initializeEmbeddedFigures();
    initializeSignalTrace();
    initializeInterferenceCanvas();
})();
