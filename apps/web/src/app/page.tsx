'use client';

import Sidebar from '../components/Sidebar/Sidebar';
import Canvas from '../components/Canvas/Canvas';
import Inspector from '../components/Inspector/Inspector';

export default function HomePage() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Canvas />
      <Inspector />
    </div>
  );
}
