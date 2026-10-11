'use client';

import { useEffect, useState } from 'react';
import { fetchModelContent } from './api';
import type { ModelContent } from './types';

export default function useModelContent(slug: string | null) {
  const [result, setResult] = useState<{ slug: string; content: ModelContent } | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    fetchModelContent(slug).then((content) => {
      if (!cancelled) setResult({ slug, content });
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const content = result?.slug === slug ? result.content : null;
  return { content, ready: !slug || content !== null };
}
