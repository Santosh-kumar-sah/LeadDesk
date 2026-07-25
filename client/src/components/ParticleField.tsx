import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  colorRatio: number; // 0 = blue (#3B82F6), 1 = violet (#8B5CF6)
}

export const ParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check accessibility & device settings
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    
    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // Setup particles based on screen size
    const particleCount = prefersReducedMotion ? 0 : isTouchDevice ? 25 : window.innerWidth < 768 ? 30 : 75;
    let particles: Particle[] = [];

    const initParticles = (w: number, h: number) => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const vx = (Math.random() - 0.5) * 0.6;
        const vy = (Math.random() - 0.5) * 0.6;
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx,
          vy,
          baseVx: vx,
          baseVy: vy,
          radius: Math.random() * 1.5 + 1.2,
          baseAlpha: Math.random() * 0.4 + 0.3,
          alpha: Math.random() * 0.4 + 0.3,
          colorRatio: 0,
        });
      }
    };

    // Resize handling
    const handleResize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      initParticles(width, height);
    };

    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Mouse position tracking relative to container
    const handleMouseMove = (e: MouseEvent) => {
      if (isTouchDevice || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
      
      // Update CSS variables for radial glow
      container.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      container.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // Visibility Observer to pause when scrolled out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Page Visibility API check
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
      } else {
        isVisible = true;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Animation Loop
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      if (prefersReducedMotion) {
        return;
      }

      const mouse = mouseRef.current;
      const attractionRadius = 160;
      const attractionRadiusSq = attractionRadius * attractionRadius;

      // Update & Draw Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Gravitational attraction toward cursor
        if (mouse.active && !isTouchDevice) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < attractionRadiusSq && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / attractionRadius) * 0.8;
            
            // Lerp velocity toward mouse
            const targetVx = (dx / dist) * force * 1.8;
            const targetVy = (dy / dist) * force * 1.8;

            p.vx += (targetVx - p.vx) * 0.08;
            p.vy += (targetVy - p.vy) * 0.08;

            // Increase alpha and shift color ratio to violet (#8B5CF6) near cursor
            p.colorRatio += (force - p.colorRatio) * 0.1;
            p.alpha += (p.baseAlpha + force * 0.5 - p.alpha) * 0.1;
          } else {
            // Return to ambient velocity
            p.vx += (p.baseVx - p.vx) * 0.04;
            p.vy += (p.baseVy - p.vy) * 0.04;
            p.colorRatio += (0 - p.colorRatio) * 0.05;
            p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          }
        } else {
          p.vx += (p.baseVx - p.vx) * 0.04;
          p.vy += (p.baseVy - p.vy) * 0.04;
          p.colorRatio += (0 - p.colorRatio) * 0.05;
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        // Move particle
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around screen boundaries smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Color interpolation: Electric Blue (#3B82F6 => rgb(59, 130, 246)) to Soft Violet (#8B5CF6 => rgb(139, 92, 246))
        const r = Math.round(59 + (139 - 59) * p.colorRatio);
        const g = Math.round(130 + (92 - 130) * p.colorRatio);
        const b = Math.round(246 + (246 - 246) * p.colorRatio);

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
        ctx.fill();

        // Draw constellation lines between close particles (spatial optimization)
        const lineDistSqLimit = 110 * 110;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ldx = p.x - p2.x;
          const ldy = p.y - p2.y;

          // Quick bounding box check before calculating square distance
          if (Math.abs(ldx) > 110 || Math.abs(ldy) > 110) continue;

          const ldistSq = ldx * ldx + ldy * ldy;
          if (ldistSq < lineDistSqLimit) {
            const ldist = Math.sqrt(ldistSq);
            const lineAlpha = (1 - ldist / 110) * 0.25 * Math.min(p.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "30%",
        } as React.CSSProperties
      }
    >
      {/* Dynamic Cursor Glow Layer */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-60"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.08), rgba(139, 92, 246, 0.03) 40%, transparent 80%)`,
        }}
      />
      <canvas ref={canvasRef} className="w-full h-full block relative z-10" />
    </div>
  );
};
