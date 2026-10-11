'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SendHorizontal, Sparkles, X } from 'lucide-react';
import { sendChatMessage } from '../../lib/api';
import type { ChatMessage } from '../../lib/types';

const MAX_HISTORY = 20;

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M10.2 6.3c.6 3.4 2.6 5.4 6 6-3.4.6-5.4 2.6-6 6-.6-3.4-2.6-5.4-6-6 3.4-.6 5.4-2.6 6-6Z" />
      <circle cx="18.2" cy="7.3" r="1.6" />
    </svg>
  );
}

function recentHistory(messages: ChatMessage[]) {
  const recent = messages.slice(-MAX_HISTORY);
  const firstUser = recent.findIndex((message) => message.role === 'user');
  return firstUser === -1 ? recent : recent.slice(firstUser);
}

export default function ChatPanel({
  modelName,
  selectedPart,
}: {
  modelName: string;
  selectedPart: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const subject = modelName.toLowerCase();
  const suggestions = [
    selectedPart ? `What does the ${selectedPart} do?` : `How does a ${subject} breathe?`,
    `How is a ${subject} different from a human?`,
  ];

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
  }, [messages, pending, failed, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const request = async (history: ChatMessage[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPending(true);
    setFailed(false);

    try {
      const reply = await sendChatMessage(
        modelName,
        recentHistory(history),
        selectedPart,
        controller.signal
      );
      setMessages([...history, { role: 'model', text: reply }]);
    } catch {
      if (!controller.signal.aborted) setFailed(true);
    } finally {
      if (abortRef.current === controller) setPending(false);
    }
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const history: ChatMessage[] = [...messages, { role: 'user', text: trimmed }];
    setMessages(history);
    setInput('');
    request(history);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {open && (
          <motion.section
            key="chat"
            role="dialog"
            aria-label={`Chat about the ${subject}`}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setOpen(false);
            }}
            className="absolute right-0 bottom-full mb-3 flex h-[min(28rem,calc(100dvh-8rem))] w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-xl backdrop-blur"
          >
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Ask about the {subject}
                </h2>
                <p className="flex items-center gap-1 text-xs text-slate-400">
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Powered by Gemini
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div
              ref={listRef}
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
            >
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2 text-sm leading-relaxed text-slate-800">
                Hi! Ask me anything about the {subject}&apos;s anatomy.
              </div>

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={message.role === 'user' ? 'flex justify-end' : 'flex'}
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'max-w-[85%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap text-white'
                        : 'max-w-[85%] rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap text-slate-800'
                    }
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {pending && (
                <div className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-slate-100 px-3.5 py-3">
                  <span className="sr-only">The assistant is typing</span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                </div>
              )}

              {failed && (
                <p className="text-xs text-slate-400">
                  Couldn&apos;t reach the assistant.{' '}
                  <button
                    type="button"
                    onClick={() => request(messages)}
                    className="cursor-pointer font-medium text-brand hover:text-brand/70"
                  >
                    Retry
                  </button>
                </p>
              )}

              {messages.length === 0 && !pending && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => send(suggestion)}
                      className="cursor-pointer rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-brand/30 hover:bg-brand/5 hover:text-brand/70"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-slate-100 px-3 py-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={1000}
                placeholder={`Ask about the ${subject}...`}
                aria-label="Your question"
                className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || pending}
                aria-label="Send"
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Ask a question'}
        className="flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-lg transition-colors hover:bg-brand/90 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {open ? <X className="h-6 w-6" /> : <SparkleIcon className="h-7 w-7" />}
      </button>
    </div>
  );
}
