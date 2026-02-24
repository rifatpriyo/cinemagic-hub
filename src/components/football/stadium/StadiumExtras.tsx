import React from 'react';
import * as THREE from 'three';

/* Surrounding buildings, base platform, corner fills, scoreboard */

export function BasePlatform() {
  return (
    <group>
      {/* Octagonal base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <cylinderGeometry args={[22, 23, 0.2, 8]} />
        <meshStandardMaterial color="#9ca3af" />
      </mesh>

      {/* Pavement ring around stadium */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[14, 20, 8]} />
        <meshStandardMaterial color="#d1d5db" side={THREE.DoubleSide} />
      </mesh>

      {/* Parking area / road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <ringGeometry args={[20, 22, 8]} />
        <meshStandardMaterial color="#6b7280" side={THREE.DoubleSide} />
      </mesh>

      {/* Road markings */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const r = 21;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[Math.cos(angle) * r, -0.04, Math.sin(angle) * r]}>
            <planeGeometry args={[0.8, 0.1]} />
            <meshStandardMaterial color="white" />
          </mesh>
        );
      })}
    </group>
  );
}

export function SurroundingBuildings() {
  const buildings = [
    // Right side cluster
    { pos: [14, 1.2, -3] as [number, number, number], size: [2.5, 2.4, 3] as [number, number, number], color: '#d4a574' },
    { pos: [16, 1.5, -3] as [number, number, number], size: [2, 3, 2.5] as [number, number, number], color: '#e5e7eb' },
    { pos: [14.5, 1, 0] as [number, number, number], size: [2, 2, 2.5] as [number, number, number], color: '#c4a882' },
    { pos: [16.5, 1.8, 0] as [number, number, number], size: [1.8, 3.6, 2] as [number, number, number], color: '#9ca3af' },
    { pos: [15, 0.8, 3] as [number, number, number], size: [2.5, 1.6, 2] as [number, number, number], color: '#d4a574' },
    { pos: [17, 1.2, 3] as [number, number, number], size: [1.5, 2.4, 2.5] as [number, number, number], color: '#b45309' },
    // Back cluster
    { pos: [5, 0.7, -14] as [number, number, number], size: [3, 1.4, 2] as [number, number, number], color: '#e5e7eb' },
    { pos: [-3, 0.9, -14] as [number, number, number], size: [2.5, 1.8, 2.5] as [number, number, number], color: '#d4a574' },
  ];

  return (
    <group>
      {buildings.map((b, i) => (
        <group key={i} position={b.pos}>
          {/* Building body */}
          <mesh position={[0, b.size[1] / 2, 0]}>
            <boxGeometry args={b.size} />
            <meshStandardMaterial color={b.color} />
          </mesh>
          {/* Roof */}
          <mesh position={[0, b.size[1] + 0.05, 0]}>
            <boxGeometry args={[b.size[0] + 0.1, 0.1, b.size[2] + 0.1]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
          {/* Windows */}
          {Array.from({ length: Math.floor(b.size[0] / 0.8) }).map((_, j) => (
            Array.from({ length: Math.floor(b.size[1] / 0.7) }).map((_, k) => (
              <mesh key={`w-${j}-${k}`} position={[
                -b.size[0] / 2 + 0.5 + j * 0.8,
                0.4 + k * 0.7,
                -b.size[2] / 2 - 0.01
              ]}>
                <planeGeometry args={[0.35, 0.4]} />
                <meshStandardMaterial color="#60a5fa" transparent opacity={0.5} />
              </mesh>
            ))
          ))}
        </group>
      ))}

      {/* Trees scattered around */}
      {[
        [12, 0, -7], [18, 0, -6], [13, 0, 6], [19, 0, 5],
        [-12, 0, -8], [-14, 0, 3], [10, 0, -12], [-8, 0, -13],
        [8, 0, 13], [-6, 0, 13], [-12, 0, 10], [15, 0, 8]
      ].map((pos, i) => (
        <Tree key={i} position={pos as [number, number, number]} />
      ))}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.6, 6]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

export function Scoreboard({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Support structure */}
      {[-1.2, 1.2].map((x, i) => (
        <mesh key={i} position={[x, -1.5, 0]}>
          <boxGeometry args={[0.15, 3, 0.15]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      ))}
      {/* Screen frame */}
      <mesh>
        <boxGeometry args={[3, 2, 0.2]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, -0.11]}>
        <planeGeometry args={[2.6, 1.6]} />
        <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* Corner section connecting two stands */
export function CornerSection({ position, rotationY, height }: {
  position: [number, number, number];
  rotationY: number;
  height: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Corner fill - curved seating */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[2.5, height, 2.5]} />
        <meshStandardMaterial color="#1e3a7b" transparent opacity={0.7} />
      </mesh>
      {/* Corner wall */}
      <mesh position={[0, height / 2, 1.3]}>
        <boxGeometry args={[2.7, height + 0.5, 0.3]} />
        <meshStandardMaterial color="#e5e7eb" />
      </mesh>
    </group>
  );
}

export function TeamBus({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Bus body */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[3, 0.7, 1]} />
        <meshStandardMaterial color="#1e3a7b" />
      </mesh>
      {/* Bus top */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[2.6, 0.4, 0.9]} />
        <meshStandardMaterial color="#1e3a7b" />
      </mesh>
      {/* Windows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-1.1 + i * 0.42, 0.75, -0.46]}>
          <planeGeometry args={[0.3, 0.25]} />
          <meshStandardMaterial color="#7dd3fc" transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Windshield */}
      <mesh position={[1.51, 0.65, 0]}>
        <planeGeometry args={[0.01, 0.5]} />
        <meshStandardMaterial color="#7dd3fc" transparent opacity={0.6} />
      </mesh>
      {/* Wheels */}
      {[[-0.8, 0], [0.8, 0]].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, 0.08, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[x, 0.08, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
