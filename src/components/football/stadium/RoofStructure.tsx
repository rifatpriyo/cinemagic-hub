import React from 'react';
import * as THREE from 'three';

interface RoofProps {
  position: [number, number, number];
  rotation: number;
  width: number;
  depth: number;
  height: number;
  standType: 'main' | 'opposite' | 'end';
}

/*
  Clean roof canopy using simple box beams.
  No quaternion math — just positioned/rotated boxes.
*/
export function RoofStructure({ position, rotation, width, depth, height, standType }: RoofProps) {
  const hw = width / 2;
  const trussCount = Math.floor(width / 2.5);
  const trussSpacing = width / trussCount;
  const overhang = standType === 'main' ? 4.5 : standType === 'opposite' ? 4 : 3;
  const roofRise = 1.5;

  const steelLight = '#94a3b8';
  const steelDark = '#64748b';

  // Roof slope: from (back, height+roofRise) to (front, height)
  const roofLen = Math.sqrt(overhang * overhang + (depth + overhang) ** 2 * 0 + roofRise * roofRise);
  // We approximate the slope with a single tilted plane
  const slopeAngle = Math.atan2(roofRise, depth + overhang);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Vertical support columns at the back */}
      {Array.from({ length: trussCount + 1 }).map((_, i) => {
        const x = -hw + i * trussSpacing;
        return (
          <mesh key={`col-${i}`} position={[x, height / 2, depth + 0.3]}>
            <boxGeometry args={[0.1, height + roofRise, 0.1]} />
            <meshStandardMaterial color={steelDark} />
          </mesh>
        );
      })}

      {/* Main horizontal beam at top-back */}
      <mesh position={[0, height + roofRise, depth + 0.3]}>
        <boxGeometry args={[width + 0.2, 0.12, 0.12]} />
        <meshStandardMaterial color={steelLight} />
      </mesh>

      {/* Front horizontal beam */}
      <mesh position={[0, height, -overhang * 0.3]}>
        <boxGeometry args={[width + 0.2, 0.1, 0.1]} />
        <meshStandardMaterial color={steelLight} />
      </mesh>

      {/* Angled truss rafters (individual per truss) */}
      {Array.from({ length: trussCount + 1 }).map((_, i) => {
        const x = -hw + i * trussSpacing;
        const backZ = depth + 0.3;
        const frontZ = -overhang * 0.3;
        const spanZ = backZ - frontZ;
        const spanY = roofRise;
        const len = Math.sqrt(spanZ * spanZ + spanY * spanY);
        const angle = Math.atan2(spanY, spanZ);

        return (
          <group key={`rafter-${i}`}>
            {/* Top rafter */}
            <mesh
              position={[x, height + roofRise / 2, (backZ + frontZ) / 2]}
              rotation={[angle, 0, 0]}
            >
              <boxGeometry args={[0.06, 0.06, len]} />
              <meshStandardMaterial color={steelLight} />
            </mesh>
            {/* Bottom chord */}
            <mesh
              position={[x, height - 0.15 + roofRise / 2 * 0.7, (backZ + frontZ) / 2]}
              rotation={[angle * 0.7, 0, 0]}
            >
              <boxGeometry args={[0.05, 0.05, len * 0.9]} />
              <meshStandardMaterial color={steelDark} />
            </mesh>
            {/* Vertical web members */}
            {[0.25, 0.5, 0.75].map((t, j) => {
              const z = frontZ + t * spanZ;
              const y = height + t * spanY;
              return (
                <mesh key={j} position={[x, y - 0.2, z]}>
                  <boxGeometry args={[0.04, 0.4, 0.04]} />
                  <meshStandardMaterial color={steelDark} />
                </mesh>
              );
            })}
          </group>
        );
      })}

      {/* Cross bracing (horizontal purlins) */}
      {[0.2, 0.4, 0.6, 0.8].map((t, i) => {
        const backZ = depth + 0.3;
        const frontZ = -overhang * 0.3;
        const z = frontZ + t * (backZ - frontZ);
        const y = height + t * roofRise;
        return (
          <mesh key={`purlin-${i}`} position={[0, y, z]}>
            <boxGeometry args={[width, 0.04, 0.04]} />
            <meshStandardMaterial color={steelLight} />
          </mesh>
        );
      })}

      {/* Translucent roof panel */}
      <mesh
        position={[0, height + roofRise / 2 + 0.05, (depth + 0.3 - overhang * 0.3) / 2]}
        rotation={[Math.atan2(roofRise, depth + 0.3 + overhang * 0.3), 0, 0]}
      >
        <planeGeometry args={[width, Math.sqrt((depth + 0.3 + overhang * 0.3) ** 2 + roofRise ** 2)]} />
        <meshStandardMaterial
          color="#c7d8e8"
          transparent opacity={0.3}
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.5}
        />
      </mesh>

      {/* Front fascia */}
      <mesh position={[0, height - 0.05, -overhang * 0.3]}>
        <boxGeometry args={[width + 0.3, 0.15, 0.08]} />
        <meshStandardMaterial color="#1e3a7b" />
      </mesh>

      {/* Floodlight strip */}
      <mesh position={[0, height - 0.15, -overhang * 0.2]}>
        <boxGeometry args={[width * 0.7, 0.08, 0.12]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.5} />
      </mesh>
      <pointLight position={[0, height - 0.2, -overhang * 0.15]} intensity={0.4} distance={18} color="#fef3c7" />
    </group>
  );
}

export default RoofStructure;
