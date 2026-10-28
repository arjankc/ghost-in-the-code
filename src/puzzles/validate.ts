/** Normalize player answers for deterministic comparison. */
export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[`'"“”‘’]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[.;,]+$/g, '')
}

export function isCorrectAnswer(
  submission: string,
  acceptedAnswers: string[],
): boolean {
  const normalized = normalizeAnswer(submission)
  if (!normalized) return false
  return acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalized)
}
