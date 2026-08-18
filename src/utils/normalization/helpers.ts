 /**
 * Extracts all referenced linkIds from a FHIRPath expression used in a Questionnaire extension (e.g. valueExpression).
 * 
 * Supports:
 * - Exact: linkId = 'foo' / == / !=
 * - Membership: linkId in ('foo', 'bar')
 * - Regex: linkId.matches('^pattern$')
 * 
 * For .matches() it intelligently expands:
 * - Character classes: [1-5], [a-z], [0-9]
 * - Alternations: (1|3|10), (0[1-5]|10)
 */

export const extractLinkIdsFromFhirPath = (expression: string): string[] => {
  const linkIds = new Set<string>();

  // 1. Exact equality / inequality
  const exactRegex = /linkId\s*(?:==?|!=)\s*['"]([^'"]+)['"]/gi;
  let match: RegExpExecArray | null;
  while ((match = exactRegex.exec(expression)) !== null) {
    linkIds.add(match[1]);
  }

  // 2. Membership: linkId in ('a', 'b', ...)
  const inRegex = /linkId\s+in\s+\(([^)]+)\)/gi;
  while ((match = inRegex.exec(expression)) !== null) {
    const inContent = match[1];
    const quotedRegex = /['"]([^'"]+)['"]/g;
    let qMatch: RegExpExecArray | null;
    while ((qMatch = quotedRegex.exec(inContent)) !== null) {
      linkIds.add(qMatch[1]);
    }
  }

  // 3. Regex matches: linkId.matches('^...$')
  const matchesRegex = /linkId\s*\.\s*matches\s*\(\s*['"]([^'"]+)['"]\s*\)/gi;
  while ((match = matchesRegex.exec(expression)) !== null) {
    const pattern = match[1];
    const expanded = expandRegexPattern(pattern);
    expanded.forEach((id) => linkIds.add(id));
  }

  return Array.from(linkIds).sort();
}

// ----------------------------------------------------------------------
// Main regex pattern expander (handles ranges + alternations)
// ----------------------------------------------------------------------
const expandRegexPattern = (pattern: string): string[] => {
  if (!pattern.startsWith('^') || !pattern.endsWith('$')) {
    return [pattern]; // fallback
  }

  const inner = pattern.slice(1, -1);
  return expandInner(inner);
}

// Recursive helper that handles | alternations and character classes
function expandInner(pattern: string): string[] {
  // Split on top-level | (not inside parentheses)
  const alternatives = splitTopLevelOr(pattern);
  if (alternatives.length > 1) {
    const result: string[] = [];
    for (const alt of alternatives) {
      result.push(...expandInner(alt));
    }
    return result;
  }

  // No top-level | → process character classes and literals
  const parts: (string | string[])[] = [];
  let i = 0;
  while (i < pattern.length) {
    if (pattern[i] === '[') {
      const end = pattern.indexOf(']', i + 1);
      if (end === -1) return [pattern]; // malformed
      const classContent = pattern.slice(i + 1, end);
      parts.push(expandCharClass(classContent));
      i = end + 1;
    } else if (pattern[i] === '(') {
      // Simple group support (we already split top-level |, so this is for nested)
      const end = findClosingParen(pattern, i);
      if (end === -1) return [pattern];
      const groupContent = pattern.slice(i + 1, end);
      parts.push(expandInner(groupContent)); // recurse
      i = end + 1;
    } else {
      // literal character
      parts.push(pattern[i]);
      i++;
    }
  }

  // Cartesian product to generate all combinations
  const results: string[] = [];
  function generate(idx: number, current: string) {
    if (idx === parts.length) {
      results.push(current);
      return;
    }
    const part = parts[idx];
    if (typeof part === 'string') {
      generate(idx + 1, current + part);
    } else {
      for (const ch of part) {
        generate(idx + 1, current + ch);
      }
    }
  }
  generate(0, '');
  return results;
}

// Splits on | that are not inside parentheses
const splitTopLevelOr = (pattern: string): string[] => {
  const parts: string[] = [];
  let start = 0;
  let parenLevel = 0;

  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] === '(') parenLevel++;
    else if (pattern[i] === ')') parenLevel--;
    else if (pattern[i] === '|' && parenLevel === 0) {
      parts.push(pattern.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(pattern.slice(start));
  return parts;
}

// Finds matching closing parenthesis
const findClosingParen = (str: string, openPos: number): number => {
  let level = 1;
  for (let i = openPos + 1; i < str.length; i++) {
    if (str[i] === '(') level++;
    else if (str[i] === ')') {
      level--;
      if (level === 0) return i;
    }
  }
  return -1;
}

// ----------------------------------------------------------------------
// Character class expander (unchanged from previous version)
// ----------------------------------------------------------------------
const expandCharClass = (classStr: string): string[] => {
  const chars = new Set<string>();
  let j = 0;
  while (j < classStr.length) {
    if (j + 2 < classStr.length && classStr[j + 1] === '-') {
      const start = classStr[j].charCodeAt(0);
      const end = classStr[j + 2].charCodeAt(0);
      if (start <= end) {
        for (let code = start; code <= end; code++) {
          chars.add(String.fromCharCode(code));
        }
      }
      j += 3;
    } else {
      chars.add(classStr[j]);
      j++;
    }
  }
  return Array.from(chars).sort();
}