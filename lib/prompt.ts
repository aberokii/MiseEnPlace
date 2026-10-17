// Shared model setting for the whole app. Override with ANTHROPIC_MODEL in .env.
// PRD: Sonnet 5.5 for speed on stage; switch to 'claude-opus-5-5' only if audit reasoning is weak.
export const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5-5';

export const CHAT_SYSTEM_PROMPT = `You are Mise en Place, a friendly AI coach for small business owners.
Explain things in plain, non-technical language. Keep answers short.`;
