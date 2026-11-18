/**
 * @fileoverview Input sanitization and prompt injection defense utilities.
 * Strips ASCII control characters, HTML/script tags, and delimiter manipulation tokens.
 */

const HTML_TAGS_REGEX = /<[^>]*>/g;
const PROMPT_DELIMITER_REGEX = /["'`\\]/g;

function isAllowedCodePoint(code: number): boolean {
  if (code === 0x09 || code === 0x0a || code === 0x0d) return true;
  if (code >= 0x00 && code <= 0x1f) return false;
  if (code >= 0x7f && code <= 0x9f) return false;
  return true;
}

/**
 * Strips non-printable ASCII and Unicode control characters without regex lint suppressions.
 */
export function stripControlCharacters(input: string): string {
  let result = "";
  for (const char of input) {
    const code = char.codePointAt(0);
    if (code !== undefined && isAllowedCodePoint(code)) {
      result += char;
    }
  }
  return result;
}

/**
 * Removes markup tags to prevent HTML injection and XSS vectors.
 */
export function stripHtmlTags(input: string): string {
  return input.replace(HTML_TAGS_REGEX, "");
}

/**
 * Sanitizes general free text by removing controls and tags, and clamping length.
 *
 * @param input - Untrusted user input.
 * @param maxLength - Maximum permitted character length.
 * @returns Cleaned string.
 */
export function sanitizeInput(input: string, maxLength = 300): string {
  const stripped = stripHtmlTags(stripControlCharacters(input)).trim();
  return stripped.slice(0, maxLength);
}

/**
 * Wraps untrusted text in strict delimiters and neutralizes escape sequences for prompt context.
 *
 * @param rawText - Text to be safely injected into LLM user prompt blocks.
 * @returns Safe delimited string.
 */
export function sanitizePromptData(rawText: string): string {
  const sanitized = sanitizeInput(rawText, 500);
  const escaped = sanitized.replace(PROMPT_DELIMITER_REGEX, "");
  return `<<<USER_DATA_START>>>\n${escaped}\n<<<USER_DATA_END>>>`;
}
