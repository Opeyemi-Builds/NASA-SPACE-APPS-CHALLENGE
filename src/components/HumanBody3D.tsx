import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { DayEvaluation, Status, Zone } from '../types';
import { INDICATORS } from '../data/indicators';

const ZONE_COLOR: Record<Status, string> = {
  Normal: '#16a34a',
  Watch: '#ca8a04',
  Alert: '#dc2626',
  Urgent: '#dc2626',
};

const ZONE_FILL: Record<Status, string> = {
  Normal: '#d7f5e1',
  Watch: '#fdf3c4',
  Alert: '#ffd7d7',
  Urgent: '#ffb4b4',
};

export interface BodyMarker {
  zone: Zone;
  title: string;
  sub: string;
  status: Status;
}

interface Props {
  zoneStatus: Record<Zone, Status>;
  selected: Zone | null;
  onSelect: (z: Zone) => void;
  markers?: BodyMarker[];
  height?: number;
}

const ANCHOR: Record<Zone, [number, number, number]> = {
  'Head and brain': [1.05, 2.45, 0],
  Eyes: [0.95, 2.1, 0.35],
  Heart: [-1.1, 1.4, 0.25],
  Lungs: [1.1, 1.5, 0.15],
  'Stomach and gut': [1.05, 0.7, 0.25],
  'Bones and muscles': [-1.15, 0.05, 0],
  'Whole body': [1.05, -0.45, 0],
};

function zoneMat(status: Status, highlight: boolean) {
  return {
    color: ZONE_FILL[status],
    emissive: ZONE_COLOR[status],
    emissiveIntensity: status === 'Normal' ? 0.12 : highlight ? 0.85 : 0.45,
    roughness: 0.45,
    metalness: 0.05,
  };
}

function Model({
  zoneStatus,
  selected,
  onSelect,
  markers,
  spinEnabled,
}: Omit<Props, 'height'> & { spinEnabled: boolean }) {
  const spin = useRef<THREE.Group>(null);
  const heart = useRef<THREE.Mesh>(null);
  const brain = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    t.current += dt;
    const hs = zoneStatus['Heart'];
    if (heart.current) {
      const beat = hs === 'Normal' ? 1 : 1 + Math.sin(t.current * (hs === 'Watch' ? 5 : 9)) * 0.12;
      heart.current.scale.setScalar(beat);
    }
    if (brain.current) {
      const alert = zoneStatus['Head and brain'];
      const pulse = alert === 'Normal' ? 1 : 1 + Math.sin(t.current * 6) * 0.08;
      brain.current.scale.setScalar(pulse);
    }
    if (spin.current && spinEnabled) spin.current.rotation.y += dt * 0.18;
  });

  const sel = (z: Zone) => ({
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelect(z);
    },
    onPointerOver: (e: { stopPropagation: () => void; nativeEvent: Event }) => {
      e.stopPropagation();
      (document.body.style as CSSStyleDeclaration).cursor = 'pointer';
    },
    onPointerOut: () => {
      document.body.style.cursor = 'auto';
    },
  });

  const ring = (z: Zone) => (selected === z ? 0.045 : 0.018);

  return (
    <group ref={spin}>
      {/* soft halo = whole-body status */}
      <mesh position={[0, 1, -0.25]}>
        <sphereGeometry args={[1.45, 32, 32]} />
        <meshStandardMaterial color={ZONE_FILL[zoneStatus['Whole body']]} transparent opacity={0.14} depthWrite={false} />
      </mesh>

      {/* HEAD + BRAIN */}
      <mesh position={[0, 2.1, 0]} {...sel('Head and brain')}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial {...zoneMat(zoneStatus['Head and brain'], selected === 'Head and brain')} />
      </mesh>
      <mesh ref={brain} position={[0, 2.12, 0.05]}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial
          color="#c4b5fd"
          emissive={zoneStatus['Head and brain'] === 'Normal' ? '#6d28d9' : ZONE_COLOR[zoneStatus['Head and brain']]}
          emissiveIntensity={zoneStatus['Head and brain'] === 'Normal' ? 0.35 : 0.9}
        />
      </mesh>
      {/* selection ring for head */}
      <mesh position={[0, 2.1, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.42, ring('Head and brain'), 12, 40]} />
        <meshBasicMaterial color={selected === 'Head and brain' ? '#4f46e5' : 'transparent'} transparent opacity={selected === 'Head and brain' ? 1 : 0} />
      </mesh>

      {/* EYES */}
      {(['left', 'right'] as const).map((side) => (
        <mesh key={side} position={[side === 'left' ? -0.11 : 0.11, 2.12, 0.28]} {...sel('Eyes')}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial {...zoneMat(zoneStatus['Eyes'], selected === 'Eyes')} />
        </mesh>
      ))}

      {/* NECK */}
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.11, 0.13, 0.18, 16]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>

      {/* TORSO base = whole body */}
      <mesh position={[0, 1.0, -0.08]} {...sel('Whole body')}>
        <capsuleGeometry args={[0.36, 0.85, 8, 24]} />
        <meshStandardMaterial {...zoneMat(zoneStatus['Whole body'], selected === 'Whole body')} transparent opacity={0.92} />
      </mesh>

      {/* HEART */}
      <mesh ref={heart} position={[-0.17, 1.22, 0.26]} {...sel('Heart')}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial {...zoneMat(zoneStatus['Heart'], selected === 'Heart')} />
      </mesh>

      {/* LUNGS */}
      {(['left', 'right'] as const).map((side) => (
        <mesh
          key={side}
          position={[side === 'left' ? -0.02 : 0.32, 1.28, 0.2]}
          scale={[1, 1.45, 0.8]}
          {...sel('Lungs')}
        >
          <sphereGeometry args={[0.13, 24, 24]} />
          <meshStandardMaterial {...zoneMat(zoneStatus['Lungs'], selected === 'Lungs')} />
        </mesh>
      ))}

      {/* STOMACH + GUT */}
      <mesh position={[0.05, 0.62, 0.24]} {...sel('Stomach and gut')}>
        <sphereGeometry args={[0.17, 24, 24]} />
        <meshStandardMaterial {...zoneMat(zoneStatus['Stomach and gut'], selected === 'Stomach and gut')} />
      </mesh>

      {/* ARMS = bones and muscles */}
      {(['left', 'right'] as const).map((side) => (
        <group key={side}>
          <mesh position={[side === 'left' ? -0.52 : 0.52, 1.15, 0]} rotation={[0, 0, side === 'left' ? 0.22 : -0.22]} {...sel('Bones and muscles')}>
            <capsuleGeometry args={[0.1, 0.62, 6, 16]} />
            <meshStandardMaterial {...zoneMat(zoneStatus['Bones and muscles'], selected === 'Bones and muscles')} />
          </mesh>
          <mesh position={[side === 'left' ? -0.62 : 0.62, 0.55, 0]} {...sel('Bones and muscles')}>
            <capsuleGeometry args={[0.085, 0.5, 6, 16]} />
            <meshStandardMaterial {...zoneMat(zoneStatus['Bones and muscles'], selected === 'Bones and muscles')} />
          </mesh>
        </group>
      ))}

      {/* PELVIS = whole body */}
      <mesh position={[0, 0.28, -0.05]} scale={[1.15, 0.8, 0.9]} {...sel('Whole body')}>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial {...zoneMat(zoneStatus['Whole body'], selected === 'Whole body')} />
      </mesh>

      {/* LEGS = bones and muscles */}
      {(['left', 'right'] as const).map((side) => (
        <mesh key={side} position={[side === 'left' ? -0.17 : 0.17, -0.45, 0]} {...sel('Bones and muscles')}>
          <capsuleGeometry args={[0.12, 0.85, 6, 16]} />
          <meshStandardMaterial {...zoneMat(zoneStatus['Bones and muscles'], selected === 'Bones and muscles')} />
        </mesh>
      ))}

      {/* ground disc */}
      <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.72, 48]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* danger markers */}
      {(markers ?? [])
        .filter((m) => m.status !== 'Normal')
        .map((m) => (
          <Html key={m.zone} position={ANCHOR[m.zone]} center distanceFactor={6} zIndexRange={[30, 0]}>
            <button
              onClick={() => onSelect(m.zone)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#ffffff',
                border: m.status === 'Alert' || m.status === 'Urgent' ? '2px solid #dc2626' : '2px solid #ca8a04',
                borderRadius: 12,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 800,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                boxShadow: '0 6px 20px rgb(15 23 42 / 0.18)',
                cursor: 'pointer',
                animation: m.status === 'Alert' || m.status === 'Urgent' ? 'hbBlink 1.4s infinite' : undefined,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: ZONE_COLOR[m.status],
                  display: 'inline-block',
                }}
              />
              <span>
                {m.title}
                <span style={{ display: 'block', fontWeight: 600, color: '#475569', fontSize: 11 }}>{m.sub}</span>
              </span>
            </button>
          </Html>
        ))}
    </group>
  );
}

/** Build one danger marker per troubled zone: "Sleep Alert · Mood Alert". */
export function buildMarkers(evaluation: DayEvaluation): BodyMarker[] {
  const items = new Map<Zone, string[]>();
  for (const ind of INDICATORS) {
    const r = evaluation.results[ind.id];
    if (!r || r.status === 'Normal') continue;
    const short = ind.name.replace(' (fasting)', '').replace(' (SpO₂)', '').replace('Body ', '');
    items.set(ind.zone, [...(items.get(ind.zone) ?? []), `${short} ${r.status}`]);
  }
  return [...items.entries()].map(([zone, list]) => ({
    zone,
    title: zone,
    sub: list.slice(0, 2).join(' · ') + (list.length > 2 ? ` +${list.length - 2}` : ''),
    status: evaluation.zoneStatus[zone],
  }));
}

export default function HumanBody3D({ zoneStatus, selected, onSelect, markers, height = 460 }: Props) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [spinOn, setSpinOn] = useState(true);
  const spinEnabled = spinOn && !prefersReduced;
  return (
    <div style={{ width: '100%', height }}>
      <style>{`@keyframes hbBlink { 50% { box-shadow: 0 0 0 6px rgb(220 38 38 / 0.15), 0 0 26px rgb(220 38 38 / 0.55); } }`}</style>
      <Canvas camera={{ position: [0, 1.1, 5.2], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 4]} intensity={1.4} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        <Suspense fallback={null}>
          <Model zoneStatus={zoneStatus} selected={selected} onSelect={onSelect} markers={markers} spinEnabled={spinEnabled} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={3}
          maxDistance={9}
          maxPolarAngle={Math.PI / 1.55}
          autoRotate={spinEnabled}
          autoRotateSpeed={0.9}
          target={[0, 0.9, 0]}
        />
      </Canvas>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 2 }}>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', margin: 0 }}>
          Drag to rotate · scroll to zoom · click a body part
        </p>
        <button
          onClick={() => setSpinOn((s) => !s)}
          aria-pressed={spinEnabled}
          style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 999, padding: '2px 10px', cursor: 'pointer' }}
        >
          {spinOn ? 'Pause spin' : 'Resume spin'}
        </button>
      </div>
    </div>
  );
}
