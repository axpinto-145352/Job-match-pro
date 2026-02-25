/**
 * PII (Personally Identifiable Information) scrubbing utility.
 *
 * Detects and removes common PII patterns from text, replacing them
 * with redaction placeholders.
 */

interface PIIPattern {
  name: string
  regex: RegExp
  replacement: string
}

const PII_PATTERNS: PIIPattern[] = [
  {
    name: 'SSN',
    // Matches SSNs in formats: 123-45-6789, 123 45 6789, 123456789
    regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    replacement: '[SSN REDACTED]',
  },
  {
    name: 'Email',
    // Matches standard email addresses
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
    replacement: '[EMAIL REDACTED]',
  },
  {
    name: 'Phone (US)',
    // Matches US phone numbers in various formats:
    // (123) 456-7890, 123-456-7890, 123.456.7890, +1 123 456 7890, etc.
    regex: /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    replacement: '[PHONE REDACTED]',
  },
]

/**
 * Scrubs PII from the given text by replacing detected patterns
 * with redaction placeholders.
 *
 * Detects:
 * - Social Security Numbers (SSN)
 * - Email addresses
 * - US phone numbers
 *
 * @param text - The input text that may contain PII
 * @returns The text with all detected PII replaced by redaction placeholders
 */
export function scrubPII(text: string): string {
  let scrubbed = text

  for (const pattern of PII_PATTERNS) {
    scrubbed = scrubbed.replace(pattern.regex, pattern.replacement)
  }

  return scrubbed
}

export default scrubPII
