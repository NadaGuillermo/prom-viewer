import { useEffect, useRef, useState, useCallback } from "react";

type DataTuple = [string, string, string];

interface Props {
  data: DataTuple[];
}

interface NodeCenter {
  cx: number;
  cy: number;
}

function unique(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

export default function Mapper({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [centers, setCenters] = useState<Record<string, NodeCenter>>({});
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const domains = unique(data.map(([d]) => d));
  const dimensions = unique(data.map(([, dim]) => dim));
  const questionnaires = unique(data.map(([, , q]) => q));

  const dimensionsByDomainQuestionnaireTuple = new Map<[string, string], string[]>();
  data.forEach(([domain, dimension, questionnaire]) => {
    const key: [string, string] = [domain, questionnaire];
    if (!dimensionsByDomainQuestionnaireTuple.has(key)) {
      dimensionsByDomainQuestionnaireTuple.set(key, []);
    }
    dimensionsByDomainQuestionnaireTuple.get(key)?.push(dimension);
  });

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cr = container.getBoundingClientRect();
    setContainerSize({ w: cr.width, h: cr.height });
    const next: Record<string, NodeCenter> = {};
    for (const [key, el] of Object.entries(itemRefs.current)) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      next[key] = {
        cx: r.left - cr.left + r.width / 2,
        cy: r.top - cr.top + r.height / 2,
      };
    }
    setCenters(next);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure, data]);

  const ref = (key: string) => (el: HTMLDivElement | null) => {
    itemRefs.current[key] = el;
  };

  // Build unique cubic bezier paths between connected items
  const pathSet = new Map<string, string>();
  for (const [domain, dimension, questionnaire] of data) {
    const dk = `domain:${domain}`;
    const dimk = `dim:${dimension}`;
    const qk = `q:${questionnaire}`;

    const d = centers[dk];
    const dim = centers[dimk];
    const q = centers[qk];

    if (d && dim) {
      const key = `${dk}→${dimk}`;
      if (!pathSet.has(key)) {
        const mx = (d.cx + dim.cx) / 2;
        pathSet.set(
          key,
          `M ${d.cx} ${d.cy} C ${mx} ${d.cy} ${mx} ${dim.cy} ${dim.cx} ${dim.cy}`,
        );
      }
    }
    if (dim && q) {
      const key = `${dimk}→${qk}`;
      if (!pathSet.has(key)) {
        const mx = (dim.cx + q.cx) / 2;
        pathSet.set(
          key,
          `M ${dim.cx} ${dim.cy} C ${mx} ${dim.cy} ${mx} ${q.cy} ${q.cx} ${q.cy}`,
        );
      }
    }
  }

  const domainColors = [
    "amber",
    "teal",
    "lime",
    "violet",
    "slate",
    "emerald",
    "fuchsia",
    "zinc",
    "cyan",
    "pink",
    "stone",
    "sky",
    "rose",
    "indigo",
    "taupe",
    "mist",
  ]
  const questionnaireColors = [
    "green",
    "blue",
    "orange",
    "purple",
    "olive",
    "red",
    "yellow",
    "mauve",
    "neutral",
  ]

  const borderColorClassMap: Record<string, string> = {
    red: "tw:border-red-300",
    orange: "tw:border-orange-300",
    amber: "tw:border-amber-300",
    yellow: "tw:border-yellow-300",
    lime: "tw:border-lime-300",
    green: "tw:border-green-300",
    emerald: "tw:border-emerald-300",
    teal: "tw:border-teal-300",
    cyan: "tw:border-cyan-300",
    sky: "tw:border-sky-300",
    blue: "tw:border-blue-300",
    indigo: "tw:border-indigo-300",
    violet: "tw:border-violet-300",
    purple: "tw:border-purple-300",
    fuchsia: "tw:border-fuchsia-300",
    pink: "tw:border-pink-300",
    rose: "tw:border-rose-300",
    slate: "tw:border-slate-300",
    gray: "tw:border-gray-300",
    zinc: "tw:border-zinc-300",
    neutral: "tw:border-neutral-300",
    stone: "tw:border-stone-300",
    taupe: "tw:border-taupe-300",
    mauve: "tw:border-mauve-300",
    mist: "tw:border-mist-300",
    olive: "tw:border-olive-300",    
  };

  const pill = (group: string, label: string, color = "gray") => {
    const key = `${group}:${label}`;
    const borderClass = borderColorClassMap[color] ?? borderColorClassMap.gray;
    return (
      <div
        key={key}
        ref={ref(key)}
        className={`${borderClass} tw:border-2 tw:rounded tw:bg-white 
        tw:px-3.5 tw:py-1.5 tw:text-xs tw:leading-snug tw:text-gray-700 
        tw:text-center tw:whitespace-nowrap`}
      >
        {label}
      </div>
    );
  };

  const colHeader = (label: string) => (
    <div
      className="tw:mb-3.5 tw:text-center tw:text-[11px] tw:font-semibold 
    tw:uppercase tw:tracking-widest tw:text-gray-400 tw:select-none"
    >
      {label}
    </div>
  );

  return (
    <div ref={containerRef} className="tw:relative tw:w-full">
      {/* SVG connector layer */}
      <svg
        className="tw:absolute tw:inset-0 tw:z-0 tw:overflow-visible tw:pointer-events-none"
        width={containerSize.w}
        height={containerSize.h}
      >
        {Array.from(pathSet.entries()).map(([key, d]) => (
          <path key={key} d={d} fill="none" stroke={`#d1d5db`} strokeWidth={1} />
        ))}
      </svg>
{/* #d1d5db*/}
      {/* Three columns */}
      <div className="tw:relative tw:z-10 tw:flex tw:items-center">
        {/* Domains */}
        <div className="tw:flex tw:flex-1 tw:flex-col tw:items-center">
          {colHeader("Domains")}
          <div className="tw:flex tw:w-full tw:flex-col tw:items-center tw:gap-2.5">
            {domains.map((d, i) => pill("domain", d, domainColors[i % domainColors.length]))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="tw:flex tw:flex-1 tw:flex-col tw:items-center">
          {colHeader("Dimensions")}
          {/* <div className="tw:grid tw:grid-cols-4 tw:items-center tw:gap-2.5">
            {dimensions.map((d) => (
              <div key={d} className="tw:col-span-1">
              {pill("dim", d)}
              </div>
          ))}
          </div> */}
          <div className="tw:flex tw:flex-1 tw:flex-col tw:items-center tw:gap-2.5">
            {dimensions.map((d) => (
              pill("dim", d)
            ))}
          </div>
        </div>

        {/* Questionnaires */}
        <div className="tw:flex tw:flex-1 tw:flex-col tw:items-center">
          {colHeader("Questionnaires")}
          <div className="tw:flex tw:w-full tw:flex-col tw:items-center tw:gap-2.5">
            {questionnaires.map((q, i) => pill("q", q, questionnaireColors[i % questionnaireColors.length]))}
          </div>
        </div>
      </div>
    </div>
  );
}
