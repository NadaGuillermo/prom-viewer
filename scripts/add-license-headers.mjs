import fs from "fs";
import path from "path";

const ROOT = process.cwd();

/**
 * Files/directories never touched
 */
const HARD_EXCLUDES = new Set([
  "node_modules",
  "dist",
  "build",
  ".yarn",
  ".git",
]);

/**
 * User-controlled exclusions
 * Supports substring/path matching
 */
const EXCLUDE_PATHS = [
  "src/mocks",
  "src/test",
  "public/mockServiceWorker.js",
  "**/*.d.ts",
  "**/*.config.*",
];

// GPL header
const GPL_HEADER = {
  ts: `/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/
\n`,

  css: `/*
PROM Viewer: SMART on FHIR web application for visualizing patient-reported outcome measures (PROMs).
Copyright (C) 2026 Thomas Eisenhauer

This file is part of PROM Viewer.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License v3.0 or later.
See the LICENSE file for details.
*/
\n`,
};

const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);

function hasSkipMarker(content) {
  return (
    content.includes("license: skip") ||
    content.includes("@license skip") ||
    content.includes("LICENSE: ignore")
  );
}

function getHeader(file) {
  const ext = path.extname(file);

  if (ext === ".css") return GPL_HEADER.css;
  return GPL_HEADER.ts; // ts/js/jsx/tsx all use /* */
}

function matchesPattern(filePath, pattern) {
  const normalizedPath = filePath.split(path.sep).join("/");
  const normalizedPattern = pattern.split(path.sep).join("/");
  if (!normalizedPattern.includes("*")) {
    return normalizedPath.includes(normalizedPattern);
  }

  const regex = normalizedPattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "__DOUBLE_STAR__")
    .replace(/\*/g, "[^/]*")
    .replace(/__DOUBLE_STAR__/g, ".*");

  const globRegex = regex.replace(/^\.\*\//, "(?:.*/)?");
  return new RegExp(`^${globRegex}$`).test(normalizedPath);
}

function shouldSkip(filePath, content) {
  const normalized = filePath.split(path.sep);

  // 1. hard excludes
  if (normalized.some((part) => HARD_EXCLUDES.has(part))) {
    return true;
  }

  // 2. pattern excludes
  for (const pattern of EXCLUDE_PATHS) {
    if (matchesPattern(filePath, pattern)) {
      return true;
    }
  }

  // 3. file-level opt-out
  if (content && hasSkipMarker(content)) {
    return true;
  }

  return false;
}

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (shouldSkip(fullPath)) continue;

    if (entry.isDirectory()) {
      walk(fullPath, results);
    } else {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.has(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");

  if (shouldSkip(filePath, content)) {
    console.log(`- skipped (rule): ${filePath}`);
    return;
  }

  if (content.includes("GNU General Public License")) {
    console.log(`✓ already has header: ${filePath}`);
    return;
  }

  const header = getHeader(filePath);
  const updated = header + content;

  fs.writeFileSync(filePath, updated, "utf8");
  console.log(`+ added header: ${filePath}`);
}

function main() {
  const files = walk(ROOT);

  console.log(`Found ${files.length} files`);

  for (const file of files) {
    processFile(file);
  }

  console.log("Done.");
}

main();
