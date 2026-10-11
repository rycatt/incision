'use client';

import { useState } from 'react';
import type { Group } from './types';

export default function useVisibility() {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  const toggle = (name: string) => {
    setVisibility((prev) => ({
      ...prev,
      [name]: prev[name] === false,
    }));
  };

  const toggleGroup = (group: Group) => {
    setVisibility((prev) => {
      const allVisible = group.members.every((m) => prev[m] !== false);
      const next = { ...prev };
      group.members.forEach((m) => {
        next[m] = !allVisible;
      });
      return next;
    });
  };

  const reset = () => setVisibility({});

  return { visibility, setVisibility, toggle, toggleGroup, reset };
}
