"use client";

import "leaflet/dist/leaflet.css";
import type { Map as LMap, Marker } from "leaflet";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Cred, LevelChip } from "@/components/pk/Badges";
import { Icon } from "@/components/pk/Icon";
import type { CoachPin } from "@pikyoo/core/coach-filters";
import { money } from "@pikyoo/core/format";
import type { Coach } from "@pikyoo/core/types";
import { Img } from "./CoachCard";

const TPE: [number, number] = [25.04, 121.54];
const pinHtml = (p: CoachPin) =>
  `<span>${p.coaches.length > 1 ? `${p.coaches.length} 位・` : ""}${money(p.priceFrom)}${p.coaches.length > 1 ? " 起" : ""}</span>`;

/** 找教練 地圖 (like the hotel maps on Booking.com): one price pin per court with coaches; tapping it slides up a preview
 *  of those coaches, and each preview opens the coach page. Leaflet + OpenStreetMap tiles: free, no key. Leaflet reads
 *  `window` on import, so it loads in the effect. */
export function CoachMap({ pins }: { pins: CoachPin[] }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const marks = useRef<Map<string, Marker>>(new Map());
  const [picked, setPicked] = useState<string | null>(null);
  const [lib, setLib] = useState<typeof import("leaflet") | null>(null);
  // a pick whose court dropped out of the filters simply shows nothing
  const pin = pins.find((p) => p.court.id === picked) ?? null;

  useEffect(() => {
    let off = false;
    const all = marks.current;
    import("leaflet").then((L) => {
      if (off || !box.current) return;
      const m = L.map(box.current, { zoomControl: false }).setView(TPE, 12);
      L.control.zoom({ position: "topright" }).addTo(m);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).addTo(m);
      m.on("click", () => setPicked(null));
      map.current = m;
      setLib(L);
    });
    return () => { off = true; map.current?.remove(); map.current = null; all.clear(); };
  }, []);

  // redraw the pins whenever the filters change, and fit them on screen
  useEffect(() => {
    const m = map.current;
    if (!lib || !m) return;
    const all = marks.current;
    all.forEach((k) => k.remove());
    all.clear();
    for (const p of pins) {
      const k = lib.marker([p.court.lat, p.court.lng], {
        icon: lib.divIcon({ className: "cpin", html: pinHtml(p), iconSize: undefined, iconAnchor: [0, 0] }),
        keyboard: true, title: `${p.court.name}：${p.coaches.map((c) => c.name).join("、")}`, riseOnHover: true,
      }).addTo(m);
      k.on("click", (e) => { e.originalEvent?.stopPropagation(); setPicked(p.court.id); });
      all.set(p.court.id, k);
    }
    if (pins.length) m.fitBounds(lib.latLngBounds(pins.map((p) => [p.court.lat, p.court.lng])), { padding: [60, 60], maxZoom: 14 });
  }, [lib, pins]);

  useEffect(() => {
    marks.current.forEach((k, id) => k.getElement()?.classList.toggle("on", id === pin?.court.id));
    if (pin && map.current) map.current.panTo([pin.court.lat, pin.court.lng], { animate: true });
  }, [pin, lib, pins]);

  return (
    <div className="cmap">
      <div ref={box} className="cmap-box" role="application" aria-label="教練地圖：每個價格標籤是一個上課場地" />
      {!pins.length && <p className="cmap-empty">符合條件的教練都還沒標上場地。換個條件，或切回列表看看。</p>}
      {pin && (
        <div className="cmap-peek" role="dialog" aria-label={`${pin.court.name}的教練`}>
          <div className="cmap-peek-h">
            <span><Icon name="pin" size={15} /><b>{pin.court.name}</b>・{pin.coaches.length} 位教練</span>
            <Link className="linkbtn" href={`/courts/${pin.court.id}`}>看球場</Link>
            <button className="btn btn-ghost btn-icon" aria-label="關閉" onClick={() => setPicked(null)}><Icon name="x" size={18} /></button>
          </div>
          <div className="cmap-row">{pin.coaches.map((c) => <PeekCard key={c.id} coach={c} />)}</div>
        </div>
      )}
    </div>
  );
}

/** The preview a pin opens: what a visitor may see anyway (photo, credentials, level, price), then the coach page. */
function PeekCard({ coach: c }: { coach: Coach }) {
  const cover = c.profile.photos[0];
  const cred = c.creds.find((x) => x.issuer !== "DUPR");
  return (
    <Link href={`/coaches/${c.id}`} className="peek">
      <div className="peek-photo">{cover ? <Img src={cover.src} alt={cover.alt} sizes="120px" /> : <div className="ph" style={{ position: "absolute", inset: 0, borderRadius: 0 }}>{c.initial}</div>}</div>
      <div className="peek-body">
        <b className="peek-name">{c.name}</b>
        {cred && <span className="peek-cred"><Cred c={cred} /></span>}
        <span className="peek-meta"><LevelChip min={c.levelMin} max={c.levelMax} /><span className="text-muted">{c.types.join("・")}</span></span>
        <span className="peek-foot"><span className="num peek-p">{money(c.priceFrom)}<small> 起</small></span><span className="peek-go">看教練頁<Icon name="right" size={14} /></span></span>
      </div>
    </Link>
  );
}
