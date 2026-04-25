"use client";
import Link from "next/link";

const C = {
  blue500: "#3b82f6", blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a",
  green600: "#16a34a", red600: "#dc2626"
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
          borderRadius: 20,
          padding: "24px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: 1,
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = "0 20px 40px rgba(15, 23, 42, 0.08)";
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.borderColor = C.blue100;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.03)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.borderColor = C.slate200;
        }}
      >
        {/* Barre d'accentuation discrète */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: s.accent }} />

        {/* ── Header : Catégorie & Statut ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20,
            background: cat.bg, color: cat.color, textTransform: "uppercase", letterSpacing: "0.1em"
          }}>{c.cat}</span>

          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
            background: s.bg, color: s.color, border: `1px solid ${s.accent}20`
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
            {s.label}
          </span>
        </div>

        {/* ── Corps : Titre & Temps ── */}
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: 17, fontWeight: 700, color: C.slate900, lineHeight: 1.4,
            letterSpacing: "-0.3px", margin: "0 0 8px 0"
          }}>
            {c.texte}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.slate400, fontSize: 12 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Il y a {c.time}
          </div>
        </div>

        {/* ── Footer : Métriques & IA ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 16, borderTop: `1px solid ${C.slate100}` }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: mlColor, fontFamily: "monospace" }}>{c.score_ml.toFixed(2)}</div>
                <div style={{ fontSize: 9, color: C.slate400, fontWeight: 700, textTransform: "uppercase" }}>IA</div>
              </div>
              <div style={{ width: 1, height: 20, background: C.slate100 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 10, color: C.slate500, fontWeight: 700, textTransform: "uppercase" }}>Confiance : {Math.round(c.confiance * 100)}%</div>
                <div style={{ width: 60, height: 4, background: C.slate100, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${c.score_ml * 100}%`, height: "100%", background: mlColor }} />
                </div>
              </div>
            </div>

            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.blue50, display: "flex", alignItems: "center", justifyContent: "center", color: C.blue600 }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, padding: "6px", borderRadius: 8, background: C.slate50, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.green600 }}>{c.pour}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: C.slate500 }}>Vérifiés</span>
            </div>
            <div style={{ flex: 1, padding: "6px", borderRadius: 8, background: C.slate50, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.red600 }}>{c.contre}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: C.slate500 }}>Réfutés</span>
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

      {/* ── Navbar (Glassmorphism) ── */}
      <header style={{
        position: "fixed", top: 12, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 24px)", maxWidth: 1100, zIndex: 100,
        background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.3)", borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)"
      }}>
        <div style={{ padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: C.slate900, letterSpacing: "-0.5px" }}>FakeCheckAI</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {["Rumeurs", "Méthode", "Docs"].map(n => (
              <Link key={n} href="#" style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: C.slate600, borderRadius: 8, textDecoration: "none", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.color = C.slate900; e.currentTarget.style.background = C.slate100; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.slate600; e.currentTarget.style.background = "transparent"; }}
              >
                {n}
              </Link>
            ))}
            <div style={{ width: 1, height: 16, background: C.slate200, margin: "0 10px" }} />
            <Link href="/login" style={{ padding: "8px 16px", fontSize: 13, fontWeight: 600, color: C.slate700, borderRadius: 8, textDecoration: "none", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.slate100}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              Connexion
            </Link>
            <Link href="/register" style={{ padding: "8px 18px", background: C.slate900, color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 8, textDecoration: "none", boxShadow: `0 4px 12px ${C.slate900}30`, transition: "transform .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.background = C.slate800; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = C.slate900; }}
            >
              S'inscrire
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero Section (Incurved Design) ── */}
      <section style={{
        position: "relative", width: "100%", padding: "160px 24px 140px",
        background: C.slate900, color: "#fff", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* L'image de fond générée */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/hero.png')", backgroundSize: "cover", backgroundPosition: "center", opacity: 0.2 }} />

        {/* Blobs décoratifs */}
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 400, height: 400, background: C.blue600, filter: "blur(120px)", opacity: 0.15, borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-5%", width: 300, height: 300, background: C.blue500, filter: "blur(100px)", opacity: 0.1, borderRadius: "50%" }} />

        {/* Dégradé radial central */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, transparent 0%, rgba(15,23,42,0.8) 100%)" }} />

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", zIndex: 10 }}>
          <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1, marginBottom: 24, maxWidth: 850, textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            Révélez la vérité. <br />
            <span style={{
              background: `linear-gradient(135deg, ${C.blue500}, ${C.blue100})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Atomisez la désinformation.</span>
          </h1>
          <p style={{ fontSize: 20, color: C.slate300, maxWidth: 650, lineHeight: 1.6, marginBottom: 44, fontWeight: 500 }}>
            FakeCheckAI combine l'analyse prédictive IA et une modération humaine traçable pour déconstruire les rumeurs à la source sur un registre immuable.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={() => window.scrollTo({ top: document.getElementById('registre')?.offsetTop || 800, behavior: 'smooth' })} style={{ padding: "16px 32px", background: C.slate800, color: "#fff", fontWeight: 700, borderRadius: 12, fontSize: 16, border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(22, 28, 40, 0.3)", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.background = C.slate900; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = C.slate900; }}
            >
              Explorer le Registre
            </button>
            <Link href="/register" style={{ padding: "16px 32px", background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, borderRadius: 12, fontSize: 16, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              Accès Membre
            </Link>
          </div>
        </div>

        {/* Masque incurvé (concave) */}
        <div style={{
          position: "absolute", bottom: -50, left: "-10%", right: "-10%", height: 160,
          background: C.slate50,
          backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
          backgroundSize: "24px 24px",
          borderRadius: "100% 100% 0 0",
          zIndex: 5
        }} />
      </section>

      {/* ── Stats & Registre ── */}
      <section id="registre" style={{ 
        position: "relative", zIndex: 10, marginTop: -40, overflow: "hidden",
        background: C.slate50,
        backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
        backgroundSize: "24px 24px"
      }}>
        {/* Background Decorative Blobs */}
        <div style={{ position: "absolute", top: "20%", left: "-10%", width: 500, height: 500, background: C.blue50, filter: "blur(100px)", opacity: 0.6, borderRadius: "50%", zIndex: 0, animation: "float 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: 400, height: 400, background: "#f0f9ff", filter: "blur(120px)", opacity: 0.5, borderRadius: "50%", zIndex: 0, animation: "float 20s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 800, height: 600, background: "radial-gradient(circle, rgba(239,246,255,0.8) 0%, transparent 70%)", zIndex: 0 }} />

        <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "60px 24px 32px", zIndex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 32, marginBottom: 48 }}>
            <div style={{ maxWidth: 500 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 4, background: C.blue600, borderRadius: 2 }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.blue600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Données en temps réel</span>
              </div>
              <h1 style={{ fontSize: 40, fontWeight: 900, color: C.slate900, letterSpacing: "-1.5px", lineHeight: 1 }}>
                Registre public <br /> des signalements
              </h1>
              <p style={{ fontSize: 16, color: C.slate500, marginTop: 16, lineHeight: 1.6, fontWeight: 500 }}>
                Chaque affirmation est décomposée en claims atomiques. L'intégrité des verdicts est garantie par notre protocole d'audit immuable.
              </p>
            </div>

            {/* Stats Cards Enhancement */}
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { v: "24", l: "EN COURS", c: C.slate900, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                { v: "1 203", l: "VÉRIFIÉS", c: C.blue600, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
              ].map((stat) => (
                <div key={stat.l} style={{
                  minWidth: 160, padding: "28px 24px", 
                  background: "rgba(255, 255, 255, 0.6)", 
                  backdropFilter: "blur(10px)",
                  borderRadius: 32,
                  boxShadow: `0 10px 40px ${C.slate900}08`, 
                  border: "1px solid rgba(255, 255, 255, 0.8)",
                  display: "flex", flexDirection: "column", gap: 16,
                  transition: "transform .3s ease",
                  cursor: "default"
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateY(-5px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ 
                    width: 40, height: 40, borderRadius: 12, background: stat.c + "10", 
                    color: stat.c, display: "flex", alignItems: "center", justifyContent: "center" 
                  }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: C.slate900, letterSpacing: "-1px", lineHeight: 1 }}>{stat.v}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: C.slate400, letterSpacing: "0.05em", marginTop: 4 }}>{stat.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filtres catégories (Modern Pills) */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.slate400, marginRight: 8 }}>Filtrer par :</span>
            {[
              { label: "Tous", active: true },
              { label: "Santé", active: false },
              { label: "Politique", active: false },
              { label: "Économie", active: false },
              { label: "Sécurité", active: false },
              { label: "Environnement", active: false }
            ].map(f => (
              <button key={f.label} style={{
                padding: "10px 20px", borderRadius: 100, fontSize: 14, fontWeight: 700,
                cursor: "pointer", transition: "all .2s",
                background: f.active ? C.slate900 : "#fff",
                color: f.active ? "#fff" : C.slate600,
                boxShadow: f.active ? `0 4px 12px ${C.slate900}20` : `0 2px 4px ${C.slate900}05`,
                border: f.active ? "none" : `1px solid ${C.slate200}`
              }}
                onMouseEnter={e => { if (!f.active) { e.currentTarget.style.background = C.slate100; e.currentTarget.style.borderColor = C.slate300; } }}
                onMouseLeave={e => { if (!f.active) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.slate200; } }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grille de cartes ── */}
      <main style={{ flex: 1, maxWidth: 1100, margin: "0 auto", width: "100%", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {claims.map(c => <ClaimCard key={c.id} c={c} />)}
        </div>


      </main>

      <style>{`
        @keyframes float {
          0% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -50px) rotate(2deg); }
          66% { transform: translate(-20px, 20px) rotate(-1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
