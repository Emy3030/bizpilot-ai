import { GoogleGenerativeAI, FunctionDeclaration, Content } from '@google/generative-ai';
import { env } from '../config/env';

let client: GoogleGenerativeAI | null = null;

// gemini-1.5-flash is the old generation and may already be retired by
// Google; gemini-3.5-flash is the current GA stable Flash model.
const MODEL_NAME = 'gemini-3.5-flash';
const MAX_TOOL_ROUNDS = 6;
const MAX_NETWORK_RETRIES = 2;
const NETWORK_RETRY_DELAY_MS = 1500;

function getClient(): GoogleGenerativeAI | null {
  if (!env.geminiApiKey) return null;
  if (!client) client = new GoogleGenerativeAI(env.geminiApiKey);
  return client;
}

// Distinguishes a transient network blip (Node's fetch itself failing to
// reach Google — confirmed transient in practice, retrying moments later
// succeeds) from a genuine API-level rejection (bad key, quota, safety
// block) that a retry can't fix and shouldn't waste a call on.
function isTransientNetworkError(error: unknown): boolean {
  return error instanceof TypeError && /fetch failed/i.test(error.message);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withNetworkRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_NETWORK_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientNetworkError(error) || attempt === MAX_NETWORK_RETRIES) throw error;
      // eslint-disable-next-line no-console
      console.warn(`[Gemini] transient network error, retrying (${attempt + 1}/${MAX_NETWORK_RETRIES})...`);
      await sleep(NETWORK_RETRY_DELAY_MS);
    }
  }
  throw lastError;
}

export interface ToolCallRequest {
  name: string;
  args: Record<string, unknown>;
}

export interface AgentTurnResult {
  text: string;
  toolCalls: { name: string; args: Record<string, unknown>; result: unknown }[];
}

export const geminiService = {
  isConfigured(): boolean {
    return !!env.geminiApiKey;
  },

  /** Plain text generation, no tools — kept for anything that doesn't need to act. */
  async generate(systemPrompt: string, userMessage: string): Promise<string> {
    const genAI = getClient();

    if (!genAI) {
      return "The AI Assistant isn't fully set up yet — a Gemini API key needs to be added to the server's environment before I can respond. Once that's in place, I'll be able to answer questions about your business in real time.";
    }

    try {
      const model = genAI.getGenerativeModel({ model: MODEL_NAME, systemInstruction: systemPrompt });
      const result = await withNetworkRetry(() => model.generateContent(userMessage));
      const text = result.response.text().trim();
      return text || "I couldn't generate a response for that. Could you try rephrasing your question?";
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Gemini] generation failed:', error);
      return 'I ran into an issue reaching the AI service just now. Please try again in a moment.';
    }
  },

  /**
   * Runs an agentic turn: sends the message with a set of callable tools,
   * and whenever Gemini responds with a function call instead of text,
   * invokes `executeTool` and feeds the result back in — looping until
   * Gemini gives a final text answer (or MAX_TOOL_ROUNDS is hit, as a
   * safety valve against a runaway loop).
   */
  async runAgentTurn(
    systemPrompt: string,
    userMessage: string,
    tools: FunctionDeclaration[],
    executeTool: (call: ToolCallRequest) => Promise<unknown>
  ): Promise<AgentTurnResult> {
    const genAI = getClient();
    const toolCalls: AgentTurnResult['toolCalls'] = [];

    if (!genAI) {
      return {
        text: "The AI Assistant isn't fully set up yet — a Gemini API key needs to be added to the server's environment before I can respond.",
        toolCalls,
      };
    }

    try {
      const model = genAI.getGenerativeModel({
        model: MODEL_NAME,
        systemInstruction: systemPrompt,
        tools: [{ functionDeclarations: tools }],
      });

      const chat = model.startChat({ history: [] as Content[] });
      let result = await withNetworkRetry(() => chat.sendMessage(userMessage));

      for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
        const calls = result.response.functionCalls();
        if (!calls || calls.length === 0) break;

        const responseParts: { functionResponse: { name: string; response: object } }[] = [];
        for (const call of calls) {
          const args = (call.args || {}) as Record<string, unknown>;
          const toolResult = await executeTool({ name: call.name, args });
          toolCalls.push({ name: call.name, args, result: toolResult });
          responseParts.push({
            functionResponse: { name: call.name, response: toolResult as object },
          });
        }

        result = await withNetworkRetry(() => chat.sendMessage(responseParts));
      }

      const text = result.response.text().trim();
      return {
        text: text || "I've completed that, but didn't have anything further to add.",
        toolCalls,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Gemini] agent turn failed:', error);
      return {
        text: 'I ran into an issue completing that action. Please try again in a moment.',
        toolCalls,
      };
    }
  },
};
