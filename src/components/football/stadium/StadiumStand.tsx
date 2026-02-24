import React, { useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export interface StadiumSection {
  id: string;
  name: string;
  price: number;
  totalCapacity: number;
  availableCapacity: number;
  color: string;
}

interface StandProps {
  position: [number, number, number];
  rotation: number; // Y rotation
  width: number;
  section: StadiumSection;
  isSelected: boolean;
  selectedSection: StadiumSection | null;
  onSelect: () => void;
  standType: 'main' | 'opposite' | 'end'; // affects height / tier count
}

/*
  Each stand has:
  - Lower tier (steep rake)
  - Walkway / executive boxes strip
  - Upper tier (steeper rake)
  - Exterior concrete facade
  - Blue seats with yellow accent stripes
*/
export function StadiumStand({
  position, rotation, width, section, isSelected, selectedSection, onSelect, standType
}: StandProps) {
  const [hovered, setHovered] = useState(false);
  const isSoldOut = section.availableCapacity === 0;

  const lowerRows = standType === 'end' ? 10 : 12;
  const upperRows = standType === 'end' ? 8 : 14;
  const lowerDepth = standType === 'end' ? 3.5 : 4;
  const upperDepth = standType === 'end' ? 3 : 3.5;
  const lowerHeight = standType === 'end' ? 2.5 : 3;
  const upperHeight = standType === 'end' ? 3 : 4;
  const walkwayHeight = 0.8;
  const walkwayDepth = 0.6;

  const baseColor = isSoldOut ? '#6b7280' : isSelected ? '#f59e0b' : hovered ? '#4a8cdb' : '#1e3a7b';
  const accentColor = '#d4a017';

  // Generate seat geometry for a tier
  const createTierGeometry = (rows: number, depth: number, height: number, yStart: number, startDepth: number) => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    const hw = width / 2;

    const seatColor = new THREE.Color(baseColor);
    const accentCol = new THREE.Color(accentColor);

    for (let r = 0; r <= rows; r++) {
      const t = r / rows;
      const z = startDepth + t * depth;
      const y = yStart + t * height;

      // Color: add yellow accent stripes every ~4 rows
      const isAccent = r > 0 && r < rows && (r % 4 === 0);
      const col = isAccent ? accentCol : seatColor;

      for (let s = 0; s <= 20; s++) {
        const st = s / 20;
        const x = -hw + st * width;

        positions.push(x, y, z);
        normals.push(0, 0.7, -0.7);
        colors.push(col.r, col.g, col.b);
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let s = 0; s < 20; s++) {
        const a = r * 21 + s;
        const b = a + 1;
        const c = a + 21;
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    return geo;
  };

  const lowerTierGeo = useMemo(() => createTierGeometry(lowerRows, lowerDepth, lowerHeight, 0.1, 0), [baseColor, lowerRows, lowerDepth, lowerHeight]);
  const upperTierGeo = useMemo(() => createTierGeometry(upperRows, upperDepth, upperHeight, lowerHeight + walkwayHeight + 0.1, lowerDepth + walkwayDepth), [baseColor, upperRows, upperDepth, upperHeight]);

  // Seat row lines for detail
  const seatLines = (rows: number, depth: number, height: number, yStart: number, startZ: number) => {
    return Array.from({ length: rows - 1 }).map((_, i) => {
      const t = (i + 1) / rows;
      const z = startZ + t * depth;
      const y = yStart + t * height;
      return { z, y };
    });
  };

  const lowerLines = useMemo(() => seatLines(lowerRows, lowerDepth, lowerHeight, 0.1, 0), [lowerRows, lowerDepth, lowerHeight]);
  const upperLines = useMemo(() => seatLines(upperRows, upperDepth, upperHeight, lowerHeight + walkwayHeight + 0.1, lowerDepth + walkwayDepth), [upperRows, upperDepth, upperHeight, lowerHeight, walkwayHeight, lowerDepth, walkwayDepth]);

  const hw = width / 2;
  const totalH = lowerHeight + walkwayHeight + upperHeight + 0.5;
  const totalD = lowerDepth + walkwayDepth + upperDepth;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Lower tier seats */}
      <mesh
        geometry={lowerTierGeo}
        onClick={(e) => { e.stopPropagation(); if (!isSoldOut) onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); if (!isSoldOut) { setHovered(true); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <meshStandardMaterial
          vertexColors
          transparent
          opacity={isSoldOut ? 0.3 : 0.9}
          emissive={isSelected ? '#f59e0b' : hovered ? '#3b82f6' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.15 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Seat row detail lines - lower */}
      {lowerLines.map(({ z, y }, i) => (
        <mesh key={`ll-${i}`} position={[0, y, z]}>
          <boxGeometry args={[width, 0.015, 0.02]} />
          <meshBasicMaterial color="#0a0a2e" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Walkway / executive boxes strip */}
      <mesh position={[0, lowerHeight + walkwayHeight / 2, lowerDepth + walkwayDepth / 2]}>
        <boxGeometry args={[width, walkwayHeight, walkwayDepth]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      {/* Box windows */}
      {Array.from({ length: Math.floor(width / 1.2) }).map((_, i) => (
        <mesh key={`bw-${i}`} position={[-hw + 0.6 + i * 1.2, lowerHeight + walkwayHeight / 2, lowerDepth - 0.01]}>
          <planeGeometry args={[0.8, 0.5]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* Upper tier seats */}
      <mesh
        geometry={upperTierGeo}
        onClick={(e) => { e.stopPropagation(); if (!isSoldOut) onSelect(); }}
        onPointerOver={(e) => { e.stopPropagation(); if (!isSoldOut) { setHovered(true); document.body.style.cursor = 'pointer'; } }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <meshStandardMaterial
          vertexColors
          transparent
          opacity={isSoldOut ? 0.3 : 0.9}
          emissive={isSelected ? '#f59e0b' : hovered ? '#3b82f6' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.15 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Seat row detail lines - upper */}
      {upperLines.map(({ z, y }, i) => (
        <mesh key={`ul-${i}`} position={[0, y, z]}>
          <boxGeometry args={[width, 0.015, 0.02]} />
          <meshBasicMaterial color="#0a0a2e" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* === EXTERIOR FACADE === */}
      {/* Back wall */}
      <mesh position={[0, totalH / 2, totalD]}>
        <boxGeometry args={[width + 0.4, totalH + 0.5, 0.4]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Facade panels with blue trim */}
      {Array.from({ length: Math.floor(width / 2.5) }).map((_, i) => (
        <group key={`fp-${i}`}>
          {/* Panel divider (blue vertical strip) */}
          <mesh position={[-hw + 1.25 + i * 2.5, totalH / 2, totalD + 0.21]}>
            <boxGeometry args={[0.08, totalH, 0.02]} />
            <meshStandardMaterial color="#1e3a7b" />
          </mesh>
          {/* Windows on facade */}
          {[0.3, 0.5, 0.7].map((ht, j) => (
            <mesh key={j} position={[-hw + 1.25 + i * 2.5, totalH * ht, totalD + 0.21]}>
              <planeGeometry args={[1.5, 0.6]} />
              <meshStandardMaterial color="#94a3b8" transparent opacity={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Blue trim line at top */}
      <mesh position={[0, totalH + 0.05, totalD]}>
        <boxGeometry args={[width + 0.6, 0.12, 0.5]} />
        <meshStandardMaterial color="#1e3a7b" />
      </mesh>

      {/* Side walls */}
      {[-hw - 0.1, hw + 0.1].map((x, i) => (
        <mesh key={`sw-${i}`} position={[x, totalH / 2, totalD / 2]}>
          <boxGeometry args={[0.3, totalH + 0.5, totalD + 0.5]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      ))}

      {/* Front wall (pitch side, below lower tier) */}
      <mesh position={[0, 0.15, -0.15]}>
        <boxGeometry args={[width + 0.2, 0.35, 0.3]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Advertising boards along pitch edge */}
      <mesh position={[0, 0.15, -0.32]}>
        <boxGeometry args={[width, 0.25, 0.04]} />
        <meshStandardMaterial color="#1e3a7b" />
      </mesh>

      {/* Hover tooltip */}
      {hovered && !isSoldOut && (
        <Html position={[0, totalH + 1.5, totalD / 2]} center>
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

export default StadiumStand;
