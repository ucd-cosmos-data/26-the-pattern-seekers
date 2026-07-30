// Build a player index + report pages for every knockout-stage player, so the
// generated matchup boards can show the name each player goes by, a description
// imported from their profile, and a working "open player report" link.
//
// Inputs (from the analysis repo): v5_player_rankings.json + player_profiles/*.md
// Outputs: assets/player-index.json (keyed by StatsBomb player_id) and
//          content/player-reports/<slug>.md pages (non-curated players only).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const analysisRoot =
    process.env.PATTERN_SEEKERS_ANALYSIS_REPORTS_DIR ||
    path.resolve(projectRoot, "../26-the-pattern-seekers-analysis/World-Cup-S-Bomb/results/reports");
const profilesDir = path.join(analysisRoot, "player_profiles");
const rankingsPath = path.join(analysisRoot, "v5_player_rankings.json");
const contentRoot = path.join(projectRoot, "content/player-reports");
const indexOut = path.join(projectRoot, "assets/player-index.json");

const analysisCommit = "718ae91e82bedbd53486a1e0381aaa70e124ba12";
const sourceBase =
    "https://github.com/ucd-cosmos-data/26-the-pattern-seekers-analysis/blob/" +
    analysisCommit + "/World-Cup-S-Bomb/results/reports/player_profiles/";

const KNOCKOUT_TEAMS = new Set([
    "Netherlands", "United States", "Argentina", "Australia", "France", "Poland",
    "England", "Senegal", "Japan", "Croatia", "Brazil", "South Korea", "Morocco",
    "Spain", "Portugal", "Switzerland"
]);

// Players whose 22 curated report pages already exist — reuse their slugs and
// do not regenerate the page (keeps the hand-tuned Argentina/France reports).
const CURATED_SLUG = {
    6909: "emiliano-martinez", 29201: "nahuel-molina", 20572: "cristian-romero",
    3090: "nicolas-otamendi", 5507: "nicolas-tagliafico", 38718: "enzo-fernandez",
    7797: "rodrigo-de-paul", 27886: "alexis-mac-allister", 5503: "lionel-messi",
    2995: "angel-di-maria", 29560: "julian-alvarez", 3099: "hugo-lloris",
    4445: "jules-kounde", 5485: "raphael-varane", 8519: "dayot-upamecano",
    6704: "theo-hernandez", 5487: "antoine-griezmann", 10481: "aurelien-tchouameni",
    3026: "adrien-rabiot", 5477: "ousmane-dembele", 3604: "olivier-giroud",
    3009: "kylian-mbappe"
};

// The name each player actually goes by: [goesBy, surname]. Anyone not listed
// falls back to the heuristic below.
const OVERRIDES = {
    6909: ["Emiliano Martínez", "Martínez"], 29201: ["Nahuel Molina", "Molina"],
    20572: ["Cristian Romero", "Romero"], 3090: ["Nicolás Otamendi", "Otamendi"],
    5507: ["Nicolás Tagliafico", "Tagliafico"], 38718: ["Enzo Fernández", "Fernández"],
    7797: ["Rodrigo De Paul", "De Paul"], 27886: ["Alexis Mac Allister", "Mac Allister"],
    5503: ["Lionel Messi", "Messi"], 2995: ["Ángel Di María", "Di María"],
    29560: ["Julián Álvarez", "Álvarez"], 19597: ["Marcos Acuña", "Acuña"],
    27768: ["Lisandro Martínez", "L. Martínez"], 3099: ["Hugo Lloris", "Lloris"],
    4445: ["Jules Koundé", "Koundé"], 5485: ["Raphaël Varane", "Varane"],
    8519: ["Dayot Upamecano", "Upamecano"], 6704: ["Théo Hernández", "Hernández"],
    5487: ["Antoine Griezmann", "Griezmann"], 10481: ["Aurélien Tchouaméni", "Tchouaméni"],
    3026: ["Adrien Rabiot", "Rabiot"], 5477: ["Ousmane Dembélé", "Dembélé"],
    3604: ["Olivier Giroud", "Giroud"], 3009: ["Kylian Mbappé", "Mbappé"],
    11135: ["Ibrahima Konaté", "Konaté"],
    // Brazil
    18395: ["Vinícius Jr", "Vinícius Jr"], 3280: ["Richarlison", "Richarlison"],
    10595: ["Raphinha", "Raphinha"], 22600: ["Lucas Paquetá", "Paquetá"],
    4372: ["Marquinhos", "Marquinhos"], 13620: ["Éder Militão", "Militão"],
    5539: ["Casemiro", "Casemiro"], 3295: ["Thiago Silva", "T. Silva"],
    5547: ["Alisson", "Alisson"],
    // Croatia
    12625: ["Borna Sosa", "Sosa"], 5474: ["Ivan Perišić", "Perišić"],
    5460: ["Andrej Kramarić", "Kramarić"], 16531: ["Dominik Livaković", "Livaković"],
    33018: ["Joško Gvardiol", "Gvardiol"], 29163: ["Josip Juranović", "Juranović"],
    5456: ["Mateo Kovačić", "Kovačić"], 3471: ["Dejan Lovren", "Lovren"],
    5463: ["Luka Modrić", "Modrić"], 5469: ["Marcelo Brozović", "Brozović"],
    // England
    30714: ["Jude Bellingham", "Bellingham"], 3382: ["Luke Shaw", "Shaw"],
    3336: ["Harry Maguire", "Maguire"], 10955: ["Harry Kane", "Kane"],
    3244: ["John Stones", "Stones"], 3943: ["Declan Rice", "Rice"],
    3468: ["Jordan Pickford", "Pickford"],
    // Morocco
    31295: ["Yahia Attiat-Allah", "Attiat-Allah"], 3625: ["Sofiane Boufal", "Boufal"],
    15890: ["Noussair Mazraoui", "Mazraoui"], 6785: ["Bono", "Bono"],
    5245: ["Achraf Hakimi", "Hakimi"], 46258: ["Azzedine Ounahi", "Ounahi"],
    7459: ["Jawad El Yamiq", "El Yamiq"], 6301: ["Youssef En-Nesyri", "En-Nesyri"],
    5219: ["Romain Saïss", "Saïss"], 5237: ["Hakim Ziyech", "Ziyech"],
    12149: ["Nayef Aguerd", "Aguerd"], 5234: ["Sofyan Amrabat", "Amrabat"],
    23774: ["Selim Amallah", "Amallah"],
    // Netherlands
    2988: ["Memphis Depay", "Depay"], 3311: ["Daley Blind", "Blind"],
    8125: ["Denzel Dumfries", "Dumfries"], 20750: ["Cody Gakpo", "Gakpo"],
    8326: ["Andries Noppert", "Noppert"], 8118: ["Frenkie de Jong", "De Jong"],
    21809: ["Jurriën Timber", "Timber"], 3306: ["Nathan Aké", "Aké"],
    3669: ["Virgil van Dijk", "Van Dijk"],
    // Poland
    5669: ["Wojciech Szczęsny", "Szczęsny"], 5668: ["Robert Lewandowski", "Lewandowski"],
    5673: ["Bartosz Bereszyński", "Bereszyński"], 3637: ["Grzegorz Krychowiak", "Krychowiak"],
    5660: ["Piotr Zieliński", "Zieliński"], 3034: ["Kamil Glik", "Glik"],
    44166: ["Jakub Kiwior", "Kiwior"], 4734: ["Matty Cash", "Cash"],
    // Portugal
    5209: ["Raphaël Guerreiro", "Guerreiro"], 5207: ["Cristiano Ronaldo", "Ronaldo"],
    7005: ["João Cancelo", "Cancelo"], 12041: ["João Félix", "Félix"],
    20016: ["Pepe", "Pepe"], 32975: ["Diogo Costa", "D. Costa"],
    5204: ["Bruno Fernandes", "B. Fernandes"], 3193: ["Bernardo Silva", "B. Silva"],
    5206: ["Rúben Dias", "Dias"],
    // Senegal
    2941: ["Ismaïla Sarr", "Sarr"], 3404: ["Youssouf Sabaly", "Sabaly"],
    5675: ["Kalidou Koulibaly", "Koulibaly"], 8553: ["Abdou Diallo", "Diallo"],
    20611: ["Boulaye Dia", "Dia"], 7379: ["Édouard Mendy", "Mendy"],
    // South Korea
    40538: ["Kim Jin-su", "Kim JS"], 5604: ["Kim Young-gwon", "Kim YG"],
    40672: ["Kim Moon-hwan", "Kim MH"], 3083: ["Son Heung-min", "Son"],
    23763: ["Hwang In-beom", "Hwang"], 37641: ["Kim Seung-gyu", "Kim SG"],
    5618: ["Jung Woo-young", "Jung"],
    // Spain
    16532: ["Dani Olmo", "Olmo"], 11748: ["Unai Simón", "Simón"],
    6765: ["Rodri", "Rodri"], 4353: ["Aymeric Laporte", "Laporte"],
    30486: ["Pedri", "Pedri"], 5203: ["Sergio Busquets", "Busquets"],
    // Switzerland
    5549: ["Manuel Akanji", "Akanji"], 5545: ["Breel Embolo", "Embolo"],
    3500: ["Granit Xhaka", "Xhaka"], 5544: ["Ricardo Rodríguez", "Rodríguez"],
    6983: ["Remo Freuler", "Freuler"],
    // United States
    8246: ["Christian Pulisic", "Pulisic"], 12352: ["Matt Turner", "Turner"],
    3377: ["Tim Weah", "Weah"], 21881: ["Sergiño Dest", "Dest"],
    4614: ["Antonee Robinson", "Robinson"], 18242: ["Tim Ream", "Ream"],
    12751: ["Tyler Adams", "Adams"], 38792: ["Yunus Musah", "Musah"],
    12524: ["Walker Zimmerman", "Zimmerman"],
    // Australia / Japan
    5481: ["Mathew Leckie", "Leckie"], 5479: ["Aziz Behich", "Behich"],
    3240: ["Mat Ryan", "Ryan"], 3281: ["Aaron Mooy", "Mooy"],
    5490: ["Jackson Irvine", "Irvine"], 33495: ["Kye Rowles", "Rowles"],
    22293: ["Harry Souttar", "Souttar"], 23527: ["Junya Ito", "Ito"],
    25719: ["Shūichi Gonda", "Gonda"], 9411: ["Daichi Kamada", "Kamada"],
    23721: ["Wataru Endo", "Endo"], 3300: ["Maya Yoshida", "Yoshida"]
};

// Wikipedia titles for headshot lookup where the goes-by name is ambiguous
// (a mononym that collides with a more famous non-footballer, or a redirect).
const WIKI_OVERRIDE = {
    6785: "Yassine Bounou", 20016: "Pepe (footballer, born 1983)",
    4372: "Marquinhos (footballer, born 1994)", 5547: "Alisson",
    10595: "Raphinha (footballer, born 1996)", 6765: "Rodri (footballer, born 1996)",
    18395: "Vinícius Júnior", 30486: "Pedri", 3280: "Richarlison",
    5539: "Casemiro", 22600: "Lucas Paquetá", 12041: "João Félix"
};

const CONNECTORS = { de: 1, da: 1, dos: 1, do: 1, van: 1, von: 1, el: 1, di: 1, den: 1, der: 1, mac: 1, mc: 1 };

function titleCase(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

function heuristicNames(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/);
    let last = parts[parts.length - 1] || fullName;
    if (/^(allah|ullah)$/i.test(last) && parts.length >= 2) {
        return { surname: titleCase(parts[parts.length - 2]) + "-" + titleCase(last) };
    }
    const prev = (parts[parts.length - 2] || "").toLowerCase();
    if (parts.length >= 2 && CONNECTORS[prev]) {
        last = titleCase(parts[parts.length - 2]) + " " + titleCase(last);
    } else {
        last = titleCase(last);
    }
    return { surname: last };
}

function resolveNames(id, fullName) {
    if (OVERRIDES[id]) return { goesBy: OVERRIDES[id][0], surname: OVERRIDES[id][1] };
    const first = String(fullName || "").trim().split(/\s+/)[0] || "";
    const { surname } = heuristicNames(fullName);
    const goesBy = surname.startsWith(first) ? surname : (first + " " + surname);
    return { goesBy, surname };
}

function slugify(text) {
    return String(text)
        .normalize("NFD").replace(/[̀-ͯ]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// ---- report parsing + plain-English summary (shared with sync script) ------
function addParagraph(target, value) {
    if (!value) return;
    const previous = target[target.length - 1];
    if (previous && previous.endsWith(" ")) target[target.length - 1] += value;
    else target.push(value);
}
function parseReport(markdown) {
    const report = { title: "", intro: [], sections: [] };
    let current = null;
    markdown.split(/\r?\n/).forEach((raw) => {
        const line = raw.trim();
        if (!line) return;
        if (line.startsWith("# ")) { report.title = line.slice(2).trim(); return; }
        if (line.startsWith("## ")) { current = { heading: line.slice(3).trim(), items: [], paragraphs: [] }; report.sections.push(current); return; }
        if (line.startsWith("- ") && current) {
            const entry = line.slice(2); const sep = entry.indexOf(":");
            current.items.push({ label: sep === -1 ? entry : entry.slice(0, sep).trim(), value: sep === -1 ? "" : entry.slice(sep + 1).trim() });
            return;
        }
        if (line.startsWith("|") && current) {
            const cells = line.split("|").slice(1, -1).map((c) => c.trim());
            const divider = cells.every((c) => /^:?-+:?$/.test(c));
            const header = cells.length >= 2 && cells[0].toLowerCase() === "metric" && cells[1].toLowerCase() === "value";
            if (!divider && !header && cells.length >= 2) current.items.push({ label: cells[0], value: cells[1] });
            return;
        }
        addParagraph(current ? current.paragraphs : report.intro, line);
    });
    if (!report.title) throw new Error("Report missing title");
    return report;
}
function reportItems(report, heading) {
    const section = report.sections.find((s) => s.heading === heading);
    return Object.fromEntries((section?.items || []).map((i) => [i.label, i.value]));
}
function num(items, key) { const v = Number(items[key]); return Number.isFinite(v) ? v : null; }

const viewerLanguage = {
    progression_score: { strength: "Moves the ball forward well through carries and forward passes.", weakness: "Has less impact moving possession upfield." },
    creation_score: { strength: "Creates useful chances and connects attacks.", weakness: "Creates fewer chances than his stronger areas suggest." },
    finishing_score: { strength: "Offers a strong goal threat when attacks reach the final third.", weakness: "Finishing is a smaller part of his overall impact." },
    pressing_score: { strength: "Works hard without the ball and pressures opponents effectively.", weakness: "Pressing intensity is a weaker area in this tournament model." },
    defensive_score: { strength: "Reads danger and contributes well in defensive situations.", weakness: "Defensive actions are a less prominent part of his game." },
    ball_security_score: { strength: "Keeps possession reliably when receiving or carrying under pressure.", weakness: "Can be less secure on the ball when pressure arrives." },
    aerial_score: { strength: "Competes well for headers and aerial balls.", weakness: "Aerial play is one of the less influential parts of his profile." }
};
function goalkeeperSummary(name, team, ranking) {
    const teamRank = ranking["Team rank"];
    return {
        overview: `${name} was ${team}'s goalkeeper. The model ranked him ${teamRank ? `#${teamRank} within the team` : "within the team goalkeeper pool"}, using shot-stopping, cross control, sweeping, and distribution data.`,
        strengths: ["Provides a steady goalkeeper presence and a safe passing option in buildup.", "Commands his box and organises the defence in front of him."],
        weaknesses: ["The available tournament sample is small, so goalkeeper conclusions remain cautious."]
    };
}
function makeViewerSummary(report) {
    const ranking = reportItems(report, "Ranking and role");
    const vector = reportItems(report, "Continuous role vector");
    const name = report.title.replace(/ Player Profile$/, "");
    const team = ranking.Team || "his national team";
    const position = ranking["Position group"] || "outfield player";
    const positionLabel = position.toLowerCase();
    const article = /^[aeiou]/i.test(positionLabel) ? "an" : "a";
    const role = ranking["Functional role"] || "a flexible role";
    if (positionLabel.includes("goalkeeper")) return goalkeeperSummary(name, team, ranking);
    const scored = Object.keys(viewerLanguage)
        .map((k) => ({ k, v: num(vector, k) })).filter((i) => i.v !== null)
        .sort((a, b) => b.v - a.v);
    const strengths = scored.slice(0, 2).map((i) => viewerLanguage[i.k].strength);
    const weaknesses = scored.slice(-2).reverse().map((i) => viewerLanguage[i.k].weakness);
    const teamRank = ranking["Team rank"];
    return {
        overview: `${name} played as ${article} ${positionLabel} for ${team}. His main role was ${role.toLowerCase()}${teamRank ? `, and the model ranked him #${teamRank} on the team` : ""}. The notes below translate his tournament data into simple soccer terms.`,
        strengths, weaknesses
    };
}

// ---- build ----------------------------------------------------------------
const rankings = JSON.parse(fs.readFileSync(rankingsPath, "utf8"));
const profileFiles = fs.readdirSync(profilesDir).filter((f) => f.endsWith(".md"));
const fileById = {};
profileFiles.forEach((f) => {
    const m = f.match(/-(\d+)\.md$/);
    if (m) fileById[m[1]] = f;
});

const usedSlugs = new Set(Object.values(CURATED_SLUG));
const index = {};
let pagesWritten = 0;
fs.mkdirSync(contentRoot, { recursive: true });

rankings
    .filter((p) => KNOCKOUT_TEAMS.has(p.team))
    .forEach((p) => {
        const id = p.player_id;
        const file = fileById[String(id)];
        if (!file) { console.warn("No profile for", id, p.player_name); return; }
        const markdown = fs.readFileSync(path.join(profilesDir, file), "utf8");
        const parsed = parseReport(markdown);
        const summary = makeViewerSummary(parsed);
        const { goesBy, surname } = resolveNames(id, p.player_name);

        let slug = CURATED_SLUG[id];
        const curated = Boolean(slug);
        if (!slug) {
            slug = slugify(goesBy);
            if (!slug || usedSlugs.has(slug)) slug = slug ? slug + "-" + id : "player-" + id;
            usedSlugs.add(slug);
        }

        index[id] = {
            name: goesBy,
            surname,
            team: p.team,
            role: p.functional_role || parsed && reportItems(parsed, "Ranking and role")["Functional role"] || "",
            teamRank: p.team_rank || null,
            positionRank: p.position_rank || null,
            globalRank: p.global_rank || null,
            rating: typeof p["Final player rating"] === "number" ? p["Final player rating"]
                : (typeof p.final_player_rating === "number" ? p.final_player_rating : null),
            minutes: p.minutes ? Math.round(p.minutes) : null,
            overview: summary.overview,
            strength: summary.strengths[0] || "",
            watch: summary.weaknesses[0] || "",
            wiki: WIKI_OVERRIDE[id] || goesBy,
            slug
        };

        if (!curated) {
            const sourceUrl = sourceBase + file;
            const pageBody = markdown.replace(/^# .+\r?\n+/, "").replace(`${parsed.intro[0]}\n\n`, "");
            // Use the name the player goes by in the reader-facing overview + title.
            const overview = summary.overview.split(p.player_name).join(goesBy);
            const fm = [
                "---",
                `title: ${JSON.stringify(goesBy + " — player profile")}`,
                `description: ${JSON.stringify(parsed.intro[0] || "World Cup player analysis report.")}`,
                'layout: "player-report"',
                `url: "/projects/worlds-coach-output/reports/${slug}/"`,
                `playerId: ${JSON.stringify("sb-" + id)}`,
                `sourceUrl: ${JSON.stringify(sourceUrl)}`,
                `displayName: ${JSON.stringify(goesBy)}`,
                `wikiTitle: ${JSON.stringify(WIKI_OVERRIDE[id] || goesBy)}`,
                `headshotUrl: ""`,
                `shirtNumber: ""`,
                `overview: ${JSON.stringify(overview)}`,
                "strengths:",
                ...summary.strengths.map((s) => `  - ${JSON.stringify(s)}`),
                "weaknesses:",
                ...summary.weaknesses.map((w) => `  - ${JSON.stringify(w)}`),
                "---",
                ""
            ].join("\n");
            fs.writeFileSync(path.join(contentRoot, `${slug}.md`), `${fm}${pageBody}`, "utf8");
            pagesWritten += 1;
        }
    });

fs.writeFileSync(indexOut, `${JSON.stringify(index, null, 0)}\n`, "utf8");
console.log(`player-index: ${Object.keys(index).length} players, ${pagesWritten} new report pages -> ${contentRoot}`);
