'use client';

import { useState } from 'react';
import InfoPanel from './components/panel/InfoPanel';
import Sidebar from './components/sidebar/Sidebar';
import ModelViewer from './components/viewer/ModelViewer';
import { ORGAN_INFO, FALLBACK } from './data/organInfo';
import useVisibility from './hooks/useVisibility';

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null);
  const [meshes, setMeshes] = useState<string[]>([]);
  const { visibility, toggle, toggleGroup } = useVisibility();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <h1
        style={{
          position: 'absolute',
          top: 24,
          left: 264,
          zIndex: 2,
          margin: 0,
          padding: '11px 16px',
          borderLeft: '4px solid #ff8b52',
          background: 'rgba(15, 18, 28, 0.94)',
          boxShadow: '0 8px 24px rgba(15, 18, 28, 0.2)',
          color: '#f5bd58',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: 18,
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        Beyond dissection
      </h1>

      <Sidebar
        meshes={meshes}
        visibility={visibility}
        onToggle={toggle}
        onToggleGroup={toggleGroup}
      />

      <ModelViewer
        selected={selected}
        onSelect={setSelected}
        visibility={visibility}
        onMeshesLoaded={setMeshes}
      />

      <InfoPanel
        part={selected ? ORGAN_INFO[selected] ?? FALLBACK : null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
