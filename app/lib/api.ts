import type { ChatMessage } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

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
