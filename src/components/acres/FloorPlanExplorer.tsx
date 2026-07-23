"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, ChevronRight, Maximize2, Minus, Plus, RotateCcw, Ruler, Sparkles } from "lucide-react";
import type { ApartmentRoom, ConfigurationDetail } from "./mock-data";

type Props = {
  details: ConfigurationDetail[];
  status?: string;
  possession?: string;
  onRequestCallback?: () => void;
};

function roomArea(room: ApartmentRoom) {
  if (room.area !== undefined) return room.area;
  if (room.length !== undefined && room.width !== undefined) return room.length * room.width;
  return undefined;
}

function roomDimensions(room: ApartmentRoom) {
  const unit = room.unit || "ft";
  if (room.length !== undefined && room.width !== undefined) return `${room.length} × ${room.width} ${unit}`;
  const area = roomArea(room);
  return area !== undefined ? `${area.toLocaleString("en-IN")} sq ${unit}` : "Dimensions on request";
}

function metricArea(area: string) {
  if (/\b(?:sqm|sq\.?\s*m)/i.test(area)) return "";
  const value = Number(area.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0]);
  if (!Number.isFinite(value)) return "";
  return `${(value * 0.092903).toFixed(2)} sqm`;
}

export default function FloorPlanExplorer({
  details,
  status = "New Launch",
  possession = "Possession date on request",
  onRequestCallback,
}: Props) {
  const configurations = useMemo(() => [...new Set(details.map((detail) => detail.configuration))], [details]);
  const [activeConfiguration, setActiveConfiguration] = useState(configurations[0] || "");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [mode, setMode] = useState<"2d" | "3d">("2d");
  const [zoom, setZoom] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState("");

  useEffect(() => {
    const configuration = configurations[0] || "";
    setActiveConfiguration(configuration);
    setSelectedIndex(Math.max(0, details.findIndex((detail) => detail.configuration === configuration)));
    setShowViewer(false);
  }, [details, configurations]);

  const visiblePlans = details
    .map((detail, index) => ({ detail, index }))
    .filter(({ detail }) => detail.configuration === activeConfiguration);
  const selected = details[selectedIndex] || visiblePlans[0]?.detail;
  const rooms = selected?.rooms || [];
  const selectedRoom = rooms.find((room, index) => (room.id || `${index}`) === selectedRoomId) || rooms[0];
  const hasAny3dPlan = details.some((detail) => detail.floorPlan3dUrl);
  const planUrl = mode === "3d" ? selected?.floorPlan3dUrl : selected?.floorPlan2dUrl;

  const selectConfiguration = (configuration: string) => {
    const index = details.findIndex((detail) => detail.configuration === configuration);
    setActiveConfiguration(configuration);
    setSelectedIndex(Math.max(0, index));
    setShowViewer(false);
    setMode("2d");
    setZoom(1);
    setSelectedRoomId("");
  };

  const openPlan = (index: number, preferredMode: "2d" | "3d" = "2d") => {
    const detail = details[index];
    setSelectedIndex(index);
    setActiveConfiguration(detail.configuration);
    setMode(preferredMode === "3d" && detail.floorPlan3dUrl ? "3d" : detail.floorPlan2dUrl ? "2d" : detail.floorPlan3dUrl ? "3d" : "2d");
    setZoom(1);
    setSelectedRoomId("");
    setShowViewer(true);
  };

  const openFirst3dPlan = () => {
    const index = details.findIndex((detail) => detail.floorPlan3dUrl);
    if (index >= 0) openPlan(index, "3d");
  };

  if (!details.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E7E3EA] bg-white shadow-sm" aria-labelledby="floor-plan-heading">
      <div className="border-b border-[#EAE7ED] px-5 py-5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C19A3C]">Unit plans</p>
            <h2 id="floor-plan-heading" className="mt-1 text-[21px] font-bold text-[#12172B]">Floor Plans &amp; Pricing</h2>
          </div>
          <button
            type="button"
            onClick={openFirst3dPlan}
            disabled={!hasAny3dPlan}
            className="inline-flex items-center gap-2 rounded-lg border border-[#121B35] px-4 py-2.5 text-[12px] font-bold text-[#121B35] transition-colors hover:bg-[#121B35] hover:text-white disabled:cursor-not-allowed disabled:border-[#C8D1E1] disabled:text-[#9AA5B8] disabled:hover:bg-white"
          >
            <Sparkles className="size-4" /> View Homes in 3D
          </button>
        </div>

        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-[#E7E3EA]" role="tablist" aria-label="Apartment configurations">
          {configurations.map((configuration) => (
            <button
              key={configuration}
              type="button"
              role="tab"
              aria-selected={activeConfiguration === configuration}
              onClick={() => selectConfiguration(configuration)}
              className={`relative whitespace-nowrap px-4 py-3 text-[13px] font-bold transition-colors ${activeConfiguration === configuration ? "text-[#121B35]" : "text-[#68646F] hover:text-[#3F3D46]"}`}
            >
              {configuration} Apartment
              {activeConfiguration === configuration && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#121B35]" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 md:p-6">
        <p className="text-[13px] font-bold text-[#3F3D46]">{visiblePlans.length} Floor {visiblePlans.length === 1 ? "Plan" : "Plans"} Available</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {visiblePlans.map(({ detail, index }) => {
            const metric = metricArea(detail.superBuiltUpArea);
            const canOpenPlan = Boolean(detail.floorPlan2dUrl || detail.floorPlan3dUrl || detail.rooms?.length);
            return (
              <article key={detail.id || `${detail.configuration}-${index}`} className="overflow-hidden rounded-xl border border-[#E7E3EA] bg-white transition-shadow hover:shadow-md">
                <div className="grid min-h-36 grid-cols-[112px_minmax(0,1fr)] border-b border-[#EAE7ED] sm:grid-cols-[140px_minmax(0,1fr)]">
                  <button
                    type="button"
                    disabled={!canOpenPlan}
                    onClick={() => openPlan(index)}
                    className="relative flex items-center justify-center overflow-hidden border-r border-[#EAE7ED] bg-[#F1F4F8] disabled:cursor-default"
                    aria-label={`View ${detail.superBuiltUpArea} floor plan`}
                  >
                    {detail.floorPlan2dUrl || detail.floorPlan3dUrl ? (
                      <img src={detail.floorPlan2dUrl || detail.floorPlan3dUrl} alt={`${detail.configuration} ${detail.superBuiltUpArea} floor plan`} className="h-full w-full object-contain p-2 transition-transform hover:scale-105" />
                    ) : (
                      <span className="text-center"><Box className="mx-auto size-7 text-[#A9B4C8]" /><span className="mt-2 block text-[9px] font-bold uppercase tracking-wider text-[#8B96A9]">Plan preview</span></span>
                    )}
                    {canOpenPlan && <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#12172B]/90 px-2 py-1 text-[9px] font-bold text-white">View plan</span>}
                  </button>

                  <div className="p-4">
                    <p className="text-[22px] font-extrabold leading-none text-[#12172B]">{detail.superBuiltUpArea}</p>
                    {metric && <p className="mt-1 text-[12px] font-semibold text-[#68646F]">({metric})</p>}
                    <p className="mt-2 text-[11px] text-[#68646F]">Super Built-up Area <span className="text-[#B0B8C6]">|</span> {detail.configuration}</p>
                    <p className="mt-4 text-[20px] font-extrabold text-[#12172B]">{detail.price}</p>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><span className="inline-flex rounded bg-[#FFF2D8] px-2 py-1 text-[10px] font-bold text-[#9A6A12]">{status}</span><p className="mt-2 text-[12px] font-semibold text-[#5A5762]">{possession}</p></div>
                    {detail.builtUpArea && <div className="text-right"><p className="text-[10px] uppercase text-[#8A94A6]">Built-up area</p><p className="text-[12px] font-bold text-[#344467]">{detail.builtUpArea}</p></div>}
                  </div>
                  <button type="button" onClick={onRequestCallback} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#121B35] py-2.5 text-[12px] font-bold text-[#121B35] transition-colors hover:bg-[#121B35] hover:text-white">Request Callback <ChevronRight className="size-3.5" /></button>
                </div>
              </article>
            );
          })}
        </div>

        {showViewer && selected && (
          <div className="mt-6 overflow-hidden rounded-xl border border-[#E7E3EA]" aria-label="Interactive selected floor plan">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE7ED] bg-[#F8F7FA] px-4 py-3">
              <div><p className="text-[12px] font-bold text-[#3F3D46]">{selected.configuration} · {selected.superBuiltUpArea}</p><p className="text-[10px] text-[#748096]">Select a room or zoom into the plan.</p></div>
              <div className="flex items-center gap-2">
                {(selected.floorPlan2dUrl || selected.floorPlan3dUrl) && (
                  <div className="flex rounded-lg border border-[#E7E3EA] bg-white p-0.5">
                    {selected.floorPlan2dUrl && <button type="button" onClick={() => setMode("2d")} className={`rounded-md px-3 py-1.5 text-[11px] font-extrabold uppercase ${mode === "2d" ? "bg-[#121B35] text-white" : "text-[#5A5762]"}`}>2D</button>}
                    {selected.floorPlan3dUrl && <button type="button" onClick={() => setMode("3d")} className={`rounded-md px-3 py-1.5 text-[11px] font-extrabold uppercase ${mode === "3d" ? "bg-[#121B35] text-white" : "text-[#5A5762]"}`}>3D</button>}
                  </div>
                )}
                <div className="flex rounded-lg border border-[#E7E3EA] bg-white">
                  <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, value - 0.25))} className="p-2 text-[#4F4B57] hover:bg-[#F4F2F5]"><Minus className="size-3.5" /></button>
                  <button type="button" aria-label="Reset zoom" onClick={() => setZoom(1)} className="border-x border-[#E7E3EA] p-2 text-[#4F4B57] hover:bg-[#F4F2F5]"><RotateCcw className="size-3.5" /></button>
                  <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(2.5, value + 0.25))} className="p-2 text-[#4F4B57] hover:bg-[#F4F2F5]"><Plus className="size-3.5" /></button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1fr)_270px]">
              <div className="relative flex min-h-80 items-center justify-center overflow-auto bg-[#F1EFF3] p-5 lg:border-r">
                {planUrl ? (
                  <div className="relative max-h-[480px] max-w-full origin-center transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
                    <img src={planUrl} alt={`${selected.configuration} ${mode.toUpperCase()} floor plan`} className="max-h-[460px] w-auto max-w-full object-contain shadow-sm" />
                    {mode === "2d" && rooms.some((room) => room.polygon?.length) && (
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-label="Selectable rooms">
                        {rooms.map((room, index) => room.polygon?.length ? <polygon key={room.id || `${room.name}-${index}`} points={room.polygon.map((point) => `${point.x},${point.y}`).join(" ")} role="button" tabIndex={0} aria-label={`View ${room.name} details`} onClick={() => setSelectedRoomId(room.id || `${index}`)} onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && setSelectedRoomId(room.id || `${index}`)} className={`cursor-pointer stroke-[0.7] ${selectedRoom === room ? "fill-[#DDAA42]/35 stroke-[#9A741E]" : "fill-[#121B35]/10 stroke-[#121B35]/55 hover:fill-[#121B35]/20"}`} /> : null)}
                      </svg>
                    )}
                  </div>
                ) : <div className="p-8 text-center"><Maximize2 className="mx-auto size-8 text-[#A7B3C9]" /><p className="mt-3 text-[12px] font-bold text-[#344467]">Room dimensions are available; plan image has not been uploaded.</p></div>}
              </div>

              <aside className="p-4" aria-label="Room dimensions">
                <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#68646F]">Room dimensions</p>
                {rooms.length ? <div className="mt-3 flex max-h-56 flex-col gap-1.5 overflow-y-auto">{rooms.map((room, index) => { const id = room.id || `${index}`; return <button key={id} type="button" onClick={() => setSelectedRoomId(id)} className={`rounded-lg border px-3 py-2.5 text-left ${selectedRoom === room ? "border-[#DDAA42] bg-[#FFF9E9]" : "border-[#EAE7ED]"}`}><span className="block text-[12px] font-bold text-[#3F3D46]">{room.name}</span><span className="mt-0.5 block text-[10px] text-[#68646F]">{roomDimensions(room)}</span></button>; })}</div> : <p className="mt-4 text-[12px] leading-5 text-[#748096]">Detailed room measurements have not been added for this plan.</p>}
                {selectedRoom && <div className="mt-4 rounded-lg bg-[#12172B] p-4 text-white"><Ruler className="size-4 text-[#F2C052]" /><p className="mt-2 text-[13px] font-bold">{selectedRoom.name}</p><p className="mt-1 text-[12px] text-white/75">{roomDimensions(selectedRoom)}</p>{roomArea(selectedRoom) !== undefined && <p className="mt-1 text-[10px] text-white/55">Area: {roomArea(selectedRoom)?.toLocaleString("en-IN")} sq {selectedRoom.unit || "ft"}</p>}</div>}
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
