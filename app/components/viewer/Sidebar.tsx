'use client';

import { GROUPS } from '../../data/groups';
import { ORGAN_INFO } from '../../data/organInfo';
import type { Group } from '../../lib/types';

const SECTION_HEADER =
  'mb-3 text-xs font-medium tracking-widest text-accent uppercase';

const ROW =
  'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 select-none transition-colors hover:bg-white';

const CHECKBOX = 'h-4 w-4 cursor-pointer accent-accent';

const LABEL_ON = 'text-sm text-ink-800 transition-colors';

const LABEL_OFF = 'text-sm text-ink-400 transition-colors';

export default function Sidebar({
  meshes,
  visibility,
  onToggle,
  onToggleGroup,
}: {
  meshes: string[];
  visibility: Record<string, boolean>;
  onToggle: (name: string) => void;
  onToggleGroup: (group: Group) => void;
}) {
  const visibleGroups = GROUPS.filter((g) => g.members.length > 0);

  return (
    <aside className="max-h-[calc(100dvh-8rem)] w-64 overflow-y-auto overscroll-contain rounded-2xl panel-muted p-6">
      {visibleGroups.length > 0 && (
        <>
          <h2 className={SECTION_HEADER}>Systems</h2>

          {visibleGroups.map((group) => {
            const allVisible = group.members.every(
              (m) => visibility[m] !== false
            );
            const anyVisible = group.members.some(
              (m) => visibility[m] !== false
            );

            return (
              <label key={group.id} className={ROW}>
                <input
                  type="checkbox"
                  checked={allVisible}
                  ref={(el) => {
                    if (el) el.indeterminate = !allVisible && anyVisible;
                  }}
                  onChange={() => onToggleGroup(group)}
                  className={CHECKBOX}
                />
                <span className={anyVisible ? LABEL_ON : LABEL_OFF}>
                  {group.label}
                </span>
              </label>
            );
          })}

          <div className="my-4 h-px bg-line" />
        </>
      )}

      <h2 className={SECTION_HEADER}>Individual Parts</h2>

      {meshes.length === 0 && (
        <p className="text-sm text-ink-600">No named meshes found.</p>
      )}

      {meshes.map((name) => {
        const isVisible = visibility[name] !== false;
        const label = ORGAN_INFO[name]?.label ?? name;
        return (
          <label key={name} className={ROW}>
            <input
              type="checkbox"
              checked={isVisible}
              onChange={() => onToggle(name)}
              className={CHECKBOX}
            />
            <span className={isVisible ? LABEL_ON : LABEL_OFF}>{label}</span>
          </label>
        );
      })}
    </aside>
  );
}
