/**
 * @fileoverview Input sanitization and prompt injection defense utilities.
 * Strips ASCII control characters, HTML/script tags, and delimiter manipulation tokens.
 */

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_REGEX = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
const HTML_TAGS_REGEX = /<[^>]*>/g;
const PROMPT_DELIMITER_REGEX = /["'`\\]/g;

/**
 * Strips non-printable ASCII and Unicode control characters.
 */
export function stripControlCharacters(input: string): string {
  return input.replace(CONTROL_CHARS_REGEX, "");
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
