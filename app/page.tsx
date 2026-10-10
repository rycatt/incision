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

      <Sidebar
        meshes={meshes}
        visibility={visibility}
        onToggle={toggle}
        onToggleGroup={toggleGroup}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <ModelViewer
          selected={selected}
          onSelect={setSelected}
          visibility={visibility}
          onMeshesLoaded={setMeshes}
        />
      </div>

      <InfoPanel
        part={selected ? ORGAN_INFO[selected] ?? FALLBACK : null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
