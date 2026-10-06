"use client";

import { useEffect, useRef } from "react";

// Effet "constellation" discret (particules reliées par des traits quand
// elles sont proches) pour les pages publiques (accueil, connexion,
// inscription) — pas sur les pages internes denses en données (Kanban,
// tableaux), où ça nuirait à la lisibilité. Dessiné en Canvas 2D plutôt
// qu'avec une librairie : l'effet est simple, une dépendance de plus ne se
// justifie pas pour ça.
const PARTICLE_COUNT = 46;
const LINK_DISTANCE = 130;
const SPEED = 0.12;

type Particle = { x: number; y: number; vx: number; vy: number };

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    // Respect de la préférence système : pas d'animation, et donc pas de
    // canvas du tout plutôt qu'une première frame statique qui n'ajouterait
    // rien.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let animationFrame = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container!.clientWidth;
      height = container!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      }));
    }

    function step() {
      ctx!.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const a = particles[i]!;
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < LINK_DISTANCE) {
            ctx!.strokeStyle = `rgba(56, 189, 248, ${0.14 * (1 - distance / LINK_DISTANCE)})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const particle of particles) {
        ctx!.fillStyle = "rgba(148, 163, 184, 0.45)";
        ctx!.beginPath();
        ctx!.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
        ctx!.fill();
      }

      animationFrame = requestAnimationFrame(step);
    }

    resize();
    init();
    step();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    />
  );
}
