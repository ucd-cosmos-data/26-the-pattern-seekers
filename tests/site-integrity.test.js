"use strict";

var assert = require("node:assert/strict");
var fs = require("node:fs");
var path = require("node:path");
var test = require("node:test");

var projectRoot = path.resolve(__dirname, "..");

function filesBelow(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(function (entry) {
        var fullPath = path.join(directory, entry.name);
        return entry.isDirectory() ? filesBelow(fullPath) : [fullPath];
    });
}

test("literal Hugo resource references resolve to committed assets", function () {
    var templateFiles = filesBelow(path.join(projectRoot, "layouts"))
        .filter(function (file) { return file.endsWith(".html"); });
    var missing = [];

    templateFiles.forEach(function (file) {
        var source = fs.readFileSync(file, "utf8");
        Array.from(source.matchAll(/resources\.Get\s+"([^"]+)"/g)).forEach(function (match) {
            var assetPath = path.join(projectRoot, "assets", match[1]);
            if (!fs.existsSync(assetPath)) {
                missing.push(path.relative(projectRoot, file) + " -> assets/" + match[1]);
            }
        });
    });

    assert.deepEqual(missing, []);
});

test("flagship player-report links resolve to committed report pages", function () {
    var reports = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "assets/player-reports.json"), "utf8")
    );
    var ids = Object.keys(reports);

    assert.ok(ids.length >= 20, "expected the complete Argentina–France flagship roster");
    ids.forEach(function (id) {
        var report = reports[id];
        assert.ok(report.slug, id + " is missing a report slug");
        assert.ok(
            fs.existsSync(path.join(projectRoot, "content/player-reports", report.slug + ".md")),
            id + " links to a missing report page: " + report.slug
        );
    });
});

test("phone layout guards cover report tables and the coach interaction", function () {
    var css = fs.readFileSync(path.join(projectRoot, "assets/css/tailwind.css"), "utf8");
    var reportTemplate = fs.readFileSync(
        path.join(projectRoot, "layouts/player-reports/player-report.html"),
        "utf8"
    );

    assert.match(reportTemplate, /player-report-table-scroll/);
    assert.match(css, /\.player-report-hero__grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s);
    assert.match(css, /\.player-report-table-scroll\s*\{[^}]*overflow-x:\s*auto/s);
    assert.match(css, /\.matchup__picker\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\);/s);
    assert.match(css, /\.coach-modes button\s*\{[^}]*min-height:\s*4\.4rem/s);
    assert.match(css, /\.coach-tactical-tooltip\s*\{[^}]*width:\s*calc\(100%\s*-\s*2\.4rem\)/s);
});

test("remaining phone surfaces retain their compact navigation and data layouts", function () {
    var css = fs.readFileSync(path.join(projectRoot, "assets/css/tailwind.css"), "utf8");
    var projectTemplate = fs.readFileSync(
        path.join(projectRoot, "layouts/projects/single.html"),
        "utf8"
    );
    var coachScript = fs.readFileSync(
        path.join(projectRoot, "assets/js/worlds-coach.js"),
        "utf8"
    );
    var siteScript = fs.readFileSync(path.join(projectRoot, "assets/js/site.js"), "utf8");

    assert.match(css, /\.site-nav__menu-button\s*\{[^}]*width:\s*4\.4rem[^}]*height:\s*4\.4rem/s);
    assert.match(css, /\.pres-index\s*\{[^}]*top:\s*5\.6rem/s);
    assert.match(css, /\.pres-manifest__row\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/s);
    assert.match(css, /\.pres-spec__row\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/s);
    assert.match(css, /\.photo-grid\s*\{[^}]*columns:\s*1;/s);
    assert.match(projectTemplate, /class=\\"project-table-scroll\\" role=\\"region\\"[^>]*tabindex=\\"0\\"/);
    assert.match(coachScript, /scrollIntoView\(\{[\s\S]*?inline:\s*"center"/);
    assert.match(siteScript, /event\.key === "Tab"[\s\S]*?closeButton\.focus\(\)/);
});

test("release assets retain accessibility, compatibility, and mobile payload guards", function () {
    var css = fs.readFileSync(path.join(projectRoot, "assets/css/tailwind.css"), "utf8");
    var reportTemplate = fs.readFileSync(
        path.join(projectRoot, "layouts/player-reports/player-report.html"),
        "utf8"
    );
    var photoTemplate = fs.readFileSync(
        path.join(projectRoot, "layouts/photos/list.html"),
        "utf8"
    );
    var cdcContent = fs.readFileSync(
        path.join(projectRoot, "content/projects/cdc-data-analysis/index.md"),
        "utf8"
    );
    var config = fs.readFileSync(path.join(projectRoot, "hugo.yaml"), "utf8");
    var iframeTags = Array.from(cdcContent.matchAll(/<iframe\b[^>]*>/g)).map(function (match) {
        return match[0];
    });
    var optimizedPhoto = path.join(
        projectRoot,
        "static/photos/optimized/wonjun-teaching-plots.jpg"
    );
    var optimizedFavicon = path.join(projectRoot, "assets/bonsai-favicon.jpeg");
    var embeddedMaps = [
        "static/results/figures/ca-obesity-prevalence-map.html",
        "static/results/figures/ca-living-wage-map.html"
    ].map(function (file) {
        return fs.readFileSync(path.join(projectRoot, file), "utf8");
    });

    assert.ok(iframeTags.length > 0);
    iframeTags.forEach(function (tag) {
        assert.match(tag, /\btitle="[^"]+"/);
        assert.match(tag, /\bloading="lazy"/);
    });
    assert.doesNotMatch(css, /:has\(/);
    assert.match(reportTemplate, /define "body-class"[\s\S]*?player-report-body/);
    assert.match(photoTemplate, /photos\/optimized/);
    assert.match(photoTemplate, /decoding="async"/);
    assert.match(config, /favicon:\s+bonsai-favicon\.jpeg/);
    assert.ok(fs.statSync(optimizedPhoto).size < 750000, "optimized photo is too large");
    assert.ok(fs.statSync(optimizedFavicon).size < 20000, "favicon is too large");
    embeddedMaps.forEach(function (mapHtml) {
        assert.match(mapHtml, /name="viewport"/);
        assert.match(mapHtml, /<body style="margin:0;">/);
    });
});
