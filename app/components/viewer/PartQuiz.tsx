'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { sendChatMessage } from '../../lib/api';
import type { ChatMessage } from '../../lib/types';

type Option = { letter: string; text: string };
type Question = { text: string; options: Option[] };
type Status = 'idle' | 'asking' | 'question' | 'checking' | 'feedback' | 'done' | 'error';

const MAX_HISTORY = 12;

function GeminiIcon({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <defs>
        <linearGradient id={id} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4285f4" />
          <stop offset="0.55" stopColor="#9b72cb" />
          <stop offset="1" stopColor="#d96570" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 2c.5 5.3 4.7 9.5 10 10-5.3.5-9.5 4.7-10 10-.5-5.3-4.7-9.5-10-10 5.3-.5 9.5-4.7 10-10Z"
      />
    </svg>
  );
}

function questionPrompt(part: string, model: string) {
  return [
    `Ask me one short quiz question about the ${part} of this ${model}. Don't give the answer yet.`,
    'Make it an introductory-level multiple-choice question with exactly 4 options, about what the part does or where it is. Keep the wording simple. The wrong options should be reasonable but clearly distinguishable for a student who knows the basics.',
    'Reply in exactly this format and nothing else:',
    'Question: <question>',
    'A) <option>',
    'B) <option>',
    'C) <option>',
    'D) <option>',
  ]
    .filter(Boolean)
    .join('\n');
}

function parseQuestion(reply: string): Question | null {
  const lines = reply
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const questionLines: string[] = [];
  const options: Option[] = [];

  for (const line of lines) {
    const match = line.match(/^\**([A-D])[).:]\**\s*(.+)$/i);
    if (match) {
      options.push({ letter: match[1].toUpperCase(), text: match[2].trim() });
    } else if (options.length === 0) {
      questionLines.push(line.replace(/^\**question:?\**\s*/i, ''));
    }
  }

  if (questionLines.length === 0 || options.length < 2) return null;
  return { text: questionLines.join(' '), options };
}

function trimHistory(messages: ChatMessage[]) {
  const recent = messages.slice(-MAX_HISTORY);
  const firstUser = recent.findIndex((message) => message.role === 'user');
  return firstUser === -1 ? recent : recent.slice(firstUser);
}

export default function PartQuiz({
  modelName,
  partLabel,
}: {
  modelName: string;
  partLabel: string;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [choice, setChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const retryRef = useRef<(() => void) | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const request = async (messages: ChatMessage[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      return await sendChatMessage(modelName, trimHistory(messages), partLabel, controller.signal);
    } catch (err) {
      if (controller.signal.aborted) return null;
      throw err;
    }
  };

  const ask = async () => {
    const messages: ChatMessage[] = [{ role: 'user', text: questionPrompt(partLabel, modelName) }];
    retryRef.current = ask;
    setStatus('asking');
    setError(null);
    setQuestion(null);
    setChoice(null);
    setFeedback(null);

    try {
      const reply = await request(messages);
      if (reply === null) return;
      const parsed = parseQuestion(reply);
      if (!parsed) throw new Error('Unreadable question');
      setHistory([...messages, { role: 'model', text: reply }]);
      setQuestion(parsed);
      setStatus('question');
    } catch {
      setError("Couldn't load a question. Check your connection and try again.");
      setStatus('error');
    }
  };

  const submit = async () => {
    const option = question?.options.find((o) => o.letter === choice);
    if (!option) return;
    const messages: ChatMessage[] = [
      ...history,
      {
        role: 'user',
        text: `My answer: ${option.letter}) ${option.text}. Tell me if I'm correct and briefly explain.`,
      },
    ];
    retryRef.current = submit;
    setStatus('checking');
    setError(null);

    try {
      const reply = await request(messages);
      if (reply === null) return;
      setHistory([...messages, { role: 'model', text: reply }]);
      setFeedback(reply);
      setStatus('feedback');
    } catch {
      setError("Couldn't check your answer. Try again.");
      setStatus('error');
    }
  };

  const end = () => {
    abortRef.current?.abort();
    setStatus(feedback ? 'done' : 'idle');
    setHistory([]);
    setQuestion(null);
    setChoice(null);
    setFeedback(null);
    setError(null);
  };

  if (status === 'done') return null;

  if (status === 'idle') {
    return (
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={ask}
          aria-label="Quiz me"
          className="group relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line bg-white transition-colors hover:bg-ink-50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          <GeminiIcon className="h-5 w-5" />
          <span
            role="tooltip"
            className="pointer-events-none absolute right-0 bottom-full mb-2 rounded-md bg-ink-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            Quiz me
          </span>
        </button>
      </div>
    );
  }

  const locked = status === 'checking' || status === 'feedback';

  return (
    <section aria-label="Quiz" aria-live="polite" className="mt-5 border-t border-line pt-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-medium tracking-widest text-accent uppercase">
          <GeminiIcon className="h-3.5 w-3.5" />
          Quiz
        </p>
        <button
          type="button"
          onClick={end}
          className="cursor-pointer text-xs text-ink-600 transition-colors hover:text-ink-900"
        >
          End quiz
        </button>
      </div>

      {status === 'asking' && (
        <p className="flex items-center gap-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Writing a question…
        </p>
      )}

      {question && (
        <>
          <p className="text-[15px] leading-relaxed font-medium text-ink-900">{question.text}</p>
          <div role="radiogroup" aria-label="Answer choices" className="mt-3 space-y-2">
            {question.options.map((option) => {
              const picked = choice === option.letter;
              return (
                <button
                  key={option.letter}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  disabled={locked}
                  onClick={() => setChoice(option.letter)}
                  className={`flex w-full cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-sm leading-snug transition-colors disabled:cursor-default ${
                    picked
                      ? 'border-accent bg-accent-soft text-ink-900'
                      : 'border-line text-ink-700 enabled:hover:bg-ink-50'
                  }`}
                >
                  <span
                    className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      picked ? 'bg-accent text-accent-fg' : 'bg-ink-100 text-ink-600'
                    }`}
                  >
                    {option.letter}
                  </span>
                  {option.text}
                </button>
              );
            })}
          </div>
        </>
      )}

      {status === 'question' && (
        <button
          type="button"
          onClick={submit}
          disabled={!choice}
          className="mt-4 w-full cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit
        </button>
      )}

      {status === 'checking' && (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-600">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Checking your answer…
        </p>
      )}

      {status === 'feedback' && feedback && (
        <>
          <p className="mt-4 rounded-lg bg-accent-soft p-3 text-sm leading-relaxed whitespace-pre-wrap text-ink-800">
            {feedback}
          </p>
          <p className="mt-2 text-xs text-ink-600">
            Select the part again for a new question.
          </p>
        </>
      )}

      {status === 'error' && error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}{' '}
          <button
            type="button"
            onClick={() => retryRef.current?.()}
            className="cursor-pointer font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </p>
      )}
    </section>
  );
}
