import React, { useMemo } from 'react';
import * as THREE from 'three';

/* Full soccer pitch with proper markings */
export function SoccerPitch() {
  const pitchW = 16; // width (touchline)
  const pitchH = 10; // height (goal line)

  return (
    <group position={[0, 0.01, 0]}>
      {/* Main grass - two-tone stripes */}
      {Array.from({ length: 10 }).map((_, i) => {
        const stripeW = pitchW / 10;
        return (
          <mesh key={`stripe-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 4.5) * stripeW, 0, 0]}>
            <planeGeometry args={[stripeW, pitchH]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#2d8a4e' : '#34a058'} />
          </mesh>
        );
      })}

      {/* Surrounding grass border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <planeGeometry args={[pitchW + 3, pitchH + 2]} />
        <meshStandardMaterial color="#267a3e" />
      </mesh>

      {/* === LINE MARKINGS === */}
      {/* Touchlines (long sides) */}
      {[-pitchH / 2, pitchH / 2].map((z, i) => (
        <mesh key={`touch-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, z]}>
          <planeGeometry args={[pitchW, 0.06]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}

      {/* Goal lines (short sides) */}
      {[-pitchW / 2, pitchW / 2].map((x, i) => (
        <mesh key={`goal-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, 0]}>
          <planeGeometry args={[0.06, pitchH]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}

      {/* Halfway line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <planeGeometry args={[0.06, pitchH]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0]}>
        <ringGeometry args={[1.35, 1.41, 64]} />
        <meshStandardMaterial color="white" side={THREE.DoubleSide} />
      </mesh>

      {/* Center spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Penalty areas (both ends) */}
      {[-1, 1].map((side) => {
        const x = side * pitchW / 2;
        const paW = 2.5; // penalty area depth
        const paH = 6;   // penalty area width
        const gaW = 0.9; // goal area depth
        const gaH = 2.8; // goal area width

        return (
          <group key={`pa-${side}`}>
            {/* Penalty area outline */}
            {/* Front line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x - side * paW, 0.012, 0]}>
              <planeGeometry args={[0.06, paH]} />
              <meshStandardMaterial color="white" />
            </mesh>
            {/* Side lines */}
            {[-paH / 2, paH / 2].map((z, i) => (
              <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x - side * paW / 2, 0.012, z]}>
                <planeGeometry args={[paW, 0.06]} />
                <meshStandardMaterial color="white" />
              </mesh>
            ))}

            {/* Goal area outline */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x - side * gaW, 0.012, 0]}>
              <planeGeometry args={[0.06, gaH]} />
              <meshStandardMaterial color="white" />
            </mesh>
            {[-gaH / 2, gaH / 2].map((z, i) => (
              <mesh key={`ga-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x - side * gaW / 2, 0.012, z]}>
                <planeGeometry args={[gaW, 0.06]} />
                <meshStandardMaterial color="white" />
              </mesh>
            ))}

            {/* Penalty spot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x - side * 1.8, 0.013, 0]}>
              <circleGeometry args={[0.06, 16]} />
              <meshStandardMaterial color="white" />
            </mesh>

            {/* Penalty arc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x - side * 1.8, 0.013, 0]}>
              <ringGeometry args={[1.35, 1.41, 32, 1, side === 1 ? Math.PI * 0.62 : -Math.PI * 0.38, Math.PI * 0.76]} />
              <meshStandardMaterial color="white" side={THREE.DoubleSide} />
            </mesh>

            {/* Goal net frame */}
            <Goal position={[x + side * 0.15, 0, 0]} side={side} />
          </group>
        );
      })}

      {/* Corner arcs */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={`corner-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[sx * pitchW / 2, 0.013, sz * pitchH / 2]}>
          <ringGeometry args={[0.22, 0.28, 16, 1,
            sx === -1 && sz === -1 ? 0 :
            sx === 1 && sz === -1 ? Math.PI / 2 :
            sx === 1 && sz === 1 ? Math.PI :
            Math.PI * 1.5,
            Math.PI / 2
          ]} />
          <meshStandardMaterial color="white" side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function Goal({ position, side }: { position: [number, number, number]; side: number }) {
  const postH = 0.36;
  const goalW = 1.1;
  const goalD = 0.4;

  return (
    <group position={position}>
      {/* Posts */}
      {[-goalW / 2, goalW / 2].map((z, i) => (
        <mesh key={i} position={[0, postH / 2, z]}>
          <cylinderGeometry args={[0.02, 0.02, postH, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
      {/* Crossbar */}
      <mesh position={[0, postH, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, goalW, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Net - back */}
      <mesh position={[side * goalD / 2, postH / 2, 0]}>
        <planeGeometry args={[goalD, postH]} />
        <meshStandardMaterial color="white" transparent opacity={0.15} side={THREE.DoubleSide} wireframe />
      </mesh>
      {/* Net - sides */}
      {[-goalW / 2, goalW / 2].map((z, i) => (
        <mesh key={`ns-${i}`} position={[side * goalD / 2, postH / 2, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[goalD, postH]} />
          <meshStandardMaterial color="white" transparent opacity={0.12} side={THREE.DoubleSide} wireframe />
        </mesh>
      ))}
      {/* Net - top */}
      <mesh position={[side * goalD / 2, postH, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[goalD, goalW]} />
        <meshStandardMaterial color="white" transparent opacity={0.1} side={THREE.DoubleSide} wireframe />
      </mesh>
    </group>
  );
}

export default SoccerPitch;
