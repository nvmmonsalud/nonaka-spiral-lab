"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { QUADRANTS } from "../lib/spiral-engine";
import type { SimulationParticle } from "../lib/simulation";
import { translate, type Locale } from "../lib/simulator-copy";
import styles from "./SimulationDashboard.module.css";

export default function SimulationCanvas({ particles, selectedId, onSelect, locale }: { particles: readonly SimulationParticle[]; selectedId: number | null; onSelect: (id: number) => void; locale: Locale }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const tokens = getComputedStyle(canvas);
      const color = (name: string) => tokens.getPropertyValue(name).trim();
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const colors = [color("--oat"), color("--clay"), color("--olive"), color("--gray-150")];
      const keys = ["socialization", "externalization", "combination", "internalization"];
      QUADRANTS.forEach((q, i) => {
        const x = q.x * width / 2, y = q.y * height / 2;
        ctx.fillStyle = colors[i]; ctx.globalAlpha = i === 1 || i === 2 ? .18 : 1; ctx.fillRect(x + 4, y + 4, width / 2 - 8, height / 2 - 8); ctx.globalAlpha = 1;
        ctx.fillStyle = color("--gray-700"); ctx.textAlign = "center"; ctx.font = "600 12px sans-serif";
        ctx.fillText(translate(locale, keys[i]), x + width / 4, y + 24);
        ctx.font = "10px sans-serif";
        ctx.fillText(`${translate(locale, q.from)} → ${translate(locale, q.to)}`, x + width / 4, y + 40);
      });
      // Paint the selection last so overlapping particles cannot hide its ring.
      [...particles].sort((a, b) => Number(a.id === selectedId) - Number(b.id === selectedId)).forEach(p => {
        ctx.beginPath(); ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color(p.corrupted ? "--rust" : p.kind === "agent" ? "--clay" : "--olive");
        ctx.fill(); ctx.strokeStyle = color(p.id === selectedId ? "--slate" : "--white"); ctx.lineWidth = p.id === selectedId ? 3 : 1; ctx.stroke();
        if (p.level >= 3) {
          ctx.beginPath(); ctx.arc(p.x * width, p.y * height, p.size + 4, 0, Math.PI * 2);
          ctx.setLineDash([3, 3]); ctx.strokeStyle = color(p.kind === "agent" ? "--clay" : "--olive"); ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
        }
      });
    };
    draw();
    const observer = new ResizeObserver(draw); observer.observe(canvas);
    return () => observer.disconnect();
  }, [particles, selectedId, locale]);
  const select = (event: MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    const hits = particles.filter(p => Math.hypot(p.x * rect.width - x, p.y * rect.height - y) <= Math.max(p.size + 6, 14));
    if (hits.length) {
      // Repeated taps cycle through nearby particles; the inspector also offers every particle as a keyboard option.
      const selectedIndex = hits.findIndex(p => p.id === selectedId);
      onSelect(hits[(selectedIndex + 1) % hits.length].id);
    }
  };
  return <canvas ref={ref} className={styles.canvas} aria-label={`${translate(locale, "inspector")}: ${translate(locale, "selectParticle")}`} onClick={select} />;
}
