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
  rotation: number;
  width: number;
  section: StadiumSection;
  isSelected: boolean;
  selectedSection: StadiumSection | null;
  onSelect: () => void;
  standType: 'main' | 'opposite' | 'end';
}

/*
  Each stand: lower tier, executive walkway, upper tier, exterior wall.
  All geometry is simple box-based to avoid z-fighting and jagged edges.
*/
export function StadiumStand({
  position, rotation, width, section, isSelected, selectedSection, onSelect, standType
}: StandProps) {
  const [hovered, setHovered] = useState(false);
  const isSoldOut = section.availableCapacity === 0;

  const lowerRows = standType === 'end' ? 8 : 10;
  const upperRows = standType === 'end' ? 6 : 10;
  const lowerDepth = standType === 'end' ? 3 : 3.5;
  const upperDepth = standType === 'end' ? 2.5 : 3;
  const lowerHeight = standType === 'end' ? 2 : 2.5;
  const upperHeight = standType === 'end' ? 2.5 : 3.5;
  const walkwayH = 0.7;
  const walkwayD = 0.5;

  const baseColor = isSoldOut ? '#6b7280' : isSelected ? '#f59e0b' : hovered ? '#4a8cdb' : '#1e3a7b';
  const emissiveColor = isSelected ? '#f59e0b' : hovered ? '#3b82f6' : '#000000';
  const emissiveIntensity = isSelected ? 0.3 : hovered ? 0.15 : 0;
  const opacity = isSoldOut ? 0.3 : 0.92;

  const hw = width / 2;
  const totalH = lowerHeight + walkwayH + upperHeight;
  const totalD = lowerDepth + walkwayD + upperDepth;

  const handleClick = (e: any) => { e.stopPropagation(); if (!isSoldOut) onSelect(); };
  const handleOver = (e: any) => { e.stopPropagation(); if (!isSoldOut) { setHovered(true); document.body.style.cursor = 'pointer'; } };
  const handleOut = (e: any) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; };

  return (
    <group position={position} rotation={[0, rotation, 0]}>

      {/* ── LOWER TIER ── */}
      {/* Stepped rows using individual boxes for clean look */}
      {Array.from({ length: lowerRows }).map((_, r) => {
        const t = r / lowerRows;
        const rowZ = t * lowerDepth;
        const rowY = t * lowerHeight;
        const rowH = lowerHeight / lowerRows;
        const rowD = lowerDepth / lowerRows;
        const isAccent = r % 4 === 0 && r > 0;
        return (
          <mesh
            key={`lr-${r}`}
            position={[0, rowY + rowH / 2, rowZ + rowD / 2]}
            onClick={handleClick}
            onPointerOver={handleOver}
            onPointerOut={handleOut}
          >
            <boxGeometry args={[width, rowH * 0.85, rowD * 0.9]} />
            <meshStandardMaterial
              color={isAccent ? '#d4a017' : baseColor}
              transparent opacity={opacity}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );
      })}

      {/* ── EXECUTIVE WALKWAY ── */}
      <mesh position={[0, lowerHeight + walkwayH / 2, lowerDepth + walkwayD / 2]}>
        <boxGeometry args={[width, walkwayH, walkwayD]} />
        <meshStandardMaterial color="#d1d5db" />
      </mesh>
      {/* Box windows */}
      {Array.from({ length: Math.floor(width / 1.4) }).map((_, i) => (
        <mesh key={`bw-${i}`} position={[-hw + 0.7 + i * 1.4, lowerHeight + walkwayH / 2, lowerDepth - 0.01]}>
          <planeGeometry args={[0.9, 0.45]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* ── UPPER TIER ── */}
      {Array.from({ length: upperRows }).map((_, r) => {
        const t = r / upperRows;
        const startZ = lowerDepth + walkwayD;
        const startY = lowerHeight + walkwayH;
        const rowZ = startZ + t * upperDepth;
        const rowY = startY + t * upperHeight;
        const rowH = upperHeight / upperRows;
        const rowD = upperDepth / upperRows;
        const isAccent = r % 4 === 0 && r > 0;
        return (
          <mesh
            key={`ur-${r}`}
            position={[0, rowY + rowH / 2, rowZ + rowD / 2]}
            onClick={handleClick}
            onPointerOver={handleOver}
            onPointerOut={handleOut}
          >
            <boxGeometry args={[width, rowH * 0.85, rowD * 0.9]} />
            <meshStandardMaterial
              color={isAccent ? '#d4a017' : baseColor}
              transparent opacity={opacity}
              emissive={emissiveColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );
      })}

      {/* ── EXTERIOR BACK WALL ── */}
      <mesh position={[0, totalH / 2, totalD + 0.2]}>
        <boxGeometry args={[width + 0.4, totalH + 0.4, 0.4]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Facade blue vertical dividers */}
      {Array.from({ length: Math.floor(width / 2.8) }).map((_, i) => (
        <mesh key={`fd-${i}`} position={[-hw + 1.4 + i * 2.8, totalH / 2, totalD + 0.42]}>
          <boxGeometry args={[0.08, totalH, 0.04]} />
          <meshStandardMaterial color="#1e3a7b" />
        </mesh>
      ))}

      {/* Blue trim at top */}
      <mesh position={[0, totalH + 0.1, totalD + 0.2]}>
        <boxGeometry args={[width + 0.6, 0.15, 0.5]} />
        <meshStandardMaterial color="#1e3a7b" />
      </mesh>

      {/* Side walls */}
      {[-1, 1].map((side, i) => (
        <mesh key={`sw-${i}`} position={[side * (hw + 0.15), totalH / 2, totalD / 2]}>
          <boxGeometry args={[0.3, totalH + 0.4, totalD + 0.5]} />
          <meshStandardMaterial color="#d1d5db" />
        </mesh>
      ))}

      {/* Front wall (pitch side) */}
      <mesh position={[0, 0.12, -0.1]}>
        <boxGeometry args={[width + 0.2, 0.3, 0.2]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>

      {/* Advertising board */}
      <mesh position={[0, 0.12, -0.22]}>
        <boxGeometry args={[width, 0.2, 0.04]} />
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
