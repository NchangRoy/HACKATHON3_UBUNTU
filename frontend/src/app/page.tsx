"use client";
import Link from "next/link";

const C = {
  blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
};

type Statut = "CONTESTE" | "PROB_VRAI" | "PROB_FAUX" | "CONFIRME" | "REFUTE";

const statusMap: Record<Statut, { label: string; bg: string; color: string; dot: string; accent: string }> = {
  CONTESTE: { label: "Contesté", bg: "#fefce8", color: "#854d0e", dot: "#ca8a04", accent: "#eab308" },
  PROB_VRAI: { label: "Probablement vrai", bg: "#f0fdf4", color: "#166534", dot: "#16a34a", accent: "#22c55e" },
  PROB_FAUX: { label: "Probablement faux", bg: "#fff7ed", color: "#9a3412", dot: "#ea580c", accent: "#f97316" },
  CONFIRME: { label: "Confirmé", bg: "#f0fdf4", color: "#166534", dot: "#15803d", accent: "#16a34a" },
  REFUTE: { label: "Réfuté", bg: "#fef2f2", color: "#991b1b", dot: "#ef4444", accent: "#ef4444" },
};

const claims = [
  { id: "c1", texte: "Une fuite d'eau s'est produite rue Melen.", statut: "CONFIRME" as Statut, confiance: 0.95, score_ml: 0.88, pour: 12, contre: 0, cat: "Environnement", time: "1h" },
  { id: "c2", texte: "L'eau qui fuit rue Melen est contaminée et dangereuse pour la santé.", statut: "PROB_VRAI" as Statut, confiance: 0.72, score_ml: 0.65, pour: 4, contre: 1, cat: "Santé", time: "15 min" },
  { id: "c3", texte: "Deux enfants ont été intoxiqués après avoir joué dans l'eau.", statut: "CONTESTE" as Statut, confiance: 0.45, score_ml: 0.35, pour: 1, contre: 2, cat: "Santé", time: "30 min" },
  { id: "c4", texte: "La CDE a une équipe en intervention sur place.", statut: "PROB_VRAI" as Statut, confiance: 0.80, score_ml: 0.90, pour: 3, contre: 0, cat: "Sécurité", time: "10 min" },
];

const catColors: Record<string, { bg: string; color: string }> = {
  "Santé": { bg: "#fce7f3", color: "#9d174d" },
  "Politique": { bg: "#ede9fe", color: "#5b21b6" },
  "Économie": { bg: "#ecfdf5", color: "#065f46" },
  "Sécurité": { bg: "#fff7ed", color: "#9a3412" },
  "Environnement": { bg: "#f0fdf4", color: "#166534" },
};

function ClaimCard({ c }: { c: typeof claims[0] }) {
  const s = statusMap[c.statut];
  const cat = catColors[c.cat] ?? { bg: C.slate100, color: C.slate700 };
  const mlColor = c.score_ml < 0.3 ? "#ef4444" : c.score_ml < 0.5 ? "#f97316" : "#22c55e";

  return (
    <Link href={`/rumeur/${c.id}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          background: "#ffffff",
          border: `1px solid ${C.slate200}`,
          borderTop: `4px solid ${s.accent}`, // Moved accent to top for grid cards
          borderRadius: 8,
          padding: "20px 24px",
          cursor: "pointer",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
          transition: "all 0.2s ease",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: 1, // Take full height
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)";
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.borderColor = C.slate300;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(15, 23, 42, 0.04)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = C.slate200;
        }}
      >
        {/* ── Ligne 1 : tags + temps ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
              background: cat.bg, color: cat.color, textTransform: "uppercase", letterSpacing: "0.06em",
              border: `1px solid rgba(0,0,0,0.05)`
            }}>{c.cat}</span>

            {/* Statut badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
              background: s.bg, color: s.color,
              border: `1px solid rgba(0,0,0,0.05)`
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0, boxShadow: `0 0 0 2px ${s.bg}` }} />
              {s.label}
            </span>
          </div>
        </div>

        {/* ── Ligne 2 : texte principal ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <p style={{
            fontSize: 16, fontWeight: 600, color: C.slate900, lineHeight: 1.5,
            letterSpacing: "-0.2px", margin: "4px 0 0 0"
          }}>
            {c.texte}
          </p>
          <span style={{ fontSize: 13, color: C.slate400, fontWeight: 500, fontStyle: "italic", marginTop: 8 }}>Mis à jour il y a {c.time}</span>
        </div>

        {/* ── Ligne 3 : métriques ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 16, borderTop: `1px dashed ${C.slate200}` }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            {/* Score ML */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: C.slate500, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Conf. {Math.round(c.confiance * 100)}%</span>
              <div style={{ width: 1, height: 12, background: C.slate200 }} />
              <div style={{ width: 40, height: 6, background: C.slate100, borderRadius: 3, overflow: "hidden", border: `1px solid ${C.slate200}` }}>
                <div style={{ width: `${c.score_ml * 100}%`, height: "100%", background: mlColor }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: mlColor, fontFamily: "monospace" }}>{c.score_ml.toFixed(2)}</span>
            </div>

            {/* Chevron à droite */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.blue600, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.blue50, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sources */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", padding: "4px 8px", borderRadius: 6, border: "1px solid #bbf7d0" }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>{c.pour} Validations</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef2f2", padding: "4px 8px", borderRadius: 6, border: "1px solid #fecaca" }}>
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#991b1b" }}>{c.contre} Réfutations</span>
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}

export default function PublicHome() {
  return (
    <div style={{
      minHeight: "100vh", backgroundColor: C.slate50, display: "flex", flexDirection: "column",
      backgroundImage: "radial-gradient(#cbd5e1 2px, transparent 2px)",
      backgroundSize: "24px 24px"
    }}>

      {/* ── Navbar ── */}
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.slate200}`, position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, background: C.slate900, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: C.slate900, letterSpacing: "-0.3px" }}>FakeCheckAI</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {["Rumeurs actives", "Méthodologie", "Documentation"].map(n => (
              <Link key={n} href="#" style={{ padding: "6px 12px", fontSize: 13, fontWeight: 500, color: C.slate600, borderRadius: 6, textDecoration: "none", transition: "color .15s" }}
                onMouseEnter={e => e.currentTarget.style.color = C.slate900}
                onMouseLeave={e => e.currentTarget.style.color = C.slate600}
              >
                {n}
              </Link>
            ))}
            <div style={{ width: 1, height: 16, background: C.slate200, margin: "0 8px" }} />
            <Link href="/login" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, color: C.slate700, borderRadius: 6, textDecoration: "none", border: `1px solid ${C.slate300}`, transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = C.slate50; e.currentTarget.style.borderColor = C.slate400; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.slate300; }}
            >
              Espace membre
            </Link>
            <Link href="/register" style={{ padding: "8px 16px", background: C.slate900, color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 6, textDecoration: "none", border: "1px solid transparent", transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.slate800}
              onMouseLeave={e => e.currentTarget.style.background = C.slate900}
            >
              Rejoindre
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background: "#fff", borderBottom: `1px solid ${C.slate200}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 32px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24, marginBottom: 28 }}>
            <div style={{ maxWidth: 600 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: C.slate900, letterSpacing: "-0.5px", lineHeight: 1.2 }}>
                Registre public des signalements
              </h1>
              <p style={{ fontSize: 14, color: C.slate500, marginTop: 8, lineHeight: 1.6 }}>
                Traçabilité des affirmations analysées par notre modèle prédictif et qualifiées par notre réseau de modérateurs humains. L'intégrité de chaque verdict est garantie.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 0, border: `1px solid ${C.slate200}`, borderRadius: 6, overflow: "hidden" }}>
              {[["24", "En cours", C.slate700], ["187", "Réfutés ce mois", "#166534"], ["1 203", "Sources vérifiées", C.blue700]].map(([v, l, color], i) => (
                <div key={l} style={{
                  padding: "16px 24px", textAlign: "left", background: "#fff",
                  borderLeft: i > 0 ? `1px solid ${C.slate200}` : "none",
                }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: "-0.5px" }}>{v}</div>
                  <div style={{ fontSize: 11, color: C.slate500, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filtres catégories */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              { label: "Tous", active: true },
              { label: "Santé", active: false },
              { label: "Politique", active: false },
              { label: "Économie", active: false },
              { label: "Sécurité", active: false },
              { label: "Environnement", active: false },
            ].map(f => (
              <button key={f.label} style={{
                padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                border: `1px solid ${f.active ? C.slate900 : C.slate200}`,
                background: f.active ? C.slate900 : "#fff",
                color: f.active ? "#fff" : C.slate600, cursor: "pointer",
                transition: "all .15s",
              }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grille de cartes ── */}
      <main style={{ flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {claims.map(c => <ClaimCard key={c.id} c={c} />)}
        </div>


      </main>
    </div>
  );
}
