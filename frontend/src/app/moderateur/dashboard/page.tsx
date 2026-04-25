"use client";
import Link from "next/link";
import { useState } from "react";

const C = {
  blue600: "#2563eb", blue700: "#1d4ed8", blue50: "#eff6ff", blue100: "#dbeafe",
  slate50: "#f8fafc", slate100: "#f1f5f9", slate200: "#e2e8f0", slate300: "#cbd5e1",
  slate400: "#94a3b8", slate500: "#64748b", slate600: "#475569", slate700: "#334155",
  slate800: "#1e293b", slate900: "#0f172a", slate950: "#020617",
  sidebar: "#020617", sidebarBorder: "rgba(255,255,255,0.05)",
  accent: "#38bdf8", accentGlow: "rgba(56, 189, 248, 0.2)"
};

type Statut = "CONTESTE" | "PROB_VRAI" | "PROB_FAUX" | "CONFIRME" | "REFUTE";

const statusMap: Record<Statut, { label: string; bg: string; color: string; dot: string; glow: string }> = {
  CONTESTE: { label: "Contesté", bg: "rgba(234, 179, 8, 0.05)", color: "#eab308", dot: "#eab308", glow: "rgba(234, 179, 8, 0.4)" },
  PROB_VRAI: { label: "Prob. Vrai", bg: "rgba(34, 197, 94, 0.05)", color: "#22c55e", dot: "#22c55e", glow: "rgba(34, 197, 94, 0.4)" },
  PROB_FAUX: { label: "Prob. Faux", bg: "rgba(249, 115, 22, 0.05)", color: "#f97516", dot: "#f97516", glow: "rgba(249, 115, 22, 0.4)" },
  CONFIRME: { label: "Confirmé", bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e", dot: "#22c55e", glow: "rgba(34, 197, 94, 0.6)" },
  REFUTE: { label: "Réfuté", bg: "rgba(239, 68, 68, 0.05)", color: "#ef4444", dot: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" },
};

const claims = [
  { id: "c2", texte: "L'eau qui fuit rue Melen est contaminée et dangereuse pour la santé.", statut: "PROB_VRAI" as Statut, score_ml: 0.65, pour: 4, contre: 1, assignee: "Moi", urgent: true, time: "15 min", cat: "Santé" },
  { id: "c3", texte: "Deux enfants ont été intoxiqués après avoir joué dans l'eau.", statut: "CONTESTE" as Statut, score_ml: 0.35, pour: 1, contre: 2, assignee: "Moi", urgent: true, time: "30 min", cat: "Santé" },
  { id: "c1", texte: "Une fuite d'eau s'est produite rue Melen.", statut: "CONFIRME" as Statut, score_ml: 0.88, pour: 12, contre: 0, assignee: "Non assigné", urgent: false, time: "1h", cat: "Environnement" },
  { id: "c4", texte: "La CDE a une équipe en intervention sur place.", statut: "PROB_VRAI" as Statut, score_ml: 0.90, pour: 3, contre: 0, assignee: "M. Kamara", urgent: false, time: "10 min", cat: "Sécurité" },
];

const alerts = [
  { id: 1, msg: "Spike de signalements vidéos sur #c1 (+800% en 15m)", time: "2 min", type: "spike" },
  { id: 2, msg: "Témoignage professionnel médical détecté sur #c3", time: "12 min", type: "accounts" },
  { id: 3, msg: "Déclaration officielle CDE contredit #c2", time: "30 min", type: "dedup" },
];

function Badge({ statut }: { statut: Statut }) {
  const s = statusMap[statut];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20, background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 800, whiteSpace: "nowrap",
      border: `1px solid ${s.color}20`,
      boxShadow: `0 0 10px ${s.glow}`
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0, boxShadow: `0 0 8px ${s.dot}` }} />
      {s.label.toUpperCase()}
    </span>
  );
}

function NavItem({ href, label, icon, active, badge }: { href: string; label: string; icon: React.ReactNode; active?: boolean; badge?: string }) {
  return (
    <Link href={href} style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
      fontSize: 13, fontWeight: active ? 700 : 500,
      color: active ? "#fff" : C.slate400,
      background: active ? `linear-gradient(90deg, ${C.slate800}, ${C.slate900})` : "transparent",
      border: active ? `1px solid rgba(255,255,255,0.08)` : "1px solid transparent",
      textDecoration: "none", transition: "all .2s ease",
      boxShadow: active ? `0 4px 12px rgba(0,0,0,0.2)` : "none"
    }}
      onMouseEnter={e => !active && (e.currentTarget.style.color = "#fff")}
      onMouseLeave={e => !active && (e.currentTarget.style.color = C.slate400)}
    >
      <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge && (
        <span style={{ background: C.blue600, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 10, boxShadow: `0 0 10px ${C.blue600}40` }}>{badge}</span>
      )}
    </Link>
  );
}

export default function ModDashboard() {
  const [tab, setTab] = useState<"file" | "mes" | "alertes">("file");

  return (
    <div style={{ 
      minHeight: "100vh", display: "flex", background: C.slate50,
      backgroundImage: `radial-gradient(${C.slate300} 2px, transparent 2px)`,
      backgroundSize: "24px 24px"
    }} >

      {/* ── Sidebar (Futuristic Mode) ── */}
      <aside style={{
        width: 240, background: C.slate950, borderRight: `1px solid ${C.sidebarBorder}`,
        display: "flex", flexDirection: "column", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh",
        overflow: "hidden"
      }}>
        {/* Subtle grid pattern background */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.03, pointerEvents: "none",
          backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />

        {/* Logo */}
        <div style={{ position: "relative", padding: "0 20px", height: 60, display: "flex", alignItems: "center", borderBottom: `1px solid ${C.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.5px" }}>FakeCheckAI</span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ position: "relative", flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 4 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.slate500, letterSpacing: "0.05em", textTransform: "uppercase", padding: "8px 12px 4px", marginTop: 4 }}>Opérations</p>
          <NavItem href="/moderateur/dashboard" label="File globale" active icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} />
          <NavItem href="#" label="Mes attributions" badge="2" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} />
          <NavItem href="#" label="Alertes Système" badge="3" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} />

          <p style={{ fontSize: 11, fontWeight: 600, color: C.slate500, letterSpacing: "0.05em", textTransform: "uppercase", padding: "16px 12px 4px" }}>Ressources</p>
          <NavItem href="#" label="Base de connaissances" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>} />
          <NavItem href="#" label="Audit Log" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
          <NavItem href="/" label="Portail public" icon={<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>} />
        </nav>

        {/* Profil */}
        <div style={{ position: "relative", padding: 16, borderTop: `1px solid ${C.sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px", borderRadius: 6, background: C.slate800 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: C.blue600, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              AM
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>A. Modérateur</p>
              <p style={{ fontSize: 11, color: C.slate400, fontFamily: "monospace" }}>NIV. 3</p>
            </div>
            <Link href="/login" title="Déconnexion" style={{ color: C.slate400, lineHeight: 0, padding: 4, transition: "color .15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = C.slate400}
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Contenu ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Topbar (Harmonisée Glassmorphism) */}
        <header style={{
          height: 56, margin: "12px 16px 0", 
          background: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.5)", borderRadius: 12,
          display: "flex", alignItems: "center", gap: 16, padding: "0 20px",
          position: "sticky", top: 12, zIndex: 100,
          boxShadow: `0 4px 20px ${C.slate900}05`
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.slate400} strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search" placeholder="Rechercher par ID, source, mot-clé…"
              style={{ width: "100%", paddingLeft: 36, paddingRight: 14, paddingTop: 8, paddingBottom: 8, border: `1px solid ${C.slate300}`, borderRadius: 6, fontSize: 13, outline: "none", background: "#fff", transition: "border-color .15s, box-shadow .15s" }}
              onFocus={e => { e.target.style.borderColor = C.blue600; e.target.style.boxShadow = "0 0 0 3px #2563eb15"; }}
              onBlur={e => { e.target.style.borderColor = C.slate300; e.target.style.boxShadow = "none"; }}
            />
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", padding: 8, borderRadius: 6, border: `1px solid ${C.slate200}`, background: "#fff", lineHeight: 0, cursor: "pointer", transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.slate50}
              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={C.slate600} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
            </button>

            <Link href="/" style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", border: `1px solid ${C.slate200}`,
              background: "#fff", color: C.slate700,
              fontSize: 13, fontWeight: 600, borderRadius: 10, textDecoration: "none",
              transition: "all .2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.slate50; e.currentTarget.style.borderColor = C.slate300; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.slate200; }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quitter le Dashboard
            </Link>

            <Link href="/moderateur/verdict/new" style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", background: C.slate950, color: "#fff",
              fontSize: 13, fontWeight: 700, borderRadius: 10, textDecoration: "none",
              transition: "all .2s", boxShadow: `0 4px 12px ${C.slate900}40`
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.slate800; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.slate950; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Créer un dossier
            </Link>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main style={{ padding: "32px 24px", display: "flex", gap: 24, flex: 1, alignItems: "flex-start", flexWrap: "wrap", minWidth: 0 }}>

          {/* Colonne gauche (File principale) */}
          <div style={{ flex: "1 1 600px", minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header de section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: C.slate900, letterSpacing: "-0.4px" }}>File de modération globale</h1>
                <p style={{ fontSize: 13, color: C.slate500, marginTop: 4 }}>32 dossiers en attente d'évaluation (Triage par criticité ML)</p>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", background: C.slate200, padding: 3, borderRadius: 6 }}>
                {[
                  { id: "file", label: "File (32)" },
                  { id: "mes", label: "Mes dossiers (2)" },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                    padding: "6px 16px", fontSize: 12, fontWeight: 700,
                    background: tab === t.id ? "#fff" : "transparent",
                    color: tab === t.id ? C.slate900 : C.slate500,
                    border: "none", borderRadius: 6, cursor: "pointer",
                    boxShadow: tab === t.id ? `0 2px 8px ${C.slate900}15` : "none",
                    transition: "all .2s"
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table des claims */}
            <div style={{ 
              background: "#fff", 
              border: `1px solid ${C.slate200}`, 
              borderRadius: 16, 
              overflow: "hidden", 
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.04), 0 0 20px rgba(56, 189, 248, 0.03)" 
            }}>
              <div style={{ minWidth: 760 }}>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "minmax(260px, 1fr) 140px 100px 120px 100px", 
                  padding: "16px", 
                  background: C.slate950, 
                  fontSize: 10, 
                  fontWeight: 800, 
                  color: "rgba(255,255,255,0.5)", 
                  textTransform: "uppercase", 
                  letterSpacing: "0.1em" 
                }}>
                  <div>Signalement</div>
                  <div>Statut</div>
                  <div>Score IA</div>
                  <div>Assignation</div>
                  <div style={{ textAlign: "right" }}>Action</div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  {claims.filter(c => tab === "mes" ? c.assignee === "Moi" : true).map((c, i) => (
                    <div key={c.id} style={{
                      display: "grid", gridTemplateColumns: "minmax(260px, 1fr) 140px 100px 120px 100px",
                      padding: "16px", borderBottom: i === claims.length - 1 ? "none" : `1px solid ${C.slate100}`,
                      alignItems: "center", background: c.urgent ? "rgba(239, 68, 68, 0.02)" : "#fff",
                      transition: "all .2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = C.slate50; e.currentTarget.style.transform = "scale(1.002)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = c.urgent ? "rgba(239, 68, 68, 0.02)" : "#fff"; e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      {/* Signalement */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingRight: 20 }}>
                        <div style={{ marginTop: 2 }}>
                          {c.urgent ? (
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 0 3px #fee2e2" }} title="Urgent" />
                          ) : (
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.slate300 }} />
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: C.slate900, lineHeight: 1.4 }}>
                            {c.texte}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.slate500 }}>
                            <span style={{ fontFamily: "monospace", color: C.slate400 }}>{c.id}</span>
                            <span>•</span>
                            <span>{c.cat}</span>
                            <span>•</span>
                            <span>{c.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Statut */}
                      <div>
                        <Badge statut={c.statut} />
                      </div>

                      {/* Score ML */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{
                          padding: "4px 8px", borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center",
                          background: c.score_ml < 0.3 ? "rgba(239, 68, 68, 0.1)" : c.score_ml < 0.5 ? "rgba(249, 115, 22, 0.1)" : "rgba(34, 197, 94, 0.1)",
                          color: c.score_ml < 0.3 ? "#ef4444" : c.score_ml < 0.5 ? "#f97316" : "#22c55e",
                          border: `1px solid rgba(255,255,255,0.05)`,
                          fontSize: 11, fontWeight: 900, fontFamily: "monospace",
                          boxShadow: `inset 0 0 10px ${c.score_ml < 0.3 ? "#ef444420" : c.score_ml < 0.5 ? "#f9731620" : "#22c55e20"}`
                        }}>
                          {(c.score_ml * 100).toFixed(0)}%
                        </div>
                      </div>

                      {/* Assignation */}
                      <div style={{ fontSize: 12, color: C.slate700, display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ 
                          width: 20, height: 20, borderRadius: 6, 
                          background: c.assignee === "Non assigné" ? C.slate200 : `linear-gradient(135deg, ${C.blue600}, ${C.blue700})`, 
                          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", 
                          fontSize: 10, fontWeight: 800, border: "1px solid rgba(255,255,255,0.1)"
                        }}>
                          {c.assignee === "Non assigné" ? "?" : c.assignee[0]}
                        </div>
                        <span style={{ fontWeight: 500 }}>{c.assignee}</span>
                      </div>

                      {/* Action */}
                      <div style={{ textAlign: "right" }}>
                        <Link href={`/rumeur/${c.id}`} style={{
                          display: "inline-block", padding: "6px 14px", border: `1px solid ${C.slate200}`, 
                          borderRadius: 6, fontSize: 11, fontWeight: 700, color: C.slate700, 
                          textDecoration: "none", background: "#fff", transition: "all .2s",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = C.slate50; e.currentTarget.style.borderColor = C.slate300; e.currentTarget.style.transform = "translateY(-1px)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.slate200; e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                          Traiter
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "12px 16px", background: C.slate50, borderTop: `1px solid ${C.slate200}`, textAlign: "center", fontSize: 12, color: C.slate500 }}>
                  Affichage de {claims.length} résultats sur 32
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite (Alertes) */}
          <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 16, flexShrink: 0 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: C.slate900, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Rapport d'anomalies ML
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {alerts.map(a => {
                let icon;
                if (a.type === "spike") icon = <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />;
                else if (a.type === "accounts") icon = <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
                else icon = <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />;

                return (
                  <div key={a.id} style={{
                    background: "#fff", 
                    border: `1px solid ${C.slate200}`, 
                    borderRadius: 12, 
                    padding: "16px",
                    display: "flex", gap: 12, alignItems: "flex-start", 
                    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                    transition: "all .2s"
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = `0 0 15px ${C.accent}20`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.slate200; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)"; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: C.slate950, 
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      boxShadow: `0 0 10px ${C.slate900}40`
                    }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={C.accent} strokeWidth={2.5}>
                        {icon}
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.slate900, lineHeight: 1.4 }}>{a.msg}</p>
                      <p style={{ fontSize: 11, color: C.slate400, marginTop: 4, fontWeight: 500 }}>{a.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
