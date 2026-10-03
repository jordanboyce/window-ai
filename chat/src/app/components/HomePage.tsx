import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSEOData, seoConfigs } from '../hooks/useSEOData';
import './HomePage.css';

// Capability pills — the suite of built-in AI APIs, shown under the hero.
// Each links to its demo/docs route (inside the app shell).
const PILLS: { label: string; href: string }[] = [
  { label: 'Chat', href: '/chat' },
  { label: 'Summarize', href: '/summary' },
  { label: 'Translate', href: '/translate' },
  { label: 'Multimodal', href: '/multimodal' },
  { label: 'Embeddings', href: '/embeddings' },
  { label: 'Proofread', href: '/proofreader' },
  { label: 'Write & Rewrite', href: '/writer' },
];


export const HomePage: React.FC = () => {
  useSEOData(seoConfigs.home, '/');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas scanning-grid animation. Self-contained rAF loop + resize handler,
  // all torn down on unmount via an `alive` guard.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let alive = true;
    let rafId = 0;

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, w, h };
    };

    let { ctx, w, h } = fit();
    const onResize = () => {
      const f = fit();
      ctx = f.ctx;
      w = f.w;
      h = f.h;
    };
    window.addEventListener('resize', onResize);

    const gap = 44;
    const loop = (t: number) => {
      if (!alive || !ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(96,165,250,.06)';
      const off = (t * 0.02) % gap;
      for (let x = -off; x < w; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = -off; y < h; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      const cx = ((t * 0.00007) % 1) * (w + 400) - 200;
      const g = ctx.createLinearGradient(cx - 170, 0, cx + 170, h);
      g.addColorStop(0, 'rgba(59,130,246,0)');
      g.addColorStop(0.5, 'rgba(96,165,250,.10)');
      g.addColorStop(1, 'rgba(147,51,234,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="landing-root">
      <canvas ref={canvasRef} className="landing-canvas" />
      <div className="landing-glow" />

      {/* Top bar */}
      <div className="landing-topbar">
        <Link
          to="/"
          aria-label="Browser AI Lab — Home"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
        >
          <div className="landing-logo-tile">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="landing-brand">Browser AI Lab</span>
        </Link>
        <div className="landing-nav">
          <Link to="/status" className="landing-nav-link">
            Check your browser
          </Link>
          <Link to="/status" className="landing-nav-link">
            Demos
          </Link>

        </div>
      </div>

      {/* Hero */}
      <div className="landing-hero">
        <div className="landing-badge">
          <span className="landing-badge-dot" />
          REAL BROWSER APIS · REAL RESULTS
        </div>
        <h1 className="landing-h1">
          AI that runs <span className="landing-morph">in your browser.</span>
        </h1>
        <p className="landing-subtitle">
          This page calls your browser's built-in APIs. Chrome provides the model or
          language pack; you see the real result—or a clear reason it cannot run.
          The core demos need no app-server AI or API key.
        </p>
        <div className="landing-explainer" aria-label="How this demo works">
          <div><strong>01 · Your input</strong><span>Enter a sentence, image, or prompt.</span></div>
          <div><strong>02 · Browser API</strong><span>The browser processes it with a downloaded model or language pack.</span></div>
          <div><strong>03 · Real output</strong><span>See the result and whether this browser supports the feature.</span></div>
        </div>
        <p className="landing-why"><strong>Why it matters:</strong> These APIs can keep eligible tasks on your device instead of sending your input to an app's AI server. Support, downloads, and flags vary by API.</p>
        <div className="landing-cta-row">
          <Link to="/status" className="landing-cta-primary">
            Check your browser
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link to="/translate/translate-demo" className="landing-cta-secondary">
            Try translation
          </Link>
        </div>
      </div>

      {/* Pills */}
      <div className="landing-pills">
        {PILLS.map((p) => (
          <Link key={p.href} to={p.href} className="landing-pill">
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
