import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface StadiumSection {
  id: string;
  name: string;
  price: number;
  totalCapacity: number;
  availableCapacity: number;
  color: string;
}

interface Stadium3DProps {
  sections: StadiumSection[];
  selectedSection: StadiumSection | null;
  onSectionSelect: (section: StadiumSection) => void;
}

// The football field
function Field() {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Main field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#2d8a4e" />
      </mesh>
      {/* Field lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.8, 1.9, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[0.08, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[15.2, 9.2]} />
        <meshStandardMaterial color="#2d8a4e" transparent opacity={0} />
      </mesh>
      {/* Field border lines */}
      {[[-7.5, 0], [7.5, 0]].map(([x], i) => (
        <mesh key={`vline-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, 0]}>
          <planeGeometry args={[0.08, 9.6]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {[[0, -4.8], [0, 4.8]].map(([_, z], i) => (
        <mesh key={`hline-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[15.08, 0.08]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Goal areas */}
      {[-1, 1].map((side, i) => (
        <group key={`goal-${i}`} position={[side * 6.5, 0.01, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 4]} />
            <meshStandardMaterial color="#2d8a4e" transparent opacity={0} />
          </mesh>
          {/* Penalty box outline */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[side * 1, 0, 0]}>
            <planeGeometry args={[0.06, 4]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
            <planeGeometry args={[2, 0.06]} />
            <meshStandardMaterial color="white" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 2]}>
            <planeGeometry args={[2, 0.06]} />
            <meshStandardMaterial color="white" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// A single stadium section (stands)
function StandSection({
  position,
  rotation,
  size,
  section,
  isSelected,
  isHovered,
  onClick,
  onHover,
  onUnhover,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  section: StadiumSection;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const isSoldOut = section.availableCapacity === 0;

  const color = useMemo(() => {
    if (isSoldOut) return '#6b7280';
    if (isSelected) return '#f59e0b';
    if (isHovered) return section.color;
    return section.color + 'cc';
  }, [isSoldOut, isSelected, isHovered, section.color]);

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); if (!isSoldOut) onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); if (!isSoldOut) { onHover(); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={(e) => { e.stopPropagation(); onUnhover(); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSoldOut ? 0.3 : isSelected ? 1 : 0.8}
          emissive={isSelected ? '#f59e0b' : isHovered ? section.color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.15 : 0}
        />
      </mesh>
      {/* Seat rows effect */}
      {Array.from({ length: Math.floor(size[1] * 3) }).map((_, i) => (
        <mesh key={i} position={[0, -size[1] / 2 + (i + 0.5) * (size[1] / Math.floor(size[1] * 3)), size[2] / 2 + 0.01]}>
          <planeGeometry args={[size[0] * 0.95, 0.05]} />
          <meshStandardMaterial color="#1a1a2e" transparent opacity={0.3} />
        </mesh>
      ))}
      {isHovered && !isSoldOut && (
        <Html position={[0, size[1] / 2 + 0.5, 0]} center>
          <div className="bg-card/95 backdrop-blur-sm border border-border px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-xl pointer-events-none">
            <div className="font-bold text-foreground">{section.name}</div>
            <div className="text-primary font-semibold">${section.price}</div>
            <div className="text-muted-foreground">{section.availableCapacity} available</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// The full stadium
function StadiumModel({ sections, selectedSection, onSectionSelect }: Stadium3DProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Map sections to positions around the stadium
  const sectionPositions: { position: [number, number, number]; rotation: [number, number, number]; size: [number, number, number] }[] = [
    // VIP Sideline - front left
    { position: [-9, 2, 0], rotation: [0, 0, Math.PI / 8], size: [1.5, 3.5, 10] },
    // Club Level - front right
    { position: [9, 2, 0], rotation: [0, 0, -Math.PI / 8], size: [1.5, 3.5, 10] },
    // Lower Bowl - back sides
    { position: [0, 1.5, -7], rotation: [Math.PI / 8, 0, 0], size: [16, 2.5, 1.5] },
    // Upper Bowl - top
    { position: [0, 4, -8.5], rotation: [Math.PI / 6, 0, 0], size: [18, 3, 1.5] },
    // End Zone - back
    { position: [0, 1.5, 7], rotation: [-Math.PI / 8, 0, 0], size: [16, 2.5, 1.5] },
  ];

  return (
    <group>
      <Field />
      {/* Stadium base/ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[30, 25]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {sections.map((section, i) => {
        if (i >= sectionPositions.length) return null;
        const pos = sectionPositions[i];
        return (
          <StandSection
            key={section.id}
            position={pos.position}
            rotation={pos.rotation}
            size={pos.size}
            section={section}
            isSelected={selectedSection?.id === section.id}
            isHovered={hoveredSection === section.id}
            onClick={() => onSectionSelect(section)}
            onHover={() => setHoveredSection(section.id)}
            onUnhover={() => setHoveredSection(null)}
          />
        );
      })}

      {/* Stadium lights */}
      {[[-10, 8, -8], [10, 8, -8], [-10, 8, 8], [10, 8, 8]].map((pos, i) => (
        <group key={`light-${i}`} position={pos as [number, number, number]}>
          <mesh>
            <boxGeometry args={[0.3, 8, 0.3]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          <pointLight position={[0, 4, 0]} intensity={0.5} distance={20} color="#fef3c7" />
        </group>
      ))}
    </group>
  );
}

const Stadium3D: React.FC<Stadium3DProps> = ({ sections, selectedSection, onSectionSelect }) => {
  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-border bg-background">
      <Canvas
        camera={{ position: [0, 18, 18], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 15, 10]} intensity={0.8} />
        <directionalLight position={[-10, 15, -10]} intensity={0.4} />

        <StadiumModel
          sections={sections}
          selectedSection={selectedSection}
          onSectionSelect={onSectionSelect}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={40}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg pointer-events-none">
        🖱️ Drag to rotate • Scroll to zoom • Click a section to select
      </div>
    </div>
  );
};

export default Stadium3D;
