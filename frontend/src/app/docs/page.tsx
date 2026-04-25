"use client";
import Link from "next/link";

const C = {
  blue600: "#2563eb", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569",
  slate700: "#334155", slate800: "#1e293b", slate900: "#0f172a",
  green600: "#16a34a", green50: "#f0fdf4", green100: "#dcfce7",
  orange600: "#ea580c", orange50: "#fff7ed",
  red600: "#dc2626", red50: "#fef2f2",
};

const methodColors: Record<string, { bg: string; color: string }> = {
  GET: { bg: C.green50, color: C.green600 },
  POST: { bg: C.blue50, color: C.blue600 },
  DELETE: { bg: C.red50, color: C.red600 },
};

const endpoints = [
  { method: "GET", path: "/api/rumors", desc: "Lister toutes les rumeurs (filtrable par thème, lieu)" },
  { method: "POST", path: "/api/rumors", desc: "Soumettre une nouvelle rumeur" },
  { method: "GET", path: "/api/rumors/{id}", desc: "Détail d'une rumeur spécifique" },
  { method: "GET", path: "/api/claims", desc: "Lister tous les claims atomiques" },
  { method: "POST", path: "/api/claims", desc: "Créer un claim atomique pour une rumeur" },
  { method: "GET", path: "/api/claims/{id}", desc: "Détail d'un claim" },
  { method: "POST", path: "/api/claims/{id}/verdict", desc: "Émettre un verdict sur un claim (modérateur requis)" },
  { method: "GET", path: "/api/claims/{id}/audit", desc: "Rapport d'audit complet horodaté d'un claim" },
  { method: "GET", path: "/api/verdicts", desc: "Lister tous les verdicts publiés" },
  { method: "GET", path: "/api/verdicts/{id}", desc: "Détail d'un verdict" },
  { method: "POST", path: "/api/verdicts", desc: "Créer un verdict avec preuves liées" },
  { method: "GET", path: "/api/evidence", desc: "Lister toutes les preuves" },
  { method: "POST", path: "/api/evidence", desc: "Soumettre une preuve (image, vidéo, texte, audio)" },
  { method: "GET", path: "/api/evidence/{id}", desc: "Preuves associées à une rumeur" },
  { method: "POST", path: "/api/auth/login", desc: "Authentification — retourne un token JWT" },
  { method: "POST", path: "/api/auth/register", desc: "Créer un nouveau compte utilisateur" },
  { method: "GET", path: "/api/themes", desc: "Lister les thèmes disponibles" },
];

export default function DocsPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.slate50, backgroundImage: "radial-gradient(#cbd5e1 2px, transparent 2px)", backgroundSize: "24px 24px" }}>
      {/* Navbar */}
      <header style={{ position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 24px)", maxWidth: 1100, zIndex: 100, background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: C.slate900, letterSpacing: "-0.5px" }}>FakeCheck</span>
          </Link>
          <nav style={{ display: "flex", gap: 8 }}>
            {[{ label: "Rumeurs", href: "/#registre" }, { label: "Méthode", href: "/methode" }, { label: "Docs", href: "/docs" }].map(n => (
              <Link key={n.href} href={n.href} style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: n.href === "/docs" ? C.blue600 : C.slate600, borderRadius: 8, textDecoration: "none", background: n.href === "/docs" ? C.blue50 : "transparent" }}>{n.label}</Link>
            ))}
            <Link href="/login" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700, background: C.slate900, color: "#fff", borderRadius: 8, textDecoration: "none" }}>Connexion</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "120px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-block", padding: "6px 16px", background: C.blue50, color: C.blue600, borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>
            API Reference
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: C.slate900, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 16 }}>Documentation</h1>
          <p style={{ fontSize: 16, color: C.slate500, lineHeight: 1.7 }}>
            API REST — Base URL : <code style={{ background: C.slate100, padding: "2px 8px", borderRadius: 6, fontFamily: "monospace", fontSize: 14, color: C.blue600 }}>https://hackverse-2026.vercel.app</code>
          </p>
        </div>

        {/* Auth note */}
        <div style={{ background: C.orange50, border: `1px solid #fed7aa`, borderRadius: 12, padding: "16px 20px", marginBottom: 32, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke={C.orange600} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <div style={{ fontWeight: 700, color: C.orange600, fontSize: 14, marginBottom: 4 }}>Authentification requise</div>
            <div style={{ fontSize: 13, color: "#92400e" }}>La plupart des endpoints POST nécessitent un header <code style={{ background: "#fed7aa", padding: "1px 6px", borderRadius: 4 }}>Authorization: Bearer &lt;token&gt;</code> obtenu via <strong>/api/auth/login</strong>.</div>
          </div>
        </div>

        {/* Endpoints */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {endpoints.map((ep, i) => {
            const mc = methodColors[ep.method] || { bg: C.slate100, color: C.slate600 };
            return (
              <div key={i} style={{ background: "#fff", border: `1px solid ${C.slate200}`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, transition: "box-shadow .2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: mc.bg, color: mc.color, fontFamily: "monospace", flexShrink: 0, minWidth: 52, textAlign: "center" }}>
                  {ep.method}
                </span>
                <code style={{ fontFamily: "monospace", fontSize: 14, color: C.slate900, fontWeight: 600, flex: 1 }}>{ep.path}</code>
                <span style={{ fontSize: 13, color: C.slate500, textAlign: "right", flexShrink: 0, maxWidth: 280 }}>{ep.desc}</span>
              </div>
            );
          })}
        </div>

        {/* Modèles de données */}
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.slate900, marginBottom: 20, letterSpacing: "-0.5px" }}>Statuts de verdict</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { v: "True", label: "Confirmé", color: C.green600, bg: C.green50 },
              { v: "False", label: "Réfuté", color: C.red600, bg: C.red50 },
              { v: "ProbablyTrue", label: "Probablement vrai", color: C.blue600, bg: C.blue50 },
              { v: "Contested", label: "Contesté", color: C.orange600, bg: C.orange50 },
              { v: "Unverifiable", label: "Non vérifiable", color: C.slate600, bg: C.slate100 },
            ].map(s => (
              <div key={s.v} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <code style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: s.color }}>{s.v}</code>
                <span style={{ fontSize: 13, color: C.slate600 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
