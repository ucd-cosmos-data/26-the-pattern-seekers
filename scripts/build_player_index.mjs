// Build a player index + report pages for every knockout-stage player, so the
// generated matchup boards can show the name each player goes by, a description
// imported from their profile, and a working "open player report" link.
//
// Inputs (from the analysis repo): ranking/player_rankings.json + player_profiles/*.md
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
const rankingsPath = path.join(analysisRoot, "ranking", "player_rankings.json");
const contentRoot = path.join(projectRoot, "content/player-reports");
const indexOut = path.join(projectRoot, "assets/player-index.json");

const analysisCommit = "0aa13e7289c0ce81452c8fc3a67efe3e849c1aef";
const sourceBase =
    "https://github.com/ucd-cosmos-data/26-the-pattern-seekers-analysis/blob/" +
    analysisCommit + "/World-Cup-S-Bomb/results/reports/player_profiles/";

function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter(function (line) { return line.length; });
    const header = lines[0].split(",");
    return lines.slice(1).map(function (line) {
        const cells = line.split(",");
        const row = {};
        header.forEach(function (key, index) { row[key] = cells[index]; });
        return row;
    });
}

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
    const goalkeeperRank = ranking.goalkeeper_consolidated_value_rank_v5;
    return {
        overview: `${name} was ${team}'s goalkeeper. The active goalkeeper model ranked him ${goalkeeperRank ? `#${goalkeeperRank} in its separate 32-player table` : "outside the main-goalkeeper table"}. Goalkeepers do not enter the global outfield or 300-minute rankings.`,
        strengths: ["The goalkeeper value combines calibrated PSxG prevention with distinct clutch, penalty, shootout, and support channels."],
        weaknesses: ["The result describes a small tournament sample, so goalkeeper conclusions remain cautious."]
    };
}
function makeViewerSummary(report, ranking, displayName) {
    const name = displayName || report.title.replace(/ (Player|Goalkeeper) Profile$/, "");
    const team = ranking.team || "his national team";
    const position = ranking.position_group || "outfield player";
    const positionLabel = position.toLowerCase();
    const article = /^[aeiou]/i.test(positionLabel) ? "an" : "a";
    const role = ranking.functional_role || "a flexible role";
    if (positionLabel.includes("goalkeeper")) return goalkeeperSummary(name, team, ranking);
    const scored = Object.keys(viewerLanguage)
        .map((k) => ({ k, v: Number.isFinite(Number(ranking[k])) ? Number(ranking[k]) : null }))
        .filter((i) => i.v !== null)
        .sort((a, b) => b.v - a.v);
    const strengths = scored.slice(0, 2).map((i) => viewerLanguage[i.k].strength);
    const weaknesses = scored.slice(-2).reverse().map((i) => viewerLanguage[i.k].weakness);
    const globalRank = ranking.publication_global_rank_v4;
    const teamRank = ranking.publication_team_rank_v4;
    return {
        overview: `${name} played as ${article} ${positionLabel} for ${team}. His main role was ${role.toLowerCase()}${globalRank ? `, with an active outfield rank of #${globalRank} globally and #${teamRank} on the team` : ""}. The notes below translate his tournament evidence into simple soccer terms.`,
        strengths, weaknesses
    };
}

function applyV4ProfileRanking(markdown, ranking) {
    if (ranking.position_group === "Goalkeeper") return markdown;
    const low = Number(ranking.tournament_impact_interval_low_outfield_v4);
    const high = Number(ranking.tournament_impact_interval_high_outfield_v4);
    const best = Number(ranking.bootstrap_rank_best_outfield_v4);
    const worst = Number(ranking.bootstrap_rank_worst_outfield_v4);
    const bandWidth = worst - best;
    const uncertaintyStatus = bandWidth > 100 ? "wide" : bandWidth > 50 ? "moderate" : "stable";
    return markdown
        .replace(/- Global Rank v3: .*$/m, `- Global Rank v4: ${ranking.publication_global_rank_v4}`)
        .replace(/- Team Rank v3: .*$/m, `- Team Rank v4: ${ranking.publication_team_rank_v4}`)
        .replace(/- Position Rank v3: .*$/m, `- Position Rank v4: ${ranking.position_rank_v4}`)
        .replace(/- Role Rank v3: .*$/m, `- Role Rank v4: ${ranking.role_rank_v4}`)
        .replace(/- Tournament Impact: .*$/m, `- Tournament Impact: ${Number(ranking.tournament_impact_score_outfield_v4).toFixed(4)}`)
        .replace(/- Impact interval: .*$/m, `- Impact interval: [${low.toFixed(4)}, ${high.toFixed(4)}]`)
        .replace(/- Rank band: .*$/m, `- Rank band: ${best}\u2013${worst}`)
        .replace(/- Uncertainty status: .*$/m, `- Uncertainty status: ${uncertaintyStatus}`)
        .replace(
            /Older v2\/v5 columns are retained for provenance only\. They are not the active ordering described above\./,
            "Older v2/v3/v5 columns are retained for provenance only. The active outfield order above is Tournament Impact v4."
        );
}

function parsePageFrontMatter(markdown) {
    const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) throw new Error("Existing player report is missing front matter");
    const values = {};
    match[1].split(/\r?\n/).forEach((line) => {
        const field = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
        if (!field || !field[2]) return;
        let value = field[2];
        try { value = JSON.parse(value); } catch { /* retain plain YAML scalar */ }
        values[field[1]] = value;
    });
    return values;
}

// ---- build ----------------------------------------------------------------
const rankings = JSON.parse(fs.readFileSync(rankingsPath, "utf8"));
const outfieldV4Path = path.resolve(
    analysisRoot,
    "../diagnostics/ranking_repair/outfield_v4_rank_intervals.csv"
);
const outfieldV4 = parseCsv(fs.readFileSync(outfieldV4Path, "utf8"));
if (outfieldV4.length !== 553) throw new Error("The approved outfield v4 release must contain 553 players");
const rankingById = new Map(rankings.map((row) => [String(row.player_id), row]));
const v4ById = new Map(outfieldV4.map((row) => [String(row.player_id), row]));
const rawScores = outfieldV4.map((row) => Number(row.tournament_impact_score_outfield_v4));
const minV4Score = Math.min(...rawScores);
const maxV4Score = Math.max(...rawScores);
const teamCounters = new Map();
const positionCounters = new Map();
const roleCounters = new Map();
outfieldV4
    .slice()
    .sort((a, b) => Number(a.tournament_impact_rank_outfield_v4) - Number(b.tournament_impact_rank_outfield_v4))
    .forEach((v4) => {
        const ranking = rankingById.get(String(v4.player_id));
        if (!ranking || ranking.position_group === "Goalkeeper") {
            throw new Error(`Outfield v4 player ${v4.player_id} is missing compatible profile metadata`);
        }
        const teamRank = (teamCounters.get(ranking.team) || 0) + 1;
        const positionRank = (positionCounters.get(ranking.position_group) || 0) + 1;
        const roleRank = (roleCounters.get(ranking.functional_role) || 0) + 1;
        teamCounters.set(ranking.team, teamRank);
        positionCounters.set(ranking.position_group, positionRank);
        roleCounters.set(ranking.functional_role, roleRank);
        const raw = Number(v4.tournament_impact_score_outfield_v4);
        Object.assign(ranking, v4, {
            active_outfield_score_v4: (raw - minV4Score) / (maxV4Score - minV4Score),
            publication_global_rank_v4: Number(v4.tournament_impact_rank_outfield_v4),
            publication_team_rank_v4: teamRank,
            position_rank_v4: positionRank,
            role_rank_v4: roleRank
        });
    });
if (v4ById.size !== 553) throw new Error("The outfield v4 release contains duplicate player ids");
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

const curatedIdBySlug = new Map(
    Object.entries(CURATED_SLUG).map(([id, slug]) => [slug, Number(id)])
);
const existingPageById = new Map();
fs.readdirSync(contentRoot).filter((file) => file.endsWith(".md")).forEach((file) => {
    const slug = path.basename(file, ".md");
    const markdown = fs.readFileSync(path.join(contentRoot, file), "utf8");
    const frontMatter = parsePageFrontMatter(markdown);
    const rawPlayerId = String(frontMatter.playerId || "");
    const playerId = rawPlayerId.startsWith("sb-")
        ? Number(rawPlayerId.slice(3))
        : curatedIdBySlug.get(slug);
    if (!Number.isInteger(playerId)) throw new Error(`Cannot resolve player id for ${file}`);
    existingPageById.set(playerId, { file, slug, frontMatter });
});

rankings.forEach((p) => {
        const id = Number(p.player_id);
        const file = fileById[String(id)];
        if (!file) { console.warn("No profile for", id, p.player_name); return; }
        const markdown = fs.readFileSync(path.join(profilesDir, file), "utf8");
        const parsed = parseReport(markdown);
        const { goesBy, surname } = resolveNames(id, p.player_name);
        const summary = makeViewerSummary(parsed, p, goesBy);
        const existingPage = existingPageById.get(id);
        const slug = existingPage?.slug || null;
        if (slug) usedSlugs.add(slug);
        const isGoalkeeper = p.position_group === "Goalkeeper";
        const isMainGoalkeeper = isGoalkeeper && Boolean(p.is_main_goalkeeper);
        const rating = isGoalkeeper
            ? (isMainGoalkeeper ? Number(p.goalkeeper_consolidated_value_score_v5) : null)
            : Number(p.active_outfield_score_v4);

        index[id] = {
            name: goesBy,
            surname,
            team: p.team,
            role: p.functional_role || parsed && reportItems(parsed, "Ranking and role")["Functional role"] || "",
            teamRank: isGoalkeeper ? null : p.publication_team_rank_v4 || null,
            positionRank: isGoalkeeper
                ? p.goalkeeper_consolidated_value_rank_v5 || null
                : p.position_rank_v4 || null,
            globalRank: isGoalkeeper ? null : p.publication_global_rank_v4 || null,
            goalkeeperRank: isMainGoalkeeper ? p.goalkeeper_consolidated_value_rank_v5 : null,
            rankingProduct: isGoalkeeper ? "goalkeeper" : "outfield",
            rating: Number.isFinite(rating) ? rating : null,
            minutes: p.minutes ? Math.round(p.minutes) : null,
            overview: summary.overview,
            strength: summary.strengths[0] || "",
            watch: summary.weaknesses[0] || "",
            wiki: WIKI_OVERRIDE[id] || goesBy,
            slug
        };

        if (existingPage) {
            const sourceUrl = sourceBase + file;
            const pageBody = applyV4ProfileRanking(markdown.replace(/^# .+\r?\n+/, ""), p);
            const frontMatter = existingPage.frontMatter;
            const fm = [
                "---",
                `title: ${JSON.stringify(frontMatter.title || goesBy + " — player profile")}`,
                `description: ${JSON.stringify(frontMatter.description || parsed.intro[0] || "World Cup player analysis report.")}`,
                `layout: ${JSON.stringify(frontMatter.layout || "player-report")}`,
                `url: ${JSON.stringify(frontMatter.url || `/projects/worlds-coach-output/reports/${slug}/`)}`,
                `playerId: ${JSON.stringify(frontMatter.playerId || "sb-" + id)}`,
                `sourceUrl: ${JSON.stringify(sourceUrl)}`,
                `displayName: ${JSON.stringify(frontMatter.displayName || goesBy)}`,
                `wikiTitle: ${JSON.stringify(frontMatter.wikiTitle || WIKI_OVERRIDE[id] || goesBy)}`,
                `headshotUrl: ${JSON.stringify(frontMatter.headshotUrl || "")}`,
                `shirtNumber: ${JSON.stringify(frontMatter.shirtNumber || "")}`,
                `overview: ${JSON.stringify(summary.overview)}`,
                "strengths:",
                ...summary.strengths.map((s) => `  - ${JSON.stringify(s)}`),
                "weaknesses:",
                ...summary.weaknesses.map((w) => `  - ${JSON.stringify(w)}`),
                "---",
                ""
            ].join("\n");
            fs.writeFileSync(path.join(contentRoot, existingPage.file), `${fm}${pageBody}`, "utf8");
            pagesWritten += 1;
        }
    });

// ---- full appearance squads: fill formations with real players ------------
const READABLE_POS = {
    "Goalkeeper": "Goalkeeper", "Center Back": "Centre-back",
    "Fullback/Wingback": "Full-back", "Defensive Midfield": "Defensive midfielder",
    "Central/Wide Midfield": "Midfielder", "Attacking Midfield/Wing": "Winger",
    "Forward": "Forward", "Unknown": "Squad player"
};

const matchups = JSON.parse(fs.readFileSync(path.join(projectRoot, "assets/matchups.json"), "utf8"));
const nameToCode = {}, codeToName = {};
matchups.teams.forEach(function (t) { nameToCode[t.name] = t.code; codeToName[t.code] = t.name; });
const ratedInfoById = {};
rankings.forEach(function (p) {
    const isGoalkeeper = p.position_group === "Goalkeeper";
    const rating = isGoalkeeper
        ? (p.is_main_goalkeeper ? Number(p.goalkeeper_consolidated_value_score_v5) : null)
        : Number(p.active_outfield_score_v4);
    ratedInfoById[String(p.player_id)] = {
        rating: Number.isFinite(rating) ? rating : null,
        role: p.functional_role,
        rankingProduct: isGoalkeeper ? "goalkeeper" : "outfield",
        goalkeeperRank: isGoalkeeper ? p.goalkeeper_consolidated_value_rank_v5 || null : null
    };
});

const intervalsPath = process.env.PATTERN_SEEKERS_LINEUP_INTERVALS ||
    path.resolve(analysisRoot, "../../data/interim/world_cup_lineup_intervals.csv");
const squadAgg = {};
if (fs.existsSync(intervalsPath)) {
    parseCsv(fs.readFileSync(intervalsPath, "utf8")).forEach(function (r) {
        const code = nameToCode[r.team];
        if (!code || !KNOCKOUT_TEAMS.has(r.team) || !r.player_id) return;
        if (!squadAgg[code]) squadAgg[code] = {};
        if (!squadAgg[code][r.player_id]) {
            squadAgg[code][r.player_id] = { name: r.player, min: 0, posMin: {} };
        }
        const m = Number(r.minutes) || 0;
        const pg = r.position_group || "Unknown";
        squadAgg[code][r.player_id].min += m;
        squadAgg[code][r.player_id].posMin[pg] = (squadAgg[code][r.player_id].posMin[pg] || 0) + m;
    });
}

const squads = {};
Object.keys(squadAgg).forEach(function (code) {
    squads[code] = Object.keys(squadAgg[code]).map(function (pid) {
        const s = squadAgg[code][pid];
        const primary = Object.keys(s.posMin).sort(function (a, b) { return s.posMin[b] - s.posMin[a]; })[0] || "Unknown";
        const rated = ratedInfoById[pid] || null;
        if (!index[pid]) {
            const nm = resolveNames(pid, s.name);
            index[pid] = {
                name: nm.goesBy, surname: nm.surname, team: codeToName[code] || code,
                role: READABLE_POS[primary] || "Squad player",
                teamRank: null, positionRank: null, globalRank: null,
                rating: null, minutes: Math.round(s.min),
                overview: "", strength: "", watch: "",
                wiki: nm.goesBy, slug: null, rated: false
            };
        }
        return {
            id: pid, name: index[pid].name, position: primary,
            role: rated && rated.role ? rated.role : (READABLE_POS[primary] || "Squad player"),
            rating: rated ? rated.rating : null,
            rankingProduct: rated ? rated.rankingProduct : null,
            goalkeeperRank: rated ? rated.goalkeeperRank : null,
            min: Math.round(s.min)
        };
    }).sort(function (a, b) {
        const ra = a.rating == null ? -1 : a.rating;
        const rb = b.rating == null ? -1 : b.rating;
        return rb !== ra ? rb - ra : b.min - a.min;
    });
});

fs.writeFileSync(path.join(projectRoot, "assets/squads.json"), JSON.stringify(squads, null, 0) + "\n", "utf8");

fs.writeFileSync(indexOut, `${JSON.stringify(index, null, 0)}\n`, "utf8");
console.log(`player-index: ${Object.keys(index).length} players, ${pagesWritten} existing report pages refreshed`);
console.log(`squads: ${Object.keys(squads).length} teams, sizes ${Object.keys(squads).map(function (c) { return squads[c].length; }).join("/")}`);
