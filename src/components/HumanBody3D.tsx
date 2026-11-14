import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import type { DayEvaluation, Status, Zone } from '../types';
import { INDICATORS as INDICATORS_SRC } from '../data/indicators';

const MODEL_URL = `${import.meta.env.BASE_URL}models/human.glb`;

const ZONE_COLOR: Record<Status, string> = {
  Normal: '#22c55e',
  Watch: '#eab308',
  Alert: '#ef4444',
  Urgent: '#ef4444',
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

const ZONES: Zone[] = ['Head and brain', 'Eyes', 'Heart', 'Lungs', 'Stomach and gut', 'Bones and muscles', 'Whole body'];

const ZONE_SHORT: Record<Zone, string> = {
  'Head and brain': 'Head',
  Eyes: 'Eyes',
  Heart: 'Heart',
  Lungs: 'Lungs',
  'Stomach and gut': 'Gut',
  'Bones and muscles': 'Limbs',
  'Whole body': 'Body',
};

/** Anatomical anchor points in model space (metres, origin at feet). */
const ANCHOR: Record<Zone, [number, number, number]> = {
  'Head and brain': [0, 1.62, 0.02],
  Eyes: [0, 1.585, 0.12],
  Heart: [-0.09, 1.3, 0.13],
  Lungs: [0.03, 1.33, 0.1],
  'Stomach and gut': [0.02, 1.08, 0.12],
  'Bones and muscles': [-0.15, 0.62, 0.04],
  'Whole body': [0, 1.0, 0.16],
};

/** Translucent highlight shells shown on troubled / selected zones. */
const SHELLS: Partial<Record<Zone, Array<{ pos: [number, number, number]; scale: [number, number, number] }>>> = {
  'Head and brain': [{ pos: [0, 1.62, 0.02], scale: [0.13, 0.15, 0.13] }],
  Eyes: [{ pos: [0, 1.585, 0.12], scale: [0.075, 0.05, 0.06] }],
  Heart: [{ pos: [-0.09, 1.3, 0.13], scale: [0.08, 0.095, 0.08] }],
  Lungs: [{ pos: [0.03, 1.33, 0.1], scale: [0.17, 0.14, 0.11] }],
  'Stomach and gut': [{ pos: [0.02, 1.08, 0.12], scale: [0.115, 0.105, 0.095] }],
  'Bones and muscles': [
    { pos: [-0.31, 1.12, 0.02], scale: [0.075, 0.17, 0.075] },
    { pos: [0.31, 1.12, 0.02], scale: [0.075, 0.17, 0.075] },
    { pos: [-0.13, 0.55, 0.02], scale: [0.095, 0.23, 0.095] },
    { pos: [0.13, 0.55, 0.02], scale: [0.095, 0.23, 0.095] },
  ],
};

type View = 'front' | 'side' | 'back';

const AZIMUTH: Record<View, number> = { front: 0, side: Math.PI / 2, back: Math.PI };

/** Build one danger marker per troubled zone: "Sleep Alert · Mood Alert". */
export function buildMarkers(evaluation: DayEvaluation): BodyMarker[] {
  const items = new Map<Zone, string[]>();
  for (const ind of INDICATORS_LITE) {
    const r = evaluation.results[ind.id];
    if (!r || r.status === 'Normal') continue;
    items.set(ind.zone, [...(items.get(ind.zone) ?? []), `${ind.short} ${r.status}`]);
  }
  return [...items.entries()].map(([zone, list]) => ({
    zone,
    title: zone,
    sub: list.slice(0, 2).join(' · ') + (list.length > 2 ? ` +${list.length - 2}` : ''),
    status: evaluation.zoneStatus[zone],
  }));
}

// zone + short label per indicator for marker tooltips
const INDICATORS_LITE = INDICATORS_SRC.map((i) => ({
  id: i.id,
  zone: i.zone,
  short: i.name.replace(' (fasting)', '').replace(' (SpO₂)', '').replace('Body ', '').replace('Blood ', ''),
}));

class BodyErrorBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(prev: { children: ReactNode }) {
    if (prev.children !== this.props.children && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm font-bold text-slate-200">3D model failed to load</p>
          <p className="max-w-xs text-xs text-slate-400">Check your connection and try again. All health data below still works.</p>
          <button
            onClick={this.props.onRetry}
            className="min-h-[44px] rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-5 py-2 text-sm font-bold text-cyan-100"
          >
            Retry 3D view
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Loader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <Html center zIndexRange={[40, 0]}>
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-cyan-300/20 bg-[#0a1330]/90 px-6 py-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300" />
        <p className="text-xs font-bold text-cyan-100">Loading astronaut… {Math.round(progress)}%</p>
      </div>
    </Html>
  );
}

/** Dress the stock model in the translucent medical material. */
function useMedicalDressing(scene: THREE.Group) {
  const mats = useMemo(() => {
    const skin = new THREE.MeshPhysicalMaterial({
      color: '#2fb9e8',
      emissive: '#0b5d86',
      emissiveIntensity: 0.35,
      roughness: 0.28,
      metalness: 0.05,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const joint = new THREE.MeshStandardMaterial({
      color: '#12395c',
      emissive: '#0e7490',
      emissiveIntensity: 0.4,
      roughness: 0.5,
      transparent: true,
      opacity: 0.85,
    });
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.Material & { name?: string };
      mesh.material = mat?.name === 'Beta_Joints_MAT' ? joint : skin;
      mesh.renderOrder = 1;
    });
    return [skin, joint];
  }, [scene]);
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);
}

function Astronaut({ zoneStatus, selected, onSelect, markers }: Omit<Props, 'height'>) {
  const { scene } = useGLTF(MODEL_URL) as unknown as { scene: THREE.Group };
  useMedicalDressing(scene);
  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const pulse = useRef(0);

  const sel = (z: Zone) => ({
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelect(z);
    },
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      document.body.style.cursor = 'auto';
    },
  });

  const glowRefs = useRef<Array<THREE.Mesh | null>>([]);
  useFrame((_, dt) => {
    pulse.current += dt;
    const k = prefersReduced ? 0.5 : 0.5 + 0.5 * Math.sin(pulse.current * 3.2);
    glowRefs.current.forEach((m) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.16 + k * 0.3;
      const s = 1 + k * 0.07;
      m.scale.set(m.userData.sx * s, m.userData.sy * s, m.userData.sz * s);
    });
  });

  let glowIdx = -1;
  const shellFor = (z: Zone, pos: [number, number, number], scale: [number, number, number]) => {
    glowIdx += 1;
    const i = glowIdx;
    const st = zoneStatus[z];
    const active = st !== 'Normal' || selected === z;
    if (!active) return null;
    return (
      <mesh
        key={`${z}-${pos.join(',')}`}
        position={pos}
        ref={(m) => {
          glowRefs.current[i] = m;
        }}
        userData={{ sx: scale[0], sy: scale[1], sz: scale[2] }}
        scale={scale}
        {...sel(z)}
      >
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color={st === 'Normal' ? '#67e8f9' : ZONE_COLOR[st]}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
    );
  };

  const organMat = (z: Zone, base: string) => {
    const st = zoneStatus[z];
    return {
      color: st === 'Normal' ? base : ZONE_COLOR[st],
      emissive: st === 'Normal' ? base : ZONE_COLOR[st],
      emissiveIntensity: st === 'Normal' ? 0.45 : 1.1,
      roughness: 0.35,
    };
  };

  return (
    <group>
      <primitive object={scene} />

      {/* soft halo = whole-body status */}
      <mesh position={[0, 0.95, -0.1]}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color={ZONE_COLOR[zoneStatus['Whole body']]} transparent opacity={0.07} depthWrite={false} />
      </mesh>

      {/* internal organs, coloured by their zone status */}
      <mesh position={[0, 1.63, 0.03]} {...sel('Head and brain')}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial {...organMat('Head and brain', '#c4b5fd')} />
      </mesh>
      {(['left', 'right'] as const).map((side) => (
        <mesh
          key={side}
          position={[side === 'left' ? -0.036 : 0.036, 1.585, 0.125]}
          {...sel('Eyes')}
        >
          <sphereGeometry args={[0.018, 12, 12]} />
          <meshStandardMaterial {...organMat('Eyes', '#e0f2fe')} />
        </mesh>
      ))}
      <mesh position={[-0.09, 1.3, 0.13]} scale={[1, 1.3, 1]} {...sel('Heart')}>
        <sphereGeometry args={[0.055, 24, 24]} />
        <meshStandardMaterial {...organMat('Heart', '#fda4af')} />
      </mesh>
      {(['left', 'right'] as const).map((side) => (
        <mesh
          key={side}
          position={[side === 'left' ? -0.05 : 0.11, 1.33, 0.09]}
          scale={[1, 1.5, 0.8]}
          {...sel('Lungs')}
        >
          <sphereGeometry args={[0.06, 24, 24]} />
          <meshStandardMaterial {...organMat('Lungs', '#93c5fd')} />
        </mesh>
      ))}
      <mesh position={[0.02, 1.08, 0.12]} scale={[1, 0.9, 0.8]} {...sel('Stomach and gut')}>
        <sphereGeometry args={[0.07, 24, 24]} />
        <meshStandardMaterial {...organMat('Stomach and gut', '#6ee7b7')} />
      </mesh>

      {/* status shells — only troubled or selected regions glow */}
      {ZONES.flatMap((z) => (SHELLS[z] ?? []).map((s) => shellFor(z, s.pos, s.scale)))}

      {/* explore dots on healthy, unselected zones */}
      {ZONES.filter((z) => zoneStatus[z] === 'Normal' && selected !== z && z !== 'Whole body').map((z) => (
        <mesh key={z} position={ANCHOR[z]} {...sel(z)}>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      ))}

      {/* ground ring */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.72, 48]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* danger labels */}
      {(markers ?? [])
        .filter((m) => m.status !== 'Normal')
        .map((m) => (
          <Html key={m.zone} position={ANCHOR[m.zone]} center distanceFactor={4} zIndexRange={[30, 0]}>
            <button
              onClick={() => onSelect(m.zone)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(7,13,34,0.92)',
                border: `2px solid ${ZONE_COLOR[m.status]}`,
                borderRadius: 12,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 800,
                color: '#f1f5f9',
                whiteSpace: 'nowrap',
                boxShadow: `0 6px 24px rgb(0 0 0 / 0.5), 0 0 18px ${ZONE_COLOR[m.status]}55`,
                cursor: 'pointer',
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
                <span style={{ display: 'block', fontWeight: 600, color: '#94a3b8', fontSize: 11 }}>{m.sub}</span>
              </span>
            </button>
          </Html>
        ))}
    </group>
  );
}

/** Smoothly flies the camera to the selected region / chosen view. */
function CameraRig({
  selected,
  view,
  controlsRef,
}: {
  selected: Zone | null;
  view: View;
  controlsRef: React.RefObject<any>;
}) {
  const anim = useRef({ active: true });
  const prev = useRef({ selected, view });
  useEffect(() => {
    if (prev.current.selected !== selected || prev.current.view !== view) {
      prev.current = { selected, view };
      anim.current.active = true;
    }
  }, [selected, view]);
  const target = useMemo(
    () => new THREE.Vector3(...(selected ? ANCHOR[selected] : [0, 1.02, 0])),
    [selected],
  );
  const rig = useThree((s) => ({ camera: s.camera, invalidate: s.invalidate }));
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls || !anim.current.active) return;
    const dist = selected ? 1.5 : 2.8;
    const az = AZIMUTH[view];
    const desired = new THREE.Vector3(
      target.x + Math.sin(az) * dist,
      target.y + 0.15,
      target.z + Math.cos(az) * dist,
    );
    rig.camera.position.lerp(desired, 0.1);
    controls.target.lerp(target, 0.14);
    controls.update();
    if (rig.camera.position.distanceTo(desired) < 0.02) anim.current.active = false;
  });
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const stop = () => {
      anim.current.active = false;
    };
    controls.addEventListener?.('start', stop);
    return () => controls.removeEventListener?.('start', stop);
  }, [controlsRef]);
  return null;
}

export default function HumanBody3D({ zoneStatus, selected, onSelect, markers, height = 460 }: Props) {
  const prefersReduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [spinOn, setSpinOn] = useState(true);
  const [view, setView] = useState<View>('front');
  const [reloadKey, setReloadKey] = useState(0);
  const controlsRef = useRef<any>(null);
  const spinEnabled = spinOn && !prefersReduced;

  const pickView = (v: View) => setView(v);
  const resetView = () => setView('front');

  return (
    <div
      className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-[radial-gradient(ellipse_at_50%_30%,#10235c_0%,#070d22_55%,#04060f_100%)]"
      style={{ width: '100%', touchAction: 'pan-y' }}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200/70">Astronaut · interactive</p>
        <div className="flex gap-1.5" role="group" aria-label="Camera view">
          {(['front', 'side', 'back'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => pickView(v)}
              aria-pressed={view === v}
              className={`min-h-[36px] rounded-lg px-3 text-xs font-bold capitalize transition ${
                view === v
                  ? 'bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-300/50'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 px-3">
        {/* region rail */}
        <div className="flex flex-col gap-1.5 py-3" role="group" aria-label="Body regions">
          {ZONES.map((z) => (
            <button
              key={z}
              onClick={() => onSelect(z)}
              title={z}
              aria-pressed={selected === z}
              className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border text-[11px] font-extrabold transition ${
                selected === z
                  ? 'border-cyan-300/70 bg-cyan-400/20 text-cyan-50'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="flex flex-col items-center gap-1">
                <span
                  aria-hidden
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: ZONE_COLOR[zoneStatus[z]], boxShadow: `0 0 8px ${ZONE_COLOR[zoneStatus[z]]}` }}
                />
                {ZONE_SHORT[z]}
              </span>
            </button>
          ))}
        </div>

        {/* 3D stage */}
        <div className="relative min-w-0 flex-1" style={{ height }}>
          <BodyErrorBoundary onRetry={() => setReloadKey((k) => k + 1)}>
            <Canvas
              key={reloadKey}
              camera={{ position: [0, 1.17, 2.8], fov: 38 }}
              dpr={[1, 2]}
              gl={{ antialias: true, alpha: true }}
            >
              <ambientLight intensity={0.9} />
              <directionalLight position={[3, 5, 4]} intensity={1.4} />
              <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#67e8f9" />
              <pointLight position={[0, 2.2, 1.5]} intensity={12} color="#38bdf8" distance={6} />
              <Suspense fallback={null}>
                <Loader />
                <Astronaut zoneStatus={zoneStatus} selected={selected} onSelect={onSelect} markers={markers} />
              </Suspense>
              <CameraRig selected={selected} view={view} controlsRef={controlsRef} />
              <OrbitControls
                ref={controlsRef}
                makeDefault
                enablePan={false}
                enableZoom
                minDistance={0.8}
                maxDistance={5}
                maxPolarAngle={Math.PI / 1.55}
                autoRotate={spinEnabled}
                autoRotateSpeed={0.9}
                target={[0, 1.02, 0]}
              />
            </Canvas>
          </BodyErrorBoundary>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 px-3 pb-3">
        <p className="text-xs text-slate-400">Drag to rotate · scroll to zoom · click a glowing region</p>
        <div className="flex gap-1.5">
          <button
            onClick={resetView}
            className="min-h-[40px] rounded-full border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-200"
          >
            Reset view
          </button>
          <button
            onClick={() => setSpinOn((s) => !s)}
            aria-pressed={spinEnabled}
            className="min-h-[40px] rounded-full border border-cyan-300/30 bg-cyan-400/10 px-4 text-xs font-bold text-cyan-100"
          >
            {spinOn ? 'Pause spin' : 'Resume spin'}
          </button>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
