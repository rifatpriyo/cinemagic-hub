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

/*
  High-detail stadium inspired by Stamford Bridge.
  4 rectangular stands (Main, Opposite, North End, South End),
  each with lower tier, executive boxes, upper tier, roof trusses,
  exterior facade. Plus corner fills, surrounding buildings, team bus.
*/
function StadiumModel({ sections, selectedSection, onSectionSelect }: Stadium3DProps) {
  // Map sections to the 4 stands + 1 corner/general
  // Expected: VIP Sideline → Main Stand, Club Level → Opposite, Lower Bowl → North End, Upper Bowl → South End, End Zone → corners
  const pitchW = 16;
  const pitchH = 10;
  const standGap = 0.8; // gap from pitch edge to stand

  const standConfigs = [
    {
      // Main Stand (West) - behind pitch, facing camera default
      position: [0, 0, -(pitchH / 2 + standGap)] as [number, number, number],
      rotation: 0,
      width: pitchW + 2,
      standType: 'main' as const,
    },
    {
      // Opposite Stand (East)
      position: [0, 0, pitchH / 2 + standGap] as [number, number, number],
      rotation: Math.PI,
      width: pitchW + 2,
      standType: 'opposite' as const,
    },
    {
      // North End
      position: [-(pitchW / 2 + standGap), 0, 0] as [number, number, number],
      rotation: Math.PI / 2,
      width: pitchH + 1,
      standType: 'end' as const,
    },
    {
      // South End
      position: [pitchW / 2 + standGap, 0, 0] as [number, number, number],
      rotation: -Math.PI / 2,
      width: pitchH + 1,
      standType: 'end' as const,
    },
  ];

  // Roof configs matching stands
  const roofConfigs = standConfigs.map((s) => ({
    position: s.position,
    rotation: s.rotation,
    width: s.width,
    depth: s.standType === 'end' ? 7.1 : 8.1,
    height: s.standType === 'end' ? 6.3 : 7.8,
    standType: s.standType,
  }));

  // Corner positions
  const cornerH = 5;
  const cx = pitchW / 2 + standGap;
  const cz = pitchH / 2 + standGap;
  const corners = [
    { position: [-cx, 0, -cz] as [number, number, number], rotationY: 0 },
    { position: [cx, 0, -cz] as [number, number, number], rotationY: Math.PI / 2 },
    { position: [cx, 0, cz] as [number, number, number], rotationY: Math.PI },
    { position: [-cx, 0, cz] as [number, number, number], rotationY: -Math.PI / 2 },
  ];

  return (
    <group>
      <SoccerPitch />
      <BasePlatform />

      {/* 4 Stands */}
      {standConfigs.map((cfg, i) => {
        const section = sections[i] || {
          id: `filler-${i}`,
          name: ['Main Stand', 'Opposite Stand', 'North End', 'South End'][i],
          price: 0,
          totalCapacity: 0,
          availableCapacity: 0,
          color: '#6b7280',
        };
        return (
          <StadiumStand
            key={section.id}
            {...cfg}
            section={section}
            isSelected={selectedSection?.id === section.id}
            selectedSection={selectedSection}
            onSelect={() => onSectionSelect(section)}
          />
        );
      })}

      {/* Roofs */}
      {roofConfigs.map((cfg, i) => (
        <RoofStructure key={`roof-${i}`} {...cfg} />
      ))}

      {/* Corner sections */}
      {corners.map((c, i) => (
        <CornerSection key={`corner-${i}`} {...c} height={cornerH} />
      ))}

      {/* Scoreboard on main stand roof */}
      <Scoreboard position={[0, 10, -(pitchH / 2 + standGap + 4)]} rotation={0} />

      {/* Surrounding buildings & trees */}
      <SurroundingBuildings />

      {/* Team bus */}
      <TeamBus position={[-14, 0, -12]} />
    </group>
  );
}

const Stadium3D: React.FC<Stadium3DProps> = ({ sections, selectedSection, onSectionSelect }) => {
  return (
    <div className="relative w-full h-[500px] md:h-[650px] rounded-xl overflow-hidden border border-border bg-background">
      <Canvas
        camera={{ position: [25, 18, 25], fov: 42 }}
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <color attach="background" args={['#e8ecf0']} />
        <fog attach="fog" args={['#e8ecf0', 40, 70]} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[20, 25, 15]} intensity={0.8} castShadow />
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
