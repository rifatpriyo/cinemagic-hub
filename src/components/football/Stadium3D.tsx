import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Text } from '@react-three/drei';
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

/* ─── FIELD ─── */
function Field() {
  const yardLines = useMemo(() => {
    const lines: { x: number; label?: string }[] = [];
    // Every 5 yards from -50 to 50
    for (let yd = -50; yd <= 50; yd += 5) {
      const x = (yd / 50) * 7;
      const absYd = Math.abs(yd);
      const label = yd % 10 === 0 && absYd !== 0 && absYd !== 50 ? String(absYd > 50 ? 100 - absYd : absYd) : undefined;
      lines.push({ x, label });
    }
    return lines;
  }, []);

  // Hash marks
  const hashMarks = useMemo(() => {
    const marks: { x: number }[] = [];
    for (let yd = -49; yd <= 49; yd++) {
      marks.push({ x: (yd / 50) * 7 });
    }
    return marks;
  }, []);

  return (
    <group position={[0, 0.01, 0]}>
      {/* Main green field with end zones */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[18, 9.6]} />
        <meshStandardMaterial color="#2d8a4e" />
      </mesh>

      {/* End zones */}
      {[-1, 1].map((side, i) => (
        <mesh key={`endzone-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[side * 8, 0.005, 0]}>
          <planeGeometry args={[2, 9.6]} />
          <meshStandardMaterial color="#1a3a6e" />
        </mesh>
      ))}

      {/* End zone borders */}
      {[-1, 1].map((side, i) => (
        <mesh key={`ezborder-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[side * 7, 0.012, 0]}>
          <planeGeometry args={[0.1, 9.6]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}

      {/* Sidelines */}
      {[-4.8, 4.8].map((z, i) => (
        <mesh key={`sideline-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, z]}>
          <planeGeometry args={[18, 0.08]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}

      {/* Back of end zone lines */}
      {[-9, 9].map((x, i) => (
        <mesh key={`backline-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, 0]}>
          <planeGeometry args={[0.08, 9.6]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}

      {/* Yard lines */}
      {yardLines.map(({ x, label }, i) => (
        <group key={`yard-${i}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, 0]}>
            <planeGeometry args={[0.05, 9.6]} />
            <meshStandardMaterial color="white" />
          </mesh>
          {label && (
            <>
              <Text
                position={[x, 0.02, -3.2]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.55}
                color="white"
                anchorX="center"
                anchorY="middle"
                font={undefined}
              >
                {label}
              </Text>
              <Text
                position={[x, 0.02, 3.2]}
                rotation={[-Math.PI / 2, 0, Math.PI]}
                fontSize={0.55}
                color="white"
                anchorX="center"
                anchorY="middle"
                font={undefined}
              >
                {label}
              </Text>
            </>
          )}
        </group>
      ))}

      {/* Hash marks */}
      {hashMarks.map(({ x }, i) => (
        <group key={`hash-${i}`}>
          {[-1.5, 1.5].map((z, j) => (
            <mesh key={j} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, z]}>
              <planeGeometry args={[0.03, 0.25]} />
              <meshStandardMaterial color="white" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Center field circle / logo area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color="#1a3a6e" transparent opacity={0.5} />
      </mesh>

      {/* Goal posts */}
      {[-1, 1].map((side, i) => (
        <GoalPost key={`goal-${i}`} position={[side * 7, 0, 0]} rotation={side === -1 ? Math.PI : 0} />
      ))}
    </group>
  );
}

function GoalPost({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Main post */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 4, 8]} />
        <meshStandardMaterial color="#f5c542" />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 3.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 2.8, 8]} />
        <meshStandardMaterial color="#f5c542" />
      </mesh>
      {/* Uprights */}
      {[-1.4, 1.4].map((z, i) => (
        <mesh key={i} position={[0, 5, z]}>
          <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
          <meshStandardMaterial color="#f5c542" />
        </mesh>
      ))}
    </group>
  );
}

/* ─── CURVED SEATING TIER ─── */
function SeatTier({
  innerRadius,
  outerRadius,
  height,
  yOffset,
  tiltAngle,
  startAngle,
  endAngle,
  section,
  isSelected,
  isHovered,
  onClick,
  onHover,
  onUnhover,
}: {
  innerRadius: number;
  outerRadius: number;
  height: number;
  yOffset: number;
  tiltAngle: number;
  startAngle: number;
  endAngle: number;
  section: StadiumSection;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const isSoldOut = section.availableCapacity === 0;
  const segments = 48;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    const rows = 8;
    const rowDepth = (outerRadius - innerRadius) / rows;
    const rowHeight = height / rows;

    for (let r = 0; r <= rows; r++) {
      const radius = innerRadius + r * rowDepth;
      const y = yOffset + r * rowHeight;

      for (let s = 0; s <= segments; s++) {
        const angle = startAngle + (s / segments) * (endAngle - startAngle);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        positions.push(x, y, z);
        // Normal pointing roughly inward and up
        const nx = -Math.cos(angle) * Math.sin(tiltAngle);
        const ny = Math.cos(tiltAngle);
        const nz = -Math.sin(angle) * Math.sin(tiltAngle);
        normals.push(nx, ny, nz);
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let s = 0; s < segments; s++) {
        const a = r * (segments + 1) + s;
        const b = a + 1;
        const c = a + (segments + 1);
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);
    return geo;
  }, [innerRadius, outerRadius, height, yOffset, tiltAngle, startAngle, endAngle, segments]);

  const color = useMemo(() => {
    if (isSoldOut) return '#6b7280';
    if (isSelected) return '#f59e0b';
    if (isHovered) return section.color;
    return section.color;
  }, [isSoldOut, isSelected, isHovered, section.color]);

  // Seat rows visual (small boxes along the tier)
  const seatRows = useMemo(() => {
    const rows: { position: [number, number, number]; rotation: number }[] = [];
    const numRows = 6;
    const rowDepth = (outerRadius - innerRadius) / numRows;
    const rowHeight = height / numRows;

    for (let r = 0; r < numRows; r++) {
      const radius = innerRadius + (r + 0.5) * rowDepth;
      const y = yOffset + (r + 0.5) * rowHeight;
      const midAngle = (startAngle + endAngle) / 2;
      rows.push({
        position: [
          Math.cos(midAngle) * radius,
          y,
          Math.sin(midAngle) * radius
        ],
        rotation: midAngle
      });
    }
    return rows;
  }, [innerRadius, outerRadius, height, yOffset, startAngle, endAngle]);

  const labelPos = useMemo(() => {
    const midAngle = (startAngle + endAngle) / 2;
    const midRadius = (innerRadius + outerRadius) / 2;
    return [
      Math.cos(midAngle) * midRadius,
      yOffset + height + 0.8,
      Math.sin(midAngle) * midRadius
    ] as [number, number, number];
  }, [startAngle, endAngle, innerRadius, outerRadius, yOffset, height]);

  return (
    <group>
      <mesh
        geometry={geometry}
        onClick={(e) => { e.stopPropagation(); if (!isSoldOut) onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); if (!isSoldOut) { onHover(); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={(e) => { e.stopPropagation(); onUnhover(); document.body.style.cursor = 'auto'; }}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSoldOut ? 0.25 : isSelected ? 1 : 0.75}
          emissive={isSelected ? '#f59e0b' : isHovered ? section.color : '#000000'}
          emissiveIntensity={isSelected ? 0.4 : isHovered ? 0.2 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Seat detail lines */}
      {!isSoldOut && Array.from({ length: 5 }).map((_, i) => {
        const r = innerRadius + ((i + 1) / 6) * (outerRadius - innerRadius);
        const y = yOffset + ((i + 1) / 6) * height;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
            <ringGeometry args={[r - 0.02, r + 0.02, segments, 1, startAngle, endAngle - startAngle]} />
            <meshBasicMaterial color="#0a0a1e" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        );
      })}

      {isHovered && !isSoldOut && (
        <Html position={labelPos} center>
          <div className="bg-card/95 backdrop-blur-sm border border-border px-4 py-3 rounded-xl text-xs whitespace-nowrap shadow-2xl pointer-events-none">
            <div className="font-bold text-foreground text-sm">{section.name}</div>
            <div className="text-primary font-semibold text-base">${section.price}</div>
            <div className="text-muted-foreground">{section.availableCapacity} seats available</div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── STADIUM WALL ─── */
function StadiumWall({ innerRadius, outerRadius, height, yOffset, startAngle, endAngle, color }: {
  innerRadius: number;
  outerRadius: number;
  height: number;
  yOffset: number;
  startAngle: number;
  endAngle: number;
  color: string;
}) {
  const segments = 48;
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    for (let s = 0; s <= segments; s++) {
      const angle = startAngle + (s / segments) * (endAngle - startAngle);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Outer wall - bottom and top
      positions.push(cos * outerRadius, yOffset, sin * outerRadius);
      normals.push(cos, 0, sin);
      positions.push(cos * outerRadius, yOffset + height, sin * outerRadius);
      normals.push(cos, 0, sin);
    }

    for (let s = 0; s < segments; s++) {
      const a = s * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setIndex(indices);
    return geo;
  }, [innerRadius, outerRadius, height, yOffset, startAngle, endAngle, segments]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── JUMBOTRON ─── */
function Jumbotron() {
  return (
    <group position={[0, 9, 0]}>
      {/* Support pillars */}
      {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z], i) => (
        <mesh key={i} position={[x, -3, z]}>
          <cylinderGeometry args={[0.08, 0.08, 6, 8]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
      ))}
      {/* Screen frames - 4 sided */}
      {[
        { pos: [0, 0, -2.5] as [number, number, number], rot: [0, 0, 0] as [number, number, number] },
        { pos: [0, 0, 2.5] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number] },
        { pos: [-2.5, 0, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number] },
        { pos: [2.5, 0, 0] as [number, number, number], rot: [0, -Math.PI / 2, 0] as [number, number, number] },
      ].map(({ pos, rot }, i) => (
        <group key={i} position={pos} rotation={rot}>
          <mesh>
            <boxGeometry args={[4, 2.5, 0.2]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0, 0, -0.11]}>
            <planeGeometry args={[3.6, 2.1]} />
            <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      {/* Top cap */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[5.2, 0.3, 5.2]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}

/* ─── STADIUM LIGHTS ─── */
function StadiumLights() {
  const positions: [number, number, number][] = [
    [-14, 0, -10], [14, 0, -10],
    [-14, 0, 10], [14, 0, 10],
    [-10, 0, -14], [10, 0, -14],
    [-10, 0, 14], [10, 0, 14],
  ];

  return (
    <group>
      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Pole */}
          <mesh position={[0, 7, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 14, 8]} />
            <meshStandardMaterial color="#4b5563" />
          </mesh>
          {/* Light panel */}
          <mesh position={[0, 14.5, 0]}>
            <boxGeometry args={[1.2, 0.4, 0.8]} />
            <meshStandardMaterial color="#e5e7eb" emissive="#fef3c7" emissiveIntensity={0.5} />
          </mesh>
          <pointLight position={[0, 14, 0]} intensity={0.4} distance={25} color="#fef3c7" />
        </group>
      ))}
    </group>
  );
}

/* ─── STADIUM EXTERIOR RIM ─── */
function StadiumRim() {
  const segments = 64;
  return (
    <group>
      {/* Upper rim / facade */}
      <StadiumWall
        innerRadius={16}
        outerRadius={17}
        height={8}
        yOffset={0}
        startAngle={0}
        endAngle={Math.PI * 2}
        color="#d1d5db"
      />
      {/* Concourse level */}
      <StadiumWall
        innerRadius={15}
        outerRadius={16}
        height={2}
        yOffset={0}
        startAngle={0}
        endAngle={Math.PI * 2}
        color="#9ca3af"
      />
      {/* Top cap ring */}
      <mesh position={[0, 8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[16, 17.2, segments]} />
        <meshStandardMaterial color="#e5e7eb" side={THREE.DoubleSide} />
      </mesh>
      {/* Ground ring */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[12, 17, segments]} />
        <meshStandardMaterial color="#1f2937" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─── FULL STADIUM ─── */
function StadiumModel({ sections, selectedSection, onSectionSelect }: Stadium3DProps) {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  // Map sections to curved positions around the stadium bowl
  // 5 sections: VIP Sideline (left), Club Level (right), Lower Bowl (back), Upper Bowl (upper back), End Zone (front)
  const sectionConfigs = useMemo(() => [
    // VIP Sideline - left side
    { innerRadius: 8, outerRadius: 11, height: 3, yOffset: 0.5, tiltAngle: 0.4, startAngle: Math.PI * 0.6, endAngle: Math.PI * 0.9 },
    // Club Level - right side
    { innerRadius: 8, outerRadius: 11, height: 3, yOffset: 0.5, tiltAngle: 0.4, startAngle: Math.PI * 1.1, endAngle: Math.PI * 1.4 },
    // Lower Bowl - one end
    { innerRadius: 8, outerRadius: 12, height: 3, yOffset: 0.5, tiltAngle: 0.35, startAngle: Math.PI * 1.5, endAngle: Math.PI * 2.0 },
    // Upper Bowl - full wrap upper tier
    { innerRadius: 12, outerRadius: 15.5, height: 4.5, yOffset: 3.5, tiltAngle: 0.5, startAngle: Math.PI * 0.55, endAngle: Math.PI * 1.45 },
    // End Zone - other end
    { innerRadius: 8, outerRadius: 12, height: 3, yOffset: 0.5, tiltAngle: 0.35, startAngle: Math.PI * 0.0, endAngle: Math.PI * 0.5 },
  ], []);

  return (
    <group>
      <Field />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[25, 64]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* Stadium exterior */}
      <StadiumRim />

      {/* Seating sections */}
      {sections.map((section, i) => {
        if (i >= sectionConfigs.length) return null;
        const cfg = sectionConfigs[i];
        return (
          <SeatTier
            key={section.id}
            {...cfg}
            section={section}
            isSelected={selectedSection?.id === section.id}
            isHovered={hoveredSection === section.id}
            onClick={() => onSectionSelect(section)}
            onHover={() => setHoveredSection(section.id)}
            onUnhover={() => setHoveredSection(null)}
          />
        );
      })}

      {/* Fill remaining bowl areas with non-interactive seating */}
      <SeatTier
        innerRadius={8}
        outerRadius={11}
        height={3}
        yOffset={0.5}
        tiltAngle={0.4}
        startAngle={Math.PI * 0.9}
        endAngle={Math.PI * 1.1}
        section={{ id: 'filler-1', name: 'General', price: 0, totalCapacity: 0, availableCapacity: 0, color: '#6b7280' }}
        isSelected={false}
        isHovered={false}
        onClick={() => {}}
        onHover={() => {}}
        onUnhover={() => {}}
      />
      <SeatTier
        innerRadius={12}
        outerRadius={15.5}
        height={4.5}
        yOffset={3.5}
        tiltAngle={0.5}
        startAngle={Math.PI * 1.45}
        endAngle={Math.PI * 2.55}
        section={{ id: 'filler-2', name: 'Upper', price: 0, totalCapacity: 0, availableCapacity: 0, color: '#6b7280' }}
        isSelected={false}
        isHovered={false}
        onClick={() => {}}
        onHover={() => {}}
        onUnhover={() => {}}
      />

      <Jumbotron />
      <StadiumLights />
    </group>
  );
}

const Stadium3D: React.FC<Stadium3DProps> = ({ sections, selectedSection, onSectionSelect }) => {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden border border-border bg-background">
      <Canvas
        camera={{ position: [0, 22, 22], fov: 45 }}
        shadows
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#0a0a1e']} />
        <fog attach="fog" args={['#0a0a1e', 30, 55]} />

        <ambientLight intensity={0.3} />
        <directionalLight position={[15, 20, 10]} intensity={0.7} castShadow />
        <directionalLight position={[-15, 20, -10]} intensity={0.4} />
        <hemisphereLight args={['#b1e1ff', '#1a1a2e', 0.3]} />

        <StadiumModel
          sections={sections}
          selectedSection={selectedSection}
          onSectionSelect={onSectionSelect}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={12}
          maxDistance={45}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 2, 0]}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg pointer-events-none">
        🖱️ Drag to rotate • Scroll to zoom • Click a section to select
      </div>
    </div>
  );
};

export default Stadium3D;
