import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = path.join(projectRoot, "public");
const failures = [];

function filesBelow(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(directory, entry.name);
        return entry.isDirectory() ? filesBelow(fullPath) : [fullPath];
    });
}

function attributes(tag) {
    const result = {};
    for (const match of tag.matchAll(/\b([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)) {
        result[match[1].toLowerCase()] = match[3];
    }
    return result;
}

function fail(file, message) {
    failures.push(`${path.relative(projectRoot, file)}: ${message}`);
}

const htmlFiles = filesBelow(publicRoot).filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    const markup = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
    const isRedirect = /<meta\b[^>]*\bhttp-equiv\s*=\s*(["']?)refresh\1/is.test(html);
    const ids = new Set();

    for (const match of markup.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gs)) {
        const id = match[2];
        if (ids.has(id)) fail(file, `duplicate id "${id}"`);
        ids.add(id);
    }

    if (!/<html\b[^>]*\blang\s*=\s*(["'])[^"']+\1/is.test(html)) {
        fail(file, "missing document language");
    }
    if (!isRedirect && !/<meta\b[^>]*\bname\s*=\s*(["'])viewport\1/is.test(html)) {
        fail(file, "missing viewport metadata");
    }

    for (const match of markup.matchAll(/<(?:img|iframe)\b[^>]*>/gis)) {
        const tag = match[0];
        const attrs = attributes(tag);
        if (/^<img\b/i.test(tag) && !Object.hasOwn(attrs, "alt")) {
            fail(file, "image is missing alt text");
        }
        if (/^<iframe\b/i.test(tag) && !attrs.title) {
            fail(file, "iframe is missing a title");
        }
    }

    for (const match of markup.matchAll(/<a\b[^>]*>/gis)) {
        const attrs = attributes(match[0]);
        if (attrs.target === "_blank" && !/\b(?:noopener|noreferrer)\b/.test(attrs.rel || "")) {
            fail(file, "target=_blank link is missing noopener/noreferrer");
        }
        if (attrs.href && attrs.href.startsWith("#") && attrs.href.length > 1) {
            const target = decodeURIComponent(attrs.href.slice(1));
            if (!ids.has(target)) fail(file, `fragment link points to missing id "${target}"`);
        }
    }

    for (const match of markup.matchAll(/\baria-(?:controls|labelledby|describedby)\s*=\s*(["'])(.*?)\1/gs)) {
        for (const id of match[2].trim().split(/\s+/)) {
            if (id && !ids.has(id)) fail(file, `ARIA reference points to missing id "${id}"`);
        }
    }
}

if (failures.length) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
} else {
    console.log(`HTML audit: ${htmlFiles.length} files passed.`);
}
