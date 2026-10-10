'use client';

import { GROUPS } from '../../data/groups';
import { ORGAN_INFO } from '../../data/organInfo';
import type { Group } from '../../types/anatomy';
import { SECTION_HEADER, ROW, CHECKBOX, LABEL_ON, LABEL_OFF } from './styles';

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
    <aside className="max-h-[calc(100dvh-8rem)] w-64 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white/95 p-6 backdrop-blur">
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

          <div className="my-4 h-px bg-slate-200" />
        </>
      )}

      <h2 className={SECTION_HEADER}>Individual Parts</h2>

      {meshes.length === 0 && (
        <p className="text-sm text-slate-400">No named meshes found.</p>
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
