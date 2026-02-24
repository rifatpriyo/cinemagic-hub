import React from 'react';
import * as THREE from 'three';

interface RoofProps {
  position: [number, number, number];
  rotation: number;
  width: number;
  depth: number;
  height: number; // height at which the roof starts
  standType: 'main' | 'opposite' | 'end';
}

/*
  Steel truss roof canopy - triangular trusses with translucent panels
  Inspired by Stamford Bridge's distinctive roof structures
*/
export function RoofStructure({ position, rotation, width, depth, height, standType }: RoofProps) {
  const trussCount = Math.floor(width / 2.2);
  const trussSpacing = width / trussCount;
  const hw = width / 2;
  const canopyOverhang = standType === 'main' ? 5 : standType === 'opposite' ? 4.5 : 3.5;
  const canopyRise = 1.8;
  const steelColor = '#94a3b8';
  const steelDark = '#64748b';

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Triangular trusses */}
      {Array.from({ length: trussCount + 1 }).map((_, i) => {
        const x = -hw + i * trussSpacing;
        return (
          <group key={`truss-${i}`} position={[x, 0, 0]}>
            {/* Back vertical support */}
            <mesh position={[0, height / 2, depth + 0.3]}>
              <boxGeometry args={[0.08, height + canopyRise, 0.08]} />
              <meshStandardMaterial color={steelDark} />
            </mesh>

            {/* Top chord (angled from back-top to front-overhang) */}
            <TrussBeam
              from={[0, height + canopyRise, depth + 0.3]}
              to={[0, height + 0.3, -canopyOverhang * 0.3]}
              thickness={0.06}
              color={steelColor}
            />

            {/* Bottom chord */}
            <TrussBeam
              from={[0, height, depth + 0.3]}
              to={[0, height - 0.2, -canopyOverhang * 0.2]}
              thickness={0.05}
              color={steelColor}
            />

            {/* Diagonal braces */}
            {Array.from({ length: 4 }).map((_, j) => {
              const t1 = j / 4;
              const t2 = (j + 1) / 4;
              const topZ1 = depth + 0.3 - t1 * (depth + 0.3 + canopyOverhang * 0.3);
              const topZ2 = depth + 0.3 - t2 * (depth + 0.3 + canopyOverhang * 0.3);
              const topY1 = height + canopyRise - t1 * canopyRise;
              const botY = height - t2 * 0.2;
              return (
                <TrussBeam
                  key={j}
                  from={[0, topY1, topZ1]}
                  to={[0, botY, topZ2]}
                  thickness={0.03}
                  color={steelDark}
                />
              );
            })}
          </group>
        );
      })}

      {/* Horizontal connecting beams (purlins) */}
      {[0, 0.33, 0.66, 1].map((t, i) => {
        const z = depth + 0.3 - t * (depth + 0.3 + canopyOverhang * 0.3);
        const y = height + canopyRise - t * (canopyRise - 0.3);
        return (
          <mesh key={`purlin-${i}`} position={[0, y, z]}>
            <boxGeometry args={[width, 0.04, 0.04]} />
            <meshStandardMaterial color={steelColor} />
          </mesh>
        );
      })}

      {/* Translucent roof panels */}
      <RoofPanel
        width={width}
        fromZ={depth + 0.3}
        toZ={-canopyOverhang * 0.25}
        fromY={height + canopyRise}
        toY={height + 0.35}
      />

      {/* Fascia board (front edge of roof) */}
      <mesh position={[0, height + 0.35, -canopyOverhang * 0.25]}>
        <boxGeometry args={[width + 0.3, 0.15, 0.06]} />
        <meshStandardMaterial color="#1e3a7b" />
      </mesh>

      {/* Floodlight strip under roof */}
      <mesh position={[0, height + 0.2, -canopyOverhang * 0.15]}>
        <boxGeometry args={[width * 0.8, 0.08, 0.15]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={0.4} />
      </mesh>
      <pointLight position={[0, height, -canopyOverhang * 0.1]} intensity={0.5} distance={20} color="#fef3c7" />
    </group>
  );
}

/* A beam between two 3D points */
function TrussBeam({ from, to, thickness, color }: {
  from: [number, number, number];
  to: [number, number, number];
  thickness: number;
  color: string;
}) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const dir = end.clone().sub(start);
  const len = dir.length();

  // Compute rotation quaternion
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  const euler = new THREE.Euler().setFromQuaternion(quat);

  return (
    <mesh position={[mid.x, mid.y, mid.z]} rotation={euler}>
      <boxGeometry args={[thickness, len, thickness]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function RoofPanel({ width, fromZ, toZ, fromY, toY }: {
  width: number;
  fromZ: number;
  toZ: number;
  fromY: number;
  toY: number;
}) {
  const hw = width / 2;
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array([
    -hw, fromY, fromZ,
    hw, fromY, fromZ,
    hw, toY, toZ,
    -hw, toY, toZ,
  ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  const normals = new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]);
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geo.setIndex(new THREE.BufferAttribute(indices, 1));

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        color="#c7d8e8"
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

export default RoofStructure;
