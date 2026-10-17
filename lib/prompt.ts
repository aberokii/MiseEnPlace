// Starter chat prompt. Shared model constant for the whole app.
// PRD: Sonnet for speed on stage; switch to 'claude-opus-5' only if audit reasoning is weak.
export const MODEL = 'claude-sonnet-5';

export const CHAT_SYSTEM_PROMPT = `You are Mise en Place, a friendly AI coach for small business owners.
Explain things in plain, non-technical language. Keep answers short.`;
