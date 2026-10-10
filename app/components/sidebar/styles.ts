import type { CSSProperties } from 'react';

export const SECTION_HEADER: CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  color: 'rgba(255,255,255,0.5)',
  margin: '0 0 12px 0',
};

export const ROW: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '7px 4px',
  cursor: 'pointer',
  userSelect: 'none',
  borderRadius: 4,
};

export const LABEL_ON: CSSProperties = {
  fontSize: 13,
  color: 'white',
  transition: 'color 0.15s',
};

export const LABEL_OFF: CSSProperties = {
  fontSize: 13,
  color: 'rgba(255,255,255,0.4)',
  transition: 'color 0.15s',
};
