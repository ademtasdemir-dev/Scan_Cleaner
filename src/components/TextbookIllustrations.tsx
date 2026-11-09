import React, { useEffect, useState } from 'react';
import { RemainderBagColor } from '../data/worksheetData';
import { IllustrationBoundingBox } from '../types/worksheetModel';

const cachedIllustrationMap = new Map<string, string>();
let latestCleanedIllustrationDataUrl: string | null = null;

export function getCachedChildrenIllustrationDataUrl(): string | null {
  return latestCleanedIllustrationDataUrl;
}

export function useCleanedChildrenIllustration(
  sourceImageUrl: string = '/assets/aistudio/image_d72e70b6.png',
  box?: IllustrationBoundingBox | null
): string | null {
  const effectiveBox = box ?? {
    ymin: 82,
    xmin: 211,
    ymax: 210,
    xmax: 549,
  };
  const cacheKey = `${sourceImageUrl.slice(0, 120)}_${effectiveBox.ymin}_${effectiveBox.xmin}_${effectiveBox.ymax}_${effectiveBox.xmax}`;
  const [dataUrl, setDataUrl] = useState<string | null>(
    () => cachedIllustrationMap.get(cacheKey) ?? null
  );

  useEffect(() => {
    const existing = cachedIllustrationMap.get(cacheKey);
    if (existing) {
      latestCleanedIllustrationDataUrl = existing;
      setDataUrl(existing);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const sx = Math.max(0, Math.round(img.width * (effectiveBox.xmin / 1000)));
        const sy = Math.max(0, Math.round(img.height * (effectiveBox.ymin / 1000)));
        const sw = Math.min(
          img.width - sx,
          Math.max(32, Math.round(img.width * ((effectiveBox.xmax - effectiveBox.xmin) / 1000)))
        );
        const sh = Math.min(
          img.height - sy,
          Math.max(32, Math.round(img.height * ((effectiveBox.ymax - effectiveBox.ymin) / 1000)))
        );

        const canvas = document.createElement('canvas');
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
        const imageData = ctx.getImageData(0, 0, sw, sh);
        const d = imageData.data;

        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4;
            const r = d[i];
            const g = d[i + 1];
            const b = d[i + 2];

            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const sat = maxC - minC;
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            const distFromEdge = Math.min(x, y, sw - 1 - x, sh - 1 - y);
            const edgeThreshold = distFromEdge < 8 ? 182 : 199;

            if (lum > edgeThreshold && sat < 20) {
              d[i] = 255;
              d[i + 1] = 255;
              d[i + 2] = 255;
            } else if (lum > edgeThreshold - 12 && sat < 16) {
              const t = (lum - (edgeThreshold - 12)) / 12;
              d[i] = Math.min(255, Math.round(r + (255 - r) * t));
              d[i + 1] = Math.min(255, Math.round(g + (255 - g) * t));
              d[i + 2] = Math.min(255, Math.round(b + (255 - b) * t));
            } else {
              const boost = 1.08;
              d[i] = Math.min(255, Math.max(0, Math.round((r - 128) * boost + 132)));
              d[i + 1] = Math.min(255, Math.max(0, Math.round((g - 128) * boost + 132)));
              d[i + 2] = Math.min(255, Math.max(0, Math.round((b - 128) * boost + 132)));
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const cleaned = canvas.toDataURL('image/png');
        cachedIllustrationMap.set(cacheKey, cleaned);
        latestCleanedIllustrationDataUrl = cleaned;
        setDataUrl(cleaned);
      } catch {
        // Fallback handled by SVG vector illustration
      }
    };
    img.src = sourceImageUrl;
  }, [sourceImageUrl, cacheKey, effectiveBox.xmin, effectiveBox.ymin, effectiveBox.xmax, effectiveBox.ymax]);

  return dataUrl;
}

export const ChildrenCardTableVector: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 320 145"
    className={`w-full h-auto select-none ${className}`}
    role="img"
    aria-label="Fünf Kinder sitzen an einem runden Tisch und verteilen Spielkarten"
  >
    {/* Background subtle shadow under table */}
    <ellipse cx="165" cy="128" rx="95" ry="12" fill="#e2e8f0" />

    {/* Child 2 (Back-left blonde girl) */}
    <g>
      <path d="M100 58 C95 40, 128 40, 124 58 Z" fill="#84cc16" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="112" cy="34" r="14" fill="#f5d0c5" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M97 34 C97 16, 127 16, 127 36 C125 25, 102 24, 97 34 Z" fill="#fde047" stroke="#1e293b" strokeWidth="1.4" />
      <circle cx="108" cy="33" r="1.5" fill="#1e293b" />
      <circle cx="117" cy="33" r="1.5" fill="#1e293b" />
      <path d="M109 40 Q113 43 117 40" fill="none" stroke="#1e293b" strokeWidth="1.4" />
    </g>

    {/* Child 3 (Back-center blonde girl holding card) */}
    <g>
      <path d="M136 58 C134 38, 174 38, 172 58 Z" fill="#93c5fd" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="154" cy="28" r="14" fill="#f5d0c5" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M138 30 C138 11, 170 11, 170 30 C166 20, 143 20, 138 30 Z" fill="#fef08a" stroke="#1e293b" strokeWidth="1.4" />
      <circle cx="149" cy="27" r="1.5" fill="#1e293b" />
      <circle cx="159" cy="27" r="1.5" fill="#1e293b" />
      <path d="M150 34 Q154 37 158 34" fill="none" stroke="#1e293b" strokeWidth="1.4" />
      {/* Held red card */}
      <rect x="133" y="34" width="11" height="15" rx="1.5" fill="#dc2626" stroke="#1e293b" strokeWidth="1.3" transform="rotate(-8 138 41)" />
    </g>

    {/* Child 4 (Back-right boy with curly hair & glasses) */}
    <g>
      <path d="M178 62 C178 42, 214 42, 214 62 Z" fill="#fdba74" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="196" cy="34" r="14" fill="#e6b89c" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M182 28 C184 15, 210 15, 211 29 C206 22, 188 22, 182 28 Z" fill="#b45309" stroke="#1e293b" strokeWidth="1.4" />
      <circle cx="190" cy="33" r="4" fill="none" stroke="#1e293b" strokeWidth="1.3" />
      <circle cx="201" cy="33" r="4" fill="none" stroke="#1e293b" strokeWidth="1.3" />
      <line x1="194" y1="33" x2="197" y2="33" stroke="#1e293b" strokeWidth="1.3" />
    </g>

    {/* Round Table */}
    <ellipse cx="165" cy="90" rx="88" ry="30" fill="#cbd5e1" stroke="#1e293b" strokeWidth="1.6" />
    <path d="M77 90 A88 30 0 0 0 253 90 L253 96 A88 30 0 0 1 77 96 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="1.4" />

    {/* Cards dealt on the table */}
    {[
      { x: 105, y: 78, rot: -18 },
      { x: 113, y: 80, rot: -8 },
      { x: 142, y: 69, rot: 5 },
      { x: 150, y: 70, rot: 14 },
      { x: 184, y: 71, rot: -10 },
      { x: 192, y: 73, rot: 6 },
      { x: 155, y: 86, rot: -6 },
      { x: 164, y: 88, rot: 12 },
      { x: 204, y: 92, rot: -15 },
      { x: 212, y: 94, rot: 4 },
      { x: 115, y: 96, rot: 10 },
      { x: 123, y: 98, rot: -12 },
    ].map((c, idx) => (
      <rect
        key={idx}
        x={c.x}
        y={c.y}
        width="11"
        height="7.5"
        rx="1"
        fill="#dc2626"
        stroke="#1e293b"
        strokeWidth="1.1"
        transform={`rotate(${c.rot} ${c.x + 5} ${c.y + 4})`}
      />
    ))}

    {/* Child 1 (Front-left child in wheelchair) */}
    <g>
      {/* Wheelchair backrest & frame */}
      <path d="M40 58 L46 112 L84 112" fill="none" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="35" y="62" width="10" height="32" rx="3" fill="#1e293b" />
      {/* Shirt & arm */}
      <path d="M52 72 C52 58, 84 60, 88 86 L68 96 L50 92 Z" fill="#65a30d" stroke="#1e293b" strokeWidth="1.5" />
      {/* Head */}
      <circle cx="67" cy="48" r="14" fill="#f5d0c5" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M53 46 C53 29, 80 29, 81 44 C76 37, 59 38, 53 46 Z" fill="#a16207" stroke="#1e293b" strokeWidth="1.4" />
      <circle cx="73" cy="47" r="1.5" fill="#1e293b" />
      <path d="M71 53 Q75 56 78 53" fill="none" stroke="#1e293b" strokeWidth="1.4" />
      {/* Wheelchair wheel */}
      <circle cx="64" cy="114" r="22" fill="none" stroke="#1e293b" strokeWidth="2.5" />
      <circle cx="64" cy="114" r="18" fill="#60a5fa" fillOpacity="0.25" stroke="#1e293b" strokeWidth="1.2" />
      <circle cx="64" cy="114" r="4" fill="#475569" stroke="#1e293b" strokeWidth="1.2" />
    </g>

    {/* Child 5 (Front-right girl with dark hair) */}
    <g>
      <path d="M235 76 C235 60, 270 60, 274 112 L232 112 Z" fill="#84cc16" stroke="#1e293b" strokeWidth="1.5" />
      <circle cx="250" cy="46" r="14" fill="#d69e72" stroke="#1e293b" strokeWidth="1.5" />
      <path d="M238 40 C240 24, 268 26, 266 54 L272 78 L256 75 L254 50 Z" fill="#27272a" stroke="#1e293b" strokeWidth="1.4" />
      <circle cx="242" cy="45" r="1.5" fill="#1e293b" />
    </g>
  </svg>
);

export const PartnerWorkIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 36 28"
    className={`w-7 h-6 text-slate-700 shrink-0 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Partnerarbeit Symbol"
  >
    {/* Left child profile */}
    <circle cx="10" cy="10" r="5.5" />
    <path d="M4.5 24 C4.5 18.5, 15.5 18.5, 15.5 24" />
    <path d="M6 7.5 C8 5, 12 5, 14 7.5" />
    {/* Right child profile with ponytail */}
    <circle cx="24" cy="10" r="5.5" />
    <path d="M18.5 24 C18.5 18.5, 29.5 18.5, 29.5 24" />
    <path d="M29.5 9 C32.5 8, 34 11, 32.5 13.5" />
  </svg>
);

export const CrayonIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 36 24"
    className={`w-7 h-5 text-slate-600 shrink-0 ${className}`}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Ausmalen Stift Symbol"
  >
    <g transform="rotate(-28 18 12)">
      <polygon points="3,12 9,9 9,15" fill="#94a3b8" />
      <rect x="9" y="9" width="22" height="6" fill="#e2e8f0" />
      <line x1="13" y1="9" x2="13" y2="15" />
      <line x1="27" y1="9" x2="27" y2="15" />
    </g>
  </svg>
);

export const RemainderSacksInteractive: React.FC<{
  activeBrush?: RemainderBagColor;
  onSelectBrush?: (color: RemainderBagColor) => void;
  interactive?: boolean;
  customSacks?: Array<{ label: string; subLabel: string; color: 'red' | 'blue' | 'green' }>;
}> = ({ activeBrush, onSelectBrush, interactive = false, customSacks }) => {
  const sacks: Array<{
    color: 'red' | 'blue' | 'green';
    topText: string;
    bottomText: string;
    fill: string;
    darkStroke: string;
    label: string;
  }> = [
    {
      color: 'red',
      topText: customSacks?.[0]?.label ?? 'Rest',
      bottomText: customSacks?.[0]?.subLabel ?? '2',
      fill: '#c84b31',
      darkStroke: '#27272a',
      label: `${customSacks?.[0]?.label ?? 'Rest'} ${customSacks?.[0]?.subLabel ?? '2'}`,
    },
    {
      color: 'blue',
      topText: customSacks?.[1]?.label ?? 'Rest',
      bottomText: customSacks?.[1]?.subLabel ?? '3',
      fill: '#5b7db1',
      darkStroke: '#27272a',
      label: `${customSacks?.[1]?.label ?? 'Rest'} ${customSacks?.[1]?.subLabel ?? '3'}`,
    },
    {
      color: 'green',
      topText: customSacks?.[2]?.label ?? 'Rest',
      bottomText: customSacks?.[2]?.subLabel ?? '4',
      fill: '#538d4e',
      darkStroke: '#27272a',
      label: `${customSacks?.[2]?.label ?? 'Rest'} ${customSacks?.[2]?.subLabel ?? '4'}`,
    },
  ];

  return (
    <div className="flex items-end gap-2.5 select-none">
      {sacks.map((s, idx) => {
        const isSelected = interactive && activeBrush === s.color;
        const yOffset = idx === 1 ? 'translate-y-2' : idx === 2 ? 'translate-y-0.5' : '';
        return (
          <button
            key={s.color}
            type="button"
            disabled={!interactive}
            onClick={() =>
              interactive && onSelectBrush?.(activeBrush === s.color ? null : s.color)
            }
            aria-label={`Farbsack ${s.label} (${s.color === 'red' ? 'Rot' : s.color === 'blue' ? 'Blau' : 'Grün'})`}
            className={`group relative flex flex-col items-center transition-transform ${yOffset} ${
              interactive
                ? 'cursor-pointer hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600'
                : 'cursor-default'
            } ${isSelected ? 'scale-110 ring-2 ring-slate-900 rounded-xl p-0.5 bg-amber-50/70' : ''}`}
          >
            <svg viewBox="0 0 68 82" className="w-14 h-16 sm:w-16 sm:h-[74px] overflow-visible">
              {/* Drop shadow */}
              <ellipse cx="35" cy="76" rx="26" ry="5" fill="#cbd5e1" />
              {/* Top flared sack ruffle */}
              <path
                d="M23 7 C25 14, 28 19, 30 22 L39 22 C41 19, 44 14, 46 7 C41 10, 38 6, 34 9 C30 6, 27 10, 23 7 Z"
                fill={s.fill}
                stroke={s.darkStroke}
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              {/* Main sack body */}
              <path
                d="M29 22 C14 34, 8 52, 11 66 C13 74, 24 76, 34 76 C45 76, 56 74, 58 66 C61 52, 54 34, 39 22 Z"
                fill={s.fill}
                stroke={s.darkStroke}
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              {/* Rope tie */}
              <path
                d="M28 21 Q34 24 40 21 M28 23 Q34 26 40 23"
                fill="none"
                stroke={s.darkStroke}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              {/* Subtle crease lines */}
              <path
                d="M22 65 C25 69, 30 71, 36 70"
                fill="none"
                stroke={s.darkStroke}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.65"
              />
              <path
                d="M48 56 C47 63, 44 67, 39 69"
                fill="none"
                stroke={s.darkStroke}
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.65"
              />
              {/* Text inside sack */}
              <text
                x="34"
                y="48"
                textAnchor="middle"
                fill="#18181b"
                fontSize="11.5"
                fontWeight="600"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {s.topText}
              </text>
              <text
                x="34"
                y="62"
                textAnchor="middle"
                fill="#18181b"
                fontSize="12.5"
                fontWeight="700"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {s.bottomText}
              </text>
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export const SelfAssessmentStrip: React.FC<{
  selectedSmiley: number | null;
  onSelectSmiley?: (index: number) => void;
  interactive?: boolean;
}> = ({ selectedSmiley, onSelectSmiley, interactive = false }) => {
  const faces = [
    { label: 'Sehr gut verstanden', mouth: 'M7 13.5 C8.5 16.5, 15.5 16.5, 17 13.5' },
    { label: 'Gut verstanden', mouth: 'M8 14 C9.5 15.8, 14.5 15.8, 16 14' },
    { label: 'Mittelmäßig verstanden', mouth: 'M8 14.5 L16 14.5' },
    { label: 'Noch unsicher', mouth: 'M8 16 C9.5 13.8, 14.5 13.8, 16 16' },
  ];

  return (
    <div className="flex flex-col items-center gap-1.5 text-slate-600 select-none">
      {/* Open booklet with pencil icon */}
      <svg
        viewBox="0 0 32 26"
        className="w-6 h-5 text-slate-600 mb-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7 Q9 5 16 8 Q23 5 29 7 L29 21 Q23 19 16 22 Q9 19 3 21 Z" />
        <line x1="16" y1="8" x2="16" y2="22" />
        <path d="M18 3 L26 1 L20 11 L16 12 L17 8 Z" fill="#ffffff" />
      </svg>

      {faces.map((f, idx) => {
        const isChosen = selectedSmiley === idx;
        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onSelectSmiley?.(idx)}
            aria-label={f.label}
            className={`rounded-full transition-colors ${
              interactive ? 'cursor-pointer hover:bg-orange-50' : 'cursor-default'
            } ${isChosen ? 'bg-amber-100 text-orange-700 ring-1 ring-orange-500' : ''}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <circle cx="12" cy="12" r="9.5" />
              <circle cx="9" cy="9.5" r="1" fill="currentColor" />
              <circle cx="15" cy="9.5" r="1" fill="currentColor" />
              <path d={f.mouth} strokeLinecap="round" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};
