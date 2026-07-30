// Build assets/player-reports.json (the Argentina/France flagship report data,
// keyed by the tool's roster ids: gk, molina, ... fra_lw) from the committed
// content/player-reports/*.md pages. This keeps the flagship tooltip report
// links working without depending on the analysis repo at build time.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(projectRoot, "content/player-reports");
const outputPath = path.join(projectRoot, "assets/player-reports.json");

function parseFrontMatter(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) return null;
    const fm = {};
    m[1].split(/\r?\n/).forEach((line) => {
        const idx = line.indexOf(":");
        if (idx === -1 || /^\s/.test(line)) return; // skip list items / continuations
        const key = line.slice(0, idx).trim();
        let val = line.slice(idx + 1).trim();
        if (!val) return;
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            try { val = JSON.parse(val); } catch (e) { val = val.slice(1, -1); }
        }
        fm[key] = val;
    });
    return fm;
}

const reports = {};
fs.readdirSync(contentRoot)
    .filter((f) => f.endsWith(".md"))
    .forEach((file) => {
        const fm = parseFrontMatter(fs.readFileSync(path.join(contentRoot, file), "utf8"));
        if (!fm || !fm.playerId) return;
        // Flagship roster ids only (generated players use "sb-<id>").
        if (/^sb-/.test(fm.playerId)) return;
        const slugMatch = (fm.url || "").match(/reports\/([^/]+)\/?$/);
        reports[fm.playerId] = {
            title: fm.title || "",
            slug: slugMatch ? slugMatch[1] : path.basename(file, ".md"),
            displayName: fm.displayName || "",
            headshotUrl: fm.headshotUrl || "",
            shirtNumber: fm.shirtNumber === "" ? "" : Number(fm.shirtNumber),
            sourceUrl: fm.sourceUrl || ""
        };
    });

fs.writeFileSync(outputPath, `${JSON.stringify(reports, null, 2)}\n`, "utf8");
console.log(`player-reports.json: ${Object.keys(reports).length} flagship players -> ${outputPath}`);
