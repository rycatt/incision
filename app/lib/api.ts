import type { ChatMessage, ModelContent } from './types';
import { EMPTY_CONTENT } from '../data/defaults';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const contentCache = new Map<string, Promise<ModelContent>>();

export function fetchModelContent(slug: string): Promise<ModelContent> {
  const cached = contentCache.get(slug);
  if (cached) return cached;

  const request = fetch(`${API_URL}/models/${slug}/content`)
    .then((res) => {
      if (!res.ok) throw new Error(`Content request failed: ${res.status}`);
      return res.json() as Promise<ModelContent>;
    })
    .catch((error) => {
      console.warn(`Using built-in defaults for "${slug}":`, error);
      contentCache.delete(slug);
      return EMPTY_CONTENT;
    });

  contentCache.set(slug, request);
  return request;
}

export async function sendChatMessage(
  model: string,
  messages: ChatMessage[],
  selectedPart: string | null,
  signal?: AbortSignal
): Promise<string> {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, selected_part: selectedPart }),
    signal,
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  const data = (await res.json()) as { reply: string };
  return data.reply;
}
