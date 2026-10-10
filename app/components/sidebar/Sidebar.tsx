'use client';

import { GROUPS } from '../../data/groups';
import { ORGAN_INFO } from '../../data/organInfo';
import type { Group } from '../../types/anatomy';
import { SECTION_HEADER, ROW, LABEL_ON, LABEL_OFF } from './styles';

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 240,
        height: '100vh',
        background: 'rgba(15, 18, 28, 0.94)',
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '24px 20px',
        overflowY: 'auto',
        zIndex: 10,
        borderRight: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {visibleGroups.length > 0 && (
        <>
          <h2 style={SECTION_HEADER}>Systems</h2>

          {visibleGroups.map((group) => {
            const allVisible = group.members.every(
              (m) => visibility[m] !== false
            );
            const anyVisible = group.members.some(
              (m) => visibility[m] !== false
            );
            const labelStyle = anyVisible ? LABEL_ON : LABEL_OFF;

            return (
              <label key={group.id} style={ROW}>
                <input
                  type="checkbox"
                  checked={allVisible}
                  ref={(el) => {
                    if (el) el.indeterminate = !allVisible && anyVisible;
                  }}
                  onChange={() => onToggleGroup(group)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={labelStyle}>{group.label}</span>
              </label>
            );
          })}

          <div
            style={{
              height: 1,
              background: 'rgba(255,255,255,0.08)',
              margin: '18px 0 18px',
            }}
          />
        </>
      )}

      <h2 style={SECTION_HEADER}>Individual Parts</h2>

      {meshes.length === 0 && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          No named meshes found.
        </p>
      )}

      {meshes.map((name) => {
        const isVisible = visibility[name] !== false;
        const label = ORGAN_INFO[name]?.label ?? name;
        return (
          <label key={name} style={ROW}>
            <input
              type="checkbox"
              checked={isVisible}
              onChange={() => onToggle(name)}
              style={{ cursor: 'pointer' }}
            />
            <span style={isVisible ? LABEL_ON : LABEL_OFF}>{label}</span>
          </label>
        );
      })}
    </div>
  );
}
