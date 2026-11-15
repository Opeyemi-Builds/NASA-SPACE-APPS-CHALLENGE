import type { Status, Zone } from '../types';

// Guide Step 3b: simple SVG body, 7 tappable zones, ~170px wide, centered.
// Status fills (guide §3): ok green, watch yellow, alert red, urgent dark red.
const FILL: Record<Status, { fill: string; stroke: string }> = {
  Normal: { fill: '#DDF3E7', stroke: '#14683F' },
  Watch: { fill: '#FFF3CD', stroke: '#8A5A00' },
  Alert: { fill: '#FDE3E0', stroke: '#A32218' },
  Urgent: { fill: '#A32218', stroke: '#7A1710' },
};

export const BODY_ZONES: Zone[] = [
  'Head and brain',
  'Eyes',
  'Heart',
  'Lungs',
  'Stomach and gut',
  'Bones and muscles',
  'Whole body',
];

interface Props {
  zoneStatus: Record<Zone, Status>;
  onSelect: (z: Zone) => void;
}

function Zone({
  id,
  label,
  status,
  onSelect,
  children,
}: {
  id: Zone;
  label: string;
  status: Status;
  onSelect: (z: Zone) => void;
  children: React.ReactNode;
}) {
  const c = FILL[status];
  return (
    <g
      id={id}
      role="button"
      tabIndex={0}
      aria-label={`${label}: ${status}`}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(id);
        }
      }}
      style={{ cursor: 'pointer' }}
      fill={c.fill}
      stroke={c.stroke}
      strokeWidth={2.5}
    >
      <title>{`${label}: ${status}`}</title>
      {children}
    </g>
  );
}

export default function BodyFigure({ zoneStatus, onSelect }: Props) {
  return (
    <svg
      viewBox="0 0 170 320"
      width={170}
      height={320}
      className="mx-auto block"
      role="img"
      aria-label="Body figure. Tap a zone for detail."
    >
      {/* whole body silhouette sits behind everything */}
      <Zone id="Whole body" label="Whole body" status={zoneStatus['Whole body']} onSelect={onSelect}>
        <rect x={48} y={6} width={74} height={306} rx={34} />
      </Zone>
      {/* bones: arms and legs */}
      <Zone id="Bones and muscles" label="Bones and muscles" status={zoneStatus['Bones and muscles']} onSelect={onSelect}>
        <rect x={30} y={86} width={13} height={66} rx={6.5} />
        <rect x={127} y={86} width={13} height={66} rx={6.5} />
        <rect x={64} y={198} width={15} height={100} rx={7.5} />
        <rect x={91} y={198} width={15} height={100} rx={7.5} />
      </Zone>
      {/* lungs */}
      <Zone id="Lungs" label="Lungs" status={zoneStatus['Lungs']} onSelect={onSelect}>
        <ellipse cx={66} cy={112} rx={11} ry={17} />
        <ellipse cx={104} cy={112} rx={11} ry={17} />
      </Zone>
      {/* heart */}
      <Zone id="Heart" label="Heart" status={zoneStatus['Heart']} onSelect={onSelect}>
        <circle cx={72} cy={106} r={9} />
      </Zone>
      {/* gut */}
      <Zone id="Stomach and gut" label="Stomach and gut" status={zoneStatus['Stomach and gut']} onSelect={onSelect}>
        <ellipse cx={85} cy={164} rx={15} ry={20} />
      </Zone>
      {/* head */}
      <Zone id="Head and brain" label="Head and brain" status={zoneStatus['Head and brain']} onSelect={onSelect}>
        <circle cx={85} cy={32} r={20} />
      </Zone>
      {/* eyes */}
      <Zone id="Eyes" label="Eyes" status={zoneStatus['Eyes']} onSelect={onSelect}>
        <circle cx={78} cy={32} r={4} />
        <circle cx={92} cy={32} r={4} />
      </Zone>
    </svg>
  );
}
