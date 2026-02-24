import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import { SoccerPitch } from './stadium/SoccerPitch';
import { StadiumStand, type StadiumSection } from './stadium/StadiumStand';
import { RoofStructure } from './stadium/RoofStructure';
import { BasePlatform, SurroundingBuildings, Scoreboard, CornerSection, TeamBus } from './stadium/StadiumExtras';

interface Stadium3DProps {
  sections: StadiumSection[];
  selectedSection: StadiumSection | null;
  onSectionSelect: (section: StadiumSection) => void;
}

function StadiumModel({ sections, selectedSection, onSectionSelect }: Stadium3DProps) {
  const pitchW = 16;
  const pitchH = 10;
  const gap = 1;

  // Stand configs: position is the front-bottom-center of the stand
  // rotation faces the stand toward the pitch
  const standConfigs = [
    { // Main Stand (South - front)
      position: [0, 0, -(pitchH / 2 + gap)] as [number, number, number],
      rotation: 0,
      width: pitchW + 2,
      standType: 'main' as const,
      depth: 7,
      roofH: 6.7,
    },
    { // Opposite Stand (North - back)
      position: [0, 0, pitchH / 2 + gap] as [number, number, number],
      rotation: Math.PI,
      width: pitchW + 2,
      standType: 'opposite' as const,
      depth: 6.5,
      roofH: 6.2,
    },
    { // West End
      position: [-(pitchW / 2 + gap), 0, 0] as [number, number, number],
      rotation: Math.PI / 2,
      width: pitchH + 1,
      standType: 'end' as const,
      depth: 5.5,
      roofH: 5.2,
    },
    { // East End
      position: [pitchW / 2 + gap, 0, 0] as [number, number, number],
      rotation: -Math.PI / 2,
      width: pitchH + 1,
      standType: 'end' as const,
      depth: 5.5,
      roofH: 5.2,
    },
  ];

  const cx = pitchW / 2 + gap;
  const cz = pitchH / 2 + gap;

  return (
    <group>
      <SoccerPitch />
      <BasePlatform />

      {/* 4 Stands */}
      {standConfigs.map((cfg, i) => {
        const section = sections[i] || {
          id: `filler-${i}`,
          name: ['Main Stand', 'North Stand', 'West End', 'East End'][i],
          price: 0, totalCapacity: 0, availableCapacity: 0, color: '#6b7280',
        };
        return (
          <StadiumStand
            key={section.id}
            position={cfg.position}
            rotation={cfg.rotation}
            width={cfg.width}
            section={section}
            isSelected={selectedSection?.id === section.id}
            selectedSection={selectedSection}
            onSelect={() => onSectionSelect(section)}
            standType={cfg.standType}
          />
        );
      })}

      {/* Roofs */}
      {standConfigs.map((cfg, i) => (
        <RoofStructure
          key={`roof-${i}`}
          position={cfg.position}
          rotation={cfg.rotation}
          width={cfg.width}
          depth={cfg.depth}
          height={cfg.roofH}
          standType={cfg.standType}
        />
      ))}

      {/* Corner fills */}
      {[
        { position: [-cx + 0.5, 0, -cz + 0.5] as [number, number, number], rotationY: 0 },
        { position: [cx - 0.5, 0, -cz + 0.5] as [number, number, number], rotationY: Math.PI / 2 },
        { position: [cx - 0.5, 0, cz - 0.5] as [number, number, number], rotationY: Math.PI },
        { position: [-cx + 0.5, 0, cz - 0.5] as [number, number, number], rotationY: -Math.PI / 2 },
      ].map((c, i) => (
        <CornerSection key={`corner-${i}`} {...c} height={4} />
      ))}

      {/* Scoreboard */}
      <Scoreboard position={[0, 9.5, -(pitchH / 2 + gap + 5)]} rotation={0} />

      <SurroundingBuildings />
      <TeamBus position={[-14, 0, -12]} />
    </group>
  );
}

const Stadium3D: React.FC<Stadium3DProps> = ({ sections, selectedSection, onSectionSelect }) => {
  return (
    <div className="relative w-full h-[500px] md:h-[650px] rounded-xl overflow-hidden border border-border bg-background">
      <Canvas
        camera={{ position: [22, 16, 22], fov: 45 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <color attach="background" args={['#e8ecf0']} />
        <fog attach="fog" args={['#e8ecf0', 45, 75]} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 25, 15]} intensity={0.8} />
        <directionalLight position={[-15, 20, -10]} intensity={0.35} />
        <hemisphereLight args={['#b1e1ff', '#d4d4d4', 0.4]} />

        <StadiumModel
          sections={sections}
          selectedSection={selectedSection}
          onSectionSelect={onSectionSelect}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={15}
          maxDistance={55}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 2, 0]}
          autoRotate
          autoRotateSpeed={0.25}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg pointer-events-none">
        🖱️ Drag to rotate • Scroll to zoom • Click a stand to select
      </div>
    </div>
  );
};

export { type StadiumSection };
export default Stadium3D;
